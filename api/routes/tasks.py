from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Tasks, TasksSchema, db, Books, Files, UserSettings
from api.decorators import required_params
from sqlalchemy import text 
import time
import threading
import string
import random
from datetime import datetime, timezone
import os
import csv
import json
from jinja2 import Environment, FileSystemLoader
from mastodon import Mastodon

tasks_endpoint = Blueprint('tasks', __name__)

def _create_task(type, data, created_by):
    new_task = Tasks(type=type, data=data, created_by=created_by)
    new_task.save_to_db()
    threading.Thread(target=_start_background_task, args=(current_app.app_context(), new_task.id, created_by,)).start()
    return new_task

def _start_background_task(app, task_id, claim):
    def start(task):
        task.status = "started"
        task.updated_on = datetime.now(timezone.utc)
        task.save_to_db()
        print("Background task started")
    def finish(task):
        task.status = "success"
        task.updated_on = datetime.now(timezone.utc)
        task.save_to_db()
        print("Background task finished")

    app.push()
    task = Tasks.query.get(task_id)
    if task:
        start(task)
        if task.type == "csv_export":
            create_csv(claim)
        if task.type == "json_export":
            create_json(claim)
        if task.type == "html_export":
            create_html(claim)
        if task.type == "share_book_event":
            share_book(claim, task.data)
        finish(task)

        



@tasks_endpoint.route("/v1/tasks/<id>", methods=["GET"])
@jwt_required()
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
    claim = get_jwt()["id"]
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
@jwt_required()
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
    claim_id = get_jwt()["id"]
    try:
        new_task = _create_task(type=request.json["type"], data=str(request.json["data"]), created_by=claim_id)

        return jsonify({'message': 'Task created.', "task_id": new_task.id}), 202
    except:
        return jsonify({
                        "error": "Unknown error",
                        "message": "Unknown error occurred"
        }), 500


@tasks_endpoint.route("/v1/tasks/<id>/retry", methods=["POST"])
@jwt_required()
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
    """
    task = Tasks.query.filter(id==id).first()
    
    if task:
        task.status = "fresh"
        task.updated_on = datetime.now(timezone.utc)
        _start_background_task(current_app.app_context(), task.id, get_jwt()["id"])
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
            'rating': str(book.rating)
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
        csvwriter.writerow(["title", "isbn", "description", "reading_status", "current_page", "total_pages", "author", "rating"])
        for b in books:
            csvwriter.writerow([b.title, b.isbn, b.description, b.reading_status, b.current_page, b.total_pages, b.author, b.rating])
    new_file = Files(filename=filename, owner_id=claim_id)
    new_file.save_to_db()