import time
from datetime import datetime
from dotenv import load_dotenv
import os
import string
import random

load_dotenv()

if not os.path.exists(os.getenv("EXPORT_FOLDER")):
    os.makedirs(os.getenv("EXPORT_FOLDER"))

class CSVWorker:
    def __init__(self, cursor):
        self.WORKER_ID = "csv_export:7d278a04-1440-4aa4-a330-3aa48cc2f515"
        self.cursor = cursor

    def pickup_task(self, id, data):
        self.cursor.execute(f"UPDATE tasks SET status='started', worker='{self.WORKER_ID}', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        
        self.create_csv(data["created_by"])
        self.cursor.execute(f"UPDATE tasks SET status='success', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")


    def create_csv(self, owner_id):
        self.cursor.execute(f"SELECT title, isbn, description, reading_status, current_page, total_pages, author, rating FROM books WHERE owner_id={owner_id}")
        rows = self.cursor.fetchall()

        random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
        filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.csv"

        with open(os.path.join(os.getenv("EXPORT_FOLDER"), filename), "w") as f:
            f.write("title,isbn,description,reading_status,current_page,total_pages,author,rating\n")
            for row in rows:
                f.write(",".join([str(cell) for cell in row]) + "\n")
        
        self.cursor.execute("INSERT INTO files (filename, owner_id) VALUES (%s, %s)", (filename, owner_id))