import psycopg2
import time
from psycopg2.extras import RealDictCursor
import argparse
from dotenv import load_dotenv
import os

from src.export_csv import CSVWorker
from src.export_json import JSONWorker

def main():
    load_dotenv()
    conn = psycopg2.connect(host="localhost", dbname=os.getenv("POSTGRES_DB"), user=os.getenv("POSTGRES_USER"), password=os.getenv("POSTGRES_PASSWORD"))
    conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    parser = argparse.ArgumentParser("booklogr-workers", description="Manager for the booklogr workers")
    parser.add_argument("OPTION", choices=["listen", "queue", "clear", "backlog"])
    args = parser.parse_args()    

    
    if args.OPTION == "listen":
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
            process_task(fetched, cursor)

def process_task(data, cursor):
    print(data)
    if data["type"] == "csv_export":
        CSVWorker(cursor).pickup_task(data["id"], data)

if __name__ == '__main__':
    main()