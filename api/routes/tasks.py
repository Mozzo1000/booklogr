from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Tasks, TasksSchema, db
from api.decorators import required_params
from sqlalchemy import text 
import time

tasks_endpoint = Blueprint('tasks', __name__)

def _notify_workers(id):
    db.session.execute(text(f"NOTIFY task_created, '{id}';"))
    db.session.commit()

def _create_task(type, data, created_by):
    new_task = Tasks(type=type, data=data, created_by=created_by)
    new_task.save_to_db()
    _notify_workers(new_task.id)
    return new_task


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
        parameters:
            - name: type
              in: body
              type: string
              required: true
            - name: data
              in: body
              type: string
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Task created.
    """
    claim_id = get_jwt()["id"]
    new_task =_create_task(str(request.json["type"]), str(request.json["data"]), claim_id)

    return jsonify({'message': 'Task created.', "task_id": new_task.id}), 200


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
        task.updated_on = time.strftime('%Y-%m-%d %H:%M:%S')
        _notify_workers(task.id)
        return jsonify({"message": "Task set to be retried."})

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No task found"
        }), 404