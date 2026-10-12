from flask import Blueprint, request, jsonify, current_app
from api.models import Tasks, TasksSchema, Books, Files, UserSettings, db
from api.decorators import required_params, auth_required
from sqlalchemy.exc import SQLAlchemyError
import threading
import string
import random
from datetime import datetime, timezone
import os
import csv
import json
from jinja2 import Environment, FileSystemLoader
from mastodon import Mastodon
from api.utils import get_current_user_id

tasks_endpoint = Blueprint('tasks', __name__)

def _create_task(type, data, created_by):
    new_task = Tasks(type=type, data=data, created_by=created_by)
    new_task.save_to_db()
    threading.Thread(target=_start_background_task, args=(current_app.app_context(), new_task.id, created_by,)).start()
    return new_task

def _start_background_task(app_context, task_id, claim):
    # Each worker owns its context and scoped session, including synchronous retries.
    with app_context:
        try:
            claimed = Tasks.query.filter_by(id=task_id, created_by=claim, status="fresh").update({
                Tasks.status: "started",
                Tasks.error_message: None,
                Tasks.updated_on: datetime.now(timezone.utc),
            }, synchronize_session=False)
            db.session.commit()
            if not claimed:
                return

            task = db.session.get(Tasks, task_id)
            handlers = {
                "csv_export": lambda: create_csv(claim),
                "json_export": lambda: create_json(claim),
                "html_export": lambda: create_html(claim),
                "share_book_event": lambda: share_book(claim, task.data),
            }
            if task.type not in handlers:
                raise ValueError("Unsupported background task type")
            handlers[task.type]()
            task.status = "success"
            task.error_message = None
            task.updated_on = datetime.now(timezone.utc)
            task.save_to_db()
        except Exception as error:
            # A failed flush/commit leaves the session unusable until rollback.
            # Store a safe category rather than exception text (which may contain credentials).
            message = ("Database operation failed." if isinstance(error, SQLAlchemyError)
                       else "Task execution failed. See application logs for details.")
            try:
                db.session.rollback()
                Tasks.query.filter_by(id=task_id, created_by=claim).update({
                    Tasks.status: "failed",
                    Tasks.error_message: message,
                    Tasks.updated_on: datetime.now(timezone.utc),
                }, synchronize_session=False)
                db.session.commit()
            except Exception:
                db.session.rollback()
                current_app.logger.exception("Could not persist background task failure", extra={"task_id": task_id})
                raise
            finally:
                # Persist first so a broken logging handler cannot prevent failure tracking.
                current_app.logger.error("Background task failed", extra={"task_id": task_id},
                                         exc_info=(type(error), error, error.__traceback__))


@tasks_endpoint.route("/v1/tasks/<id>", methods=["GET"])
@auth_required()
def get_task(id):
    """
        Get tasks
        ---
        tags:
            - Tasks
        parameters:
            - name: id
              in: path
              schema:
                type: integer
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns information about the task.
          404:
            description: Task could not be found.
    """
    claim = get_current_user_id()
    task_schema = TasksSchema()
    
    task = Tasks.query.filter(Tasks.id==id, Tasks.created_by==claim).first()
    if task:
        return jsonify(task_schema.dump(task))

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No task found"
        }), 404

@tasks_endpoint.route("/v1/tasks", methods=["POST"])
@auth_required()
@required_params("type", "data")
def create_task():
    """
        Create task
        ---
        tags:
            - Tasks
        requestBody:
        required: true
        content:
            application/json:
            schema:
                type: object
                required:
                    - type
                    - data
                properties:
                    type:
                        type: string
                    data:
                        type: string
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Task created.
    """
    claim_id = get_current_user_id()
    allowed_types = ("csv_export", "json_export", "html_export")
    if request.json["type"] not in allowed_types:
        return jsonify({
            "error": "Invalid type",
            "message": "The supplied task type is invalid. It can be either csv_export, json_export or html_export."
        }), 422
    try:
        new_task = _create_task(type=request.json["type"], data=str(request.json["data"]), created_by=claim_id)

        return jsonify({'message': 'Task created.', "task_id": new_task.id}), 202
    except:
        return jsonify({
                        "error": "Unknown error",
                        "message": "Unknown error occurred"
        }), 500


