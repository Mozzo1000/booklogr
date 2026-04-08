import os
import sys
from waitress import serve
from api.app import app, db
from flask_migrate import upgrade, Migrate
from api.models import UserSettings
from api.auth.models import User, Verification
import secrets
import string

def setup_desktop_environment():
    with app.app_context():
        if getattr(sys, 'frozen', False):
            print("Desktop Mode: Ensuring database is ready...")
            base_path = sys._MEIPASS
            migration_path = os.path.join(base_path, 'migrations')
            
            print(f"Using migrations from: {migration_path}")
            try:
                upgrade(directory=migration_path)
            except Exception:
                print(f"Migration failed: {e}. Falling back to create_all().")
                db.create_all()
        
        if app.config.get("SINGLE_USER_MODE") == "True":
            existing_user = User.query.filter(User.id==1).first()
            if existing_user:
                return "Default profile already exists. Skipping bootstrap."
            
            rand_pass = ''.join(secrets.choice(string.ascii_letters + string.digits + string.punctuation) for i in range(32))

            try:
                new_user = User(email="single@user.com", password=User.generate_hash(rand_pass), name="Local user", role="admin")
                new_user.save_to_db()

                new_verification = Verification(user_id=new_user.id, status="verified", code=None, code_valid_until=None)
                new_verification.save_to_db()

                print(f"Successfully bootstrapped single user")

            except Exception as e:
                print(f"Bootstrap Error: {e}")

if __name__ == "__main__":
    setup_desktop_environment()
    
    host = "127.0.0.1"
    port = 5000
    
    print(f"BookLogr API running at http://{host}:{port}")
    serve(app, host=host, port=port, threads=4)