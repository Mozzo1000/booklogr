from flask import Blueprint
import click
from getpass import getpass
import sys
import re
from api.models import Tasks, db

tasks_command = Blueprint('tasks_cli', __name__)

@tasks_command.cli.command("clear")
def clear_tasks():
    print("[CLEAR QUEUED TASKS]")

    all_tasks = Tasks.query.filter(Tasks.status=="fresh", Tasks.worker==None)
    if len(all_tasks.all()) > 0:
        confirmation = input(f"Are you sure you want to clear {len(all_tasks.all())} tasks? (y/N)")

        if confirmation == "y":
            all_tasks.delete()
            db.session.commit()
            print("Tasks cleared")
        else:
            print("Cancelled clearing tasks")
            sys.exit(1)
    else:
        print("There are no tasks to clear.")
        sys.exit(1)

@tasks_command.cli.command("queue")
def list_tasks():
    all_tasks = Tasks.query.filter(Tasks.status=="fresh").all()
    print(f"IN QUEUE: {len(all_tasks)}")
    for i in all_tasks:
        print(i.type)