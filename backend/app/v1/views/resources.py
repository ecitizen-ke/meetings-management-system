from flask import Blueprint, jsonify, request
from ..models import Resource

resources_blueprint = Blueprint("resources_blueprint", __name__)


@resources_blueprint.route("/api/v1/resources", methods=["POST"])
def create():
    resource = Resource()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400
        resource.create(data["name"], data["description"], data["quantity"])
        return jsonify({"msg": "Resource created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@resources_blueprint.route("/api/v1/resources", methods=["GET"])
def fetchall():
    resource = Resource()
    return jsonify(resource.get_all())
