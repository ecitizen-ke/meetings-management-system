from flask import Blueprint, jsonify, request
from ..models import Role


roles_blueprint = Blueprint("roles_blueprint", __name__)


@roles_blueprint.route("/api/v1/roles", methods=["POST"])
def add():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400
        role.create(data["name"], data["description"])
        return jsonify({"msg": "Role created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@roles_blueprint.route("/api/v1/roles", methods=["GET"])
def fetchall():
    role = Role()
    return jsonify(role.get_all())
