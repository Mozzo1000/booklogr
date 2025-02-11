from flask import Flask
from flask_jwt_extended import JWTManager, jwt_required
from flask_cors import CORS
from api.config import Config
from flask_migrate import Migrate
from api.models import db, ma
from api.routes.books import books_endpoint
from api.routes.profiles import profiles_endpoint
from api.routes.notes import notes_endpoint
from api.routes.tasks import tasks_endpoint
from api.routes.files import files_endpoint
from api.routes.settings import settings_endpoint
from flasgger import Swagger
from api.auth.auth_route import auth_endpoint
from api.auth.user_route import user_endpoint

app = Flask(__name__)
CORS(app)

app.config.from_object(Config)
swagger = Swagger(app)

db.init_app(app)
ma.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(books_endpoint)
app.register_blueprint(profiles_endpoint)
app.register_blueprint(notes_endpoint)
app.register_blueprint(tasks_endpoint)
app.register_blueprint(files_endpoint)
app.register_blueprint(settings_endpoint)

app.register_blueprint(auth_endpoint)
app.register_blueprint(user_endpoint)

@app.route("/")
def index():
    return {
        "name": "minimal-reading-api",
        "version": "1.0.0"
    }