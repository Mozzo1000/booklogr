from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from api.models import Books

books_endpoint = Blueprint('books', __name__)

@books_endpoint.route("/v1/books", methods=["POST"])
def add_book():
    new_book = Books()