from flask import Blueprint, jsonify, request
from ..models import Boardroom

boardroom_blueprint = Blueprint("boardroom_blueprint", __name__)


@boardroom_blueprint.route("/api/v1/boardrooms", methods=["POST"])
def create():
    boardroom = Boardroom()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400
        boardroom.create(data["name"], data["capacity"], data["location"], data["description"])
        return jsonify({"msg": "Boardroom created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@boardroom_blueprint.route("/api/v1/boardrooms", methods=["GET"])
def fetchall():
    boardroom = Boardroom()
    return jsonify(boardroom.get_all())


@boardroom_blueprint.route("/api/v1/boardrooms/<int:id>", methods=["GET"])
def fetchone(id):
    boardroom = Boardroom()
    return jsonify(boardroom.get_by_id(id))
