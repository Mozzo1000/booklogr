from flask import Blueprint, request, jsonify
from api.models import Fields, FieldsSchema, db
from api.decorators import auth_required
from api.utils import get_current_user_id
import json

fields_endpoint = Blueprint('fields', __name__)

VALID_TYPES = {"text", "number", "date", "selection", "boolean"}

@fields_endpoint.route("/v1/fields", methods=["GET"])
@auth_required()
def get_fields():
    """
        Get all fields
        ---
        tags:
            - Fields
        security:
            - bearerAuth: []
        responses:
          200:
            description: Returns all fields for the authenticated user.
    """
    claim_id = get_current_user_id()
    fields = Fields.query.filter(Fields.owner_id == claim_id).order_by(Fields.show_order).all()
    fields_schema = FieldsSchema(many=True)
    return jsonify(fields_schema.dump(fields))


@fields_endpoint.route("/v1/fields", methods=["POST"])
@auth_required()
def add_field():
    """
        Add a field
        ---
        tags:
            - Fields
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                  - name
                  - field_type
                properties:
                  name:
                    type: string
                    description: Name of the field
                  field_type:
                    type: string
                    description: Type of the field
                    enum:
                      - text
                      - number
                      - date
                      - selection
                      - boolean
                  show_order:
                    type: integer
                    description: Display order of the field
                  options:
                    type: array
                    description: Options for selection fields
                    items:
                      type: string
        security:
            - bearerAuth: []
        responses:
          201:
            description: Field created.
          400:
            description: Bad request.
          409:
            description: A field with that name already exists.
    """
    claim_id = get_current_user_id()
    if not request.json:
        return jsonify({"error": "Bad request", "message": "No JSON provided"}), 400

    name = request.json.get("name", "").strip()
    field_type = request.json.get("field_type", "")

    if not name:
        return jsonify({"error": "Bad request", "message": "name is required"}), 400
    if field_type not in VALID_TYPES:
        return jsonify({"error": "Bad request", "message": f"field_type must be one of: {', '.join(sorted(VALID_TYPES))}"}), 400

    if Fields.query.filter(Fields.owner_id == claim_id, Fields.name == name).first():
        return jsonify({"error": "Conflict", "message": f"A field named '{name}' already exists"}), 409

    show_order = request.json.get("show_order")
    if show_order is None:
        max_order = db.session.query(db.func.max(Fields.show_order)).filter(Fields.owner_id == claim_id).scalar()
        show_order = (max_order or 0) + 1

    options = None
    if field_type == "selection" and request.json.get("options"):
        options = json.dumps(request.json["options"])

    new_field = Fields(
        owner_id=claim_id,
        name=name,
        field_type=field_type,
        show_order=show_order,
        options=options,
    )
    new_field.save_to_db()

    fields_schema = FieldsSchema(many=False)

    return jsonify(fields_schema.dump(new_field)), 201


@fields_endpoint.route("/v1/fields/<int:field_id>", methods=["PATCH"])
@auth_required()
def edit_field(field_id):
    """
        Edit a field
        ---
        tags:
            - Fields
        parameters:
            - name: field_id
              in: path
              description: ID of the field
              required: true
              schema:
                type: integer
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                properties:
                  name:
                    type: string
                    description: New name of the field
                  show_order:
                    type: integer
                    description: Display order of the field
                  options:
                    type: array
                    description: Options for selection fields
                    items:
                      type: string
        security:
            - bearerAuth: []
        responses:
          200:
            description: Field updated.
          400:
            description: Bad request.
          404:
            description: Field not found.
          409:
            description: A field with that name already exists.
    """
    claim_id = get_current_user_id()
    field = Fields.query.filter(Fields.id == field_id, Fields.owner_id == claim_id).first()
    if not field:
        return jsonify({"error": "Not found", "message": "Field not found"}), 404

    if not request.json:
        return jsonify({"error": "Bad request", "message": "No JSON provided"}), 400

    if "name" in request.json:
        new_name = request.json["name"].strip()
        if Fields.query.filter(Fields.owner_id == claim_id, Fields.name == new_name, Fields.id != field_id).first():
            return jsonify({"error": "Conflict", "message": f"A field named '{new_name}' already exists"}), 409
        field.name = new_name

    if "show_order" in request.json:
        field.show_order = request.json["show_order"]

    if "options" in request.json:
        field.options = json.dumps(request.json["options"])

    field.save_to_db()
    fields_schema = FieldsSchema(many=False)

    return jsonify(fields_schema.dump(field)), 200


@fields_endpoint.route("/v1/fields/<int:field_id>", methods=["DELETE"])
@auth_required()
def remove_field(field_id):
    """
        Remove a field
        ---
        tags:
            - Fields
        parameters:
            - name: field_id
              in: path
              description: ID of the field
              required: true
              schema:
                type: integer
        security:
            - bearerAuth: []
        responses:
          200:
            description: Field removed.
          404:
            description: Field not found.
    """
    claim_id = get_current_user_id()
    field = Fields.query.filter(Fields.id == field_id, Fields.owner_id == claim_id).first()
    if not field:
        return jsonify({"error": "Not found", "message": "Field not found"}), 404
    field.delete()
    return jsonify({"message": "Field removed"}), 200
