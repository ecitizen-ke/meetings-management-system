from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Organization
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


organizations_blueprint = Blueprint("organizations_blueprint", __name__)


@organizations_blueprint.route("/api/v1/organizations", methods=["POST"])
@jwt_required()
def create():
    organization = Organization()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        if "name" not in data:
            return response("'name' field is required!", 400)
        result = organization.create(data["name"], data["description"])
        if not isinstance(result, Exception):
            return response("'Meeting added successfully!", 201)

        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@organizations_blueprint.route("/api/v1/organizations", methods=["GET"])
@jwt_required()
def fetchall():
    organization = Organization()
    return response_with_data("OK", organization.get_all(), 200)
