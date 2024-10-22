from flask import Blueprint, request
from ..models import Resource
from utils.exception import DatabaseException
from utils.responses import response, response_with_data

resources_blueprint = Blueprint("resources_blueprint", __name__)


@resources_blueprint.route("/api/v1/resources", methods=["POST"])
def create():
    resource = Resource()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        if "name" not in data:
            return response("'name' field is required!", 400)
        result = resource.create(data["name"], data["description"], data["quantity"])
        if not isinstance(result, Exception):
            return response("Resource added successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@resources_blueprint.route("/api/v1/resources", methods=["GET"])
def fetchall():
    resource = Resource()
    return response_with_data("OK", resource.get_all(), 200)
