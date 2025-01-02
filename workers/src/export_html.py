import time
from datetime import datetime
from dotenv import load_dotenv
import os
import string
import random
import json
from jinja2 import Environment, FileSystemLoader

load_dotenv()

if not os.path.exists(os.getenv("EXPORT_FOLDER")):
    os.makedirs(os.getenv("EXPORT_FOLDER"))

class HTMLWorker:
    def __init__(self, cursor):
        self.WORKER_ID = "html_export:97305e39-86fb-4433-8220-4a756a33b4e7"
        self.cursor = cursor

        self.env = Environment(loader=FileSystemLoader('src/html_templates'))


    def pickup_task(self, id, data):
        self.cursor.execute(f"UPDATE tasks SET status='started', worker='{self.WORKER_ID}', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        
        self.create_html(data["created_by"])
        self.cursor.execute(f"UPDATE tasks SET status='success', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        print(f"[{self.WORKER_ID}] - Task completed.")


    def create_html(self, owner_id):
        self.cursor.execute(f"SELECT title, isbn, description, reading_status, current_page, total_pages, author, rating FROM books WHERE owner_id={owner_id}")
        rows = self.cursor.fetchall()

        random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
        filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.html"

        template = self.env.get_template("all_books.html")
        output = template.render(data=rows)

        with open(os.path.join(os.getenv("EXPORT_FOLDER"), filename), "w") as f:
            f.write(output)
        
        self.cursor.execute("INSERT INTO files (filename, owner_id) VALUES (%s, %s)", (filename, owner_id))