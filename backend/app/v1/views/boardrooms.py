from flask import Blueprint, request
from ..models import Boardroom
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


boardroom_blueprint = Blueprint("boardroom_blueprint", __name__)


@boardroom_blueprint.route("/api/v1/boardrooms", methods=["POST"])
def create():
    boardroom = Boardroom()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        if "name" not in data:
            return response("'name' field is required", 400)
        result = boardroom.create(
            data["name"], data["capacity"], data["location"], data["description"]
        )
        if not isinstance(result, Exception):
            return response("Boardroom added successfully!", 201)
        else:
            raise DatabaseException(str(result))

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@boardroom_blueprint.route("/api/v1/boardrooms", methods=["GET"])
def fetchall():
    boardroom = Boardroom()
    return response_with_data("OK", boardroom.get_all(), 200)


@boardroom_blueprint.route("/api/v1/boardrooms/<int:id>", methods=["GET"])
def fetchone(id):
    boardroom = Boardroom()
    return response_with_data("OK", boardroom.get_by_id(id), 200)