@tasks_endpoint.route("/v1/tasks/<id>/retry", methods=["POST"])
@auth_required()
def retry_task(id):
    """
        Create task
        ---
        tags:
            - Tasks
        parameters:
            - name: id
              in: path
              schema:
                type: integer
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Task set to be retried.
          404:
            description: Could not find task.
          409:
            description: Task is queued or already running.
    """
    claim_id = get_current_user_id()
    task = Tasks.query.filter(Tasks.id==id, Tasks.created_by==claim_id).first()

    if task:
        # Atomically reserve the retry; concurrent requests cannot both execute it.
        reset = Tasks.query.filter(Tasks.id==id, Tasks.created_by==claim_id,
                                   Tasks.status.in_(("failed", "success"))).update({
            Tasks.status: "fresh",
            Tasks.error_message: None,
            Tasks.updated_on: datetime.now(timezone.utc),
        }, synchronize_session=False)
        db.session.commit()
        if not reset:
            return jsonify({"error": "Task already running",
                            "message": "Task is queued or already running."}), 409
        _start_background_task(current_app.app_context(), task.id, claim_id)
        return jsonify({"message": "Task set to be retried."})

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No task found"
        }), 404
    

def share_book(claim_id, data):
    settings = UserSettings.query.filter(UserSettings.owner_id==claim_id).first()
    data = json.loads(data)

    mastodon = Mastodon(access_token=settings.mastodon_access_token, api_base_url=settings.mastodon_url)
    if data["reading_status"] == "Read":
        mastodon.status_post(f"I just finished reading {data["title"]} by {data["author"]} 📖 ")

def create_html(claim_id):
    env = Environment(loader=FileSystemLoader('api/'))
    books = Books.query.filter(Books.owner_id==claim_id).all()

    random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
    filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.html"

    template = env.get_template("book_template_export.html")
    output = template.render(data=books)

    with open(os.path.join(current_app.config["EXPORT_FOLDER"], filename), "w", newline="", encoding="utf-8") as f:
        f.write(output)
    new_file = Files(filename=filename, owner_id=claim_id)
    new_file.save_to_db()

def create_json(claim_id):
    books = Books.query.filter(Books.owner_id==claim_id).all()

    book_list = []
    for book in books:
        book_dict = {
            'title': book.title,
            'isbn': book.isbn,
            'description': book.description,
            'reading_status': book.reading_status,
            'current_page': book.current_page,
            'total_pages': book.total_pages,
            'author': book.author,
            'rating': str(book.rating),
            'notes': [{"content": note.content, "quote_page": note.quote_page, "visibility": note.visibility, "created_on": note.created_on.isoformat()} for note in book.notes]
        }
        book_list.append(book_dict)

    random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
    filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.json"

    with open(os.path.join(current_app.config["EXPORT_FOLDER"], filename), "w", newline="", encoding="utf-8") as f:
        f.write(json.dumps(book_list))
    new_file = Files(filename=filename, owner_id=claim_id)
    new_file.save_to_db()

def create_csv(claim_id):
    books = Books.query.filter(Books.owner_id==claim_id).all()

    random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
    filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.csv"

    with open(os.path.join(current_app.config["EXPORT_FOLDER"], filename), "w", newline="", encoding="utf-8") as f:
        csvwriter = csv.writer(f, delimiter=",")
        csvwriter.writerow(["title", "isbn", "description", "reading_status", "current_page", "total_pages", "author", "rating", "notes"])
        for b in books:
            notes_json = json.dumps([{"content": note.content, "quote_page": note.quote_page, "visibility": note.visibility, "created_on": note.created_on.isoformat()} for note in b.notes])
            csvwriter.writerow([b.title, b.isbn, b.description, b.reading_status, b.current_page, b.total_pages, b.author, b.rating, notes_json])

    new_file = Files(filename=filename, owner_id=claim_id)
    new_file.save_to_db()