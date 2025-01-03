import psycopg2
import time
from psycopg2.extras import RealDictCursor
import argparse
from dotenv import load_dotenv
import os

from src.export_csv import CSVWorker
from src.export_json import JSONWorker
from src.export_html import HTMLWorker
from src.post_mastodon import MastodonWorker

def main():
    load_dotenv()
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    parser = argparse.ArgumentParser("booklogr-workers", description="Manager for the booklogr workers")
    parser.add_argument("OPTION", choices=["listen", "queue", "clear", "backlog"])
    args = parser.parse_args()    

    
    if args.OPTION == "listen":
        print("Listening for events..")
        cursor.execute(f"LISTEN task_created;")
        while True:
            handle_notify(conn, cursor)
            time.sleep(1)

    if args.OPTION == "queue": 
        list_queue(cursor)
    if args.OPTION == "clear":
        clear_queue(cursor)

    if args.OPTION == "backlog":
        process_backlog(cursor)

def process_backlog(cursor):
    cursor.execute(f"SELECT * FROM tasks WHERE status='fresh' AND worker IS NULL")
    results = cursor.fetchall()
    print(f"IN QUEUE: {len(results)}")
    for i in results:
        process_task(i, cursor)

def clear_queue(cursor):
    cursor.execute(f"DELETE FROM tasks WHERE status='fresh' AND worker IS NULL")
    print("Deleted all from queue")


def list_queue(cursor):
    cursor.execute(f"SELECT * FROM tasks WHERE status='fresh'")
    results = cursor.fetchall()
    print(f"IN QUEUE: {len(results)}")
    for i in results:
        print(i)

def handle_notify(conn, cursor):
    conn.poll()
    id = None
    for notify in conn.notifies:
        print(notify.payload)
        id = notify.payload

    conn.notifies.clear()
    if id:
        cursor.execute(f"SELECT * FROM tasks WHERE id={id}")
        fetched = cursor.fetchone()
        if fetched:
            print("Found task to process")
            process_task(fetched, cursor)

def process_task(data, cursor):
    print(f"Processing task with type {data['type']}")
    if data["type"] == "csv_export":
        CSVWorker(cursor).pickup_task(data["id"], data)
    elif data["type"] == "json_export":
        JSONWorker(cursor).pickup_task(data["id"], data)
    elif data["type"] == "html_export":
        HTMLWorker(cursor).pickup_task(data["id"], data)
    elif data["type"] == "share_book_event":
        MastodonWorker(cursor).pickup_task(data["id"], data)

if __name__ == '__main__':
    main()