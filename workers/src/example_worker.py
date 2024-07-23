import psycopg2
import time

WORKER_ID ="worker_name:1e0cf15d-3beb-4cf2-8453-00ad18f84d37"

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
        cursor.execute(f"SELECT * FROM tasks WHERE id={id}")
        fetched = cursor.fetchone()
        if fetched:
            pickup_task(id, fetched)

def pickup_task(id, data):
    print(data)
    current_time = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"Current time : {current_time}")
    cursor.execute(f"UPDATE tasks SET status='started', worker='{WORKER_ID}', updated_on='{current_time}' WHERE id={id}")

while True:
    handle_notify()
    time.sleep(1)