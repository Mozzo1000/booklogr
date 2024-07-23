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

@tasks_endpoint.route("/v1/tasks/<id>", methods=["GET"])
@jwt_required()
def get_task(id):
    task_schema = TasksSchema()
    
    task = Tasks.query.filter(id==id).first()
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
    claim_id = get_jwt()["id"]

    new_task = Tasks(type=request.json["type"], data=str(request.json["data"]), created_by=claim_id)
    new_task.save_to_db()
    _notify_workers(new_task.id)

    return jsonify({'message': 'Task created.'}), 200


@tasks_endpoint.route("/v1/tasks/<id>/retry", methods=["POST"])
@jwt_required()
def retry_task(id):
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