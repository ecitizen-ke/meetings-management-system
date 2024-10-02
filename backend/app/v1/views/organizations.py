from flask import Blueprint, jsonify, request
from ..models import Organization


organizations_blueprint = Blueprint("organizations_blueprint", __name__)


@organizations_blueprint.route("/api/v1/organizations", methods=["POST"])
def create():
    organization = Organization()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400
        organization.create(data["name"], data["description"])
        return jsonify({"msg": "organization created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@organizations_blueprint.route("/api/v1/organizations", methods=["GET"])
def fetchall():
    organization = Organization()
    return jsonify(organization.get_all())
