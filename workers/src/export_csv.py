import psycopg2
import time
from datetime import datetime
from dotenv import load_dotenv
import os
import pathlib
import string
import random

load_dotenv()

if not os.path.exists(os.getenv("EXPORT_FOLDER")):
    os.makedirs(os.getenv("EXPORT_FOLDER"))

WORKER_ID ="csv_export:7d278a04-1440-4aa4-a330-3aa48cc2f515"

conn = psycopg2.connect(host="localhost", dbname="booklogr", user="admin", password="password")
conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)

cursor = conn.cursor()
cursor.execute(f"LISTEN task_created;")

def handle_notify():
    conn.poll()
    id = None
    for notify in conn.notifies:
        print(notify.payload)
        id = notify.payload


    conn.notifies.clear()
    if id:
        cursor.execute(f"SELECT * FROM tasks WHERE id={id} AND type='csv_export'")
        fetched = cursor.fetchone()
        if fetched:
            pickup_task(id, fetched)

def pickup_task(id, data):
    cursor.execute(f"UPDATE tasks SET status='started', worker='{WORKER_ID}', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
    
    create_csv(data[-1])
    cursor.execute(f"UPDATE tasks SET status='success', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")


def create_csv(owner_id):
    cursor.execute(f"SELECT title, isbn, description, reading_status, current_page, total_pages, author, rating FROM books WHERE owner_id={owner_id}")
    rows = cursor.fetchall()

    random_string = "".join(random.choice(string.ascii_letters + string.digits) for _ in range(8))
    filename = f"export_{datetime.now().strftime("%y%m%d")}_{random_string}.csv"

    with open(os.path.join(os.getenv("EXPORT_FOLDER"), filename), "w") as f:
        f.write("title,isbn,description,reading_status,current_page,total_pages,author,rating\n")
        for row in rows:
            f.write(",".join([str(cell) for cell in row]) + "\n")
    
    cursor.execute("INSERT INTO files (filename, owner_id) VALUES (%s, %s)", (filename, owner_id))


while True:
    handle_notify()
    time.sleep(1)