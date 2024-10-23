from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from ..models import User
from ..models import Role
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


auth_blueprint = Blueprint("auth_blueprint", __name__)


@auth_blueprint.route("/api/v1/auth/register", methods=["POST"])
def create():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

        if not all([first_name, last_name, organization, designation, email, phone, password]):
            return response("Missing required fields", 400)
        if not user.find_by_email(email):
            result = user.create(
                first_name, last_name, organization, designation, email, phone, password
            )
            if not isinstance(result, Exception):
                return response("User added successfully", 201)
            else:
                raise DatabaseException(str(result))
        else:
            return response("You're already registered!", 409)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/login", methods=["POST"])
def login():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        email = data.get("email")
        password = data.get("password")

        if not all([email, password]):
            return response("Missing required fields", 400)
        
        role = user.get_role(email)

        result = user.login(email, password)
       
        if not role:
            return response("Role not found", 404)
        
        additional_claims = {"role": role}

        if result:
            return response_with_data(
                "OK",
                {
                    "token": create_access_token(identity=result.get("email"), additional_claims=additional_claims),
                },
                200,
            )
        else:
            return response("Authentication failed!", 401)

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/assign", methods=["POST"])
def assign():
    user = User()
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        email = data["email"]
        role_name = data["role"]
        if not all([email, role_name]):
            return response("Missing required fields", 400)
        if user.find_by_email(email):
            result = user.assign_role(email, role_name)
            # user.assign_role(email, role)
            if isinstance(result, Exception):
                return response("Role Assignment Failed"+str(result),403)
            return response("User Role Assgined Successfully",200)
        else:
            return response("User not found!", 404)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users", methods=["GET"])
def users():
    user = User()
    try:
        return response_with_data("OK", user.get_users(), 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
