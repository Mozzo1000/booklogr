from flask import Flask
from flask_jwt_extended import JWTManager, jwt_required
from flask_cors import CORS
from api.config import Config
from flask_migrate import Migrate
from api.models import db, ma
from api.routes.books import books_endpoint
from api.routes.profiles import profiles_endpoint
from api.routes.notes import notes_endpoint

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(books_endpoint)
app.register_blueprint(profiles_endpoint)
app.register_blueprint(notes_endpoint)

@app.route("/")
def index():
    return {
        "name": "minimal-reading-api",
        "version": "1.0.0"
    }