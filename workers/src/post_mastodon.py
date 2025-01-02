import time
from dotenv import load_dotenv
import os
from mastodon import Mastodon
import json

load_dotenv()

if not os.path.exists(os.getenv("EXPORT_FOLDER")):
    os.makedirs(os.getenv("EXPORT_FOLDER"))

class MastodonWorker:
    def __init__(self, cursor):
        self.WORKER_ID = "mastodon_share:1ce16504-044e-4150-8ff3-9899925ce0ab"
        self.cursor = cursor

    def pickup_task(self, id, data):
        self.cursor.execute(f"UPDATE tasks SET status='started', worker='{self.WORKER_ID}', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        
        self.share_book(data)
        self.cursor.execute(f"UPDATE tasks SET status='success', updated_on='{time.strftime('%Y-%m-%d %H:%M:%S')}' WHERE id={id}")
        print(f"[{self.WORKER_ID}] - Task completed.")


    def share_book(self, data):
        self.cursor.execute(f"SELECT mastodon_url, mastodon_access_token FROM user_settings WHERE owner_id={data["created_by"]}")
        settings = self.cursor.fetchone()
        data = json.loads(data["data"])

        mastodon = Mastodon(access_token=settings["mastodon_access_token"], api_base_url=settings["mastodon_url"])
        if data["reading_status"] == "Read":
            mastodon.status_post(f"I just finished reading {data["title"]} by {data["author"]} 📖 ")