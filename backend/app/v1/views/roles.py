from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Role
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


roles_blueprint = Blueprint("roles_blueprint", __name__)


@roles_blueprint.route("/api/v1/roles", methods=["POST"])
@jwt_required()
def add():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)
        if "name" not in data:
            return response("Missing required fields!", 400)
        result = role.create(data["name"], data["description"])
        if not isinstance(result, Exception):
            return response("Role created successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles", methods=["GET"])
@jwt_required()
def fetchall():
    role = Role()
    return response_with_data("OK", role.get_all(), 200)
