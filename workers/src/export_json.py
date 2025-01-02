import time
from datetime import datetime
from dotenv import load_dotenv
import os
import string
import random
import json

load_dotenv()

if not os.path.exists(os.getenv("EXPORT_FOLDER")):
    os.makedirs(os.getenv("EXPORT_FOLDER"))

class JSONWorker:
    def __init__(self, cursor):
        self.WORKER_ID = "json_export:740a2d9e-aa47-44cd-b381-a08608f17862"
        self.cursor = cursor

    def pickup_task(self, id, data):
        self.cursor.execute(f"UPDATE tasks SET status='started', worker='{self.WORKER_ID}', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        
        self.create_json(data["created_by"])
        self.cursor.execute(f"UPDATE tasks SET status='success', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        print(f"[{self.WORKER_ID}] - Task completed.")


    def create_json(self, owner_id):
        self.cursor.execute(f"SELECT title, isbn, description, reading_status, current_page, total_pages, author, rating FROM books WHERE owner_id={owner_id}")
        rows = self.cursor.fetchall()

        random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
        filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.json"

        with open(os.path.join(os.getenv("EXPORT_FOLDER"), filename), "w") as f:
            f.write(json.dumps(rows))
        
        self.cursor.execute("INSERT INTO files (filename, owner_id) VALUES (%s, %s)", (filename, owner_id))