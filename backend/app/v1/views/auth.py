from flask import Blueprint, jsonify, request
from ..models import User

auth_blueprint = Blueprint("auth_blueprint", __name__)


@auth_blueprint.route("/api/v1/auth/register", methods=["POST"])
def create():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if not all([first_name, last_name, organization, designation, email, phone, password]):
            return jsonify({"error": "Missing required fields"}), 400

        if not user.find_by_email(email):
            user.create(first_name, last_name, organization, designation, email, phone, password)
            return jsonify({"msg": "User added successfully"}), 201
        else:
            return jsonify({"msg": "You're already registered!"}), 409

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@auth_blueprint.route("/api/v1/auth/login", methods=["POST"])
def login():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        if user.login(email, password):
            return jsonify({"msg": "Login successfull!"}), 200
        else:
            return jsonify({"msg": "Authentication failed!"}), 403

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@auth_blueprint.route("/api/v1/auth/assign", methods=["POST"])
def assign():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        email = data["email"]
        role = data["role"]
        if not all([email, role]):
            return jsonify({"error": "Missing required fields"}), 400
        if user.find_by_email(email):
            user.asign_role(email, role)
            return jsonify({"msg": "User role successfully assigned!"}), 200
        else:
            return jsonify({"msg": "Role assignment failed!"}), 403
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@auth_blueprint.route("/api/v1/auth/users", methods=["GET"])
def users():
    user = User()
    try:
        return jsonify(user.get_users()), 200
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500
