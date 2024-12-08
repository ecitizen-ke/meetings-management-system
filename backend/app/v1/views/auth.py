from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from utils import parse_integer_from_string
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.validations import check_missing_fields
from utils.decorators import roles_required
from ..models import User
from ..models import Role


auth_blueprint = Blueprint("auth_blueprint", __name__)


@auth_blueprint.route("/api/v1/auth/users/register", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        missing_fields = check_missing_fields(
            data,
            [
                "first_name",
                "last_name",
                "organization",
                "designation",
                "email",
                "phone",
                "password",
            ],
        )
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")

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


@auth_blueprint.route("/api/v1/auth/users/login", methods=["POST"])
def login():
    user = User()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        missing_fields = check_missing_fields(data, ["email", "password"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        email = data.get("email")
        password = data.get("password")

        role = user.get_role(email)

        result = user.login(email, password)
        if result:
            claims = {
                "first_name": result.get("first_name"),
                "last_name": result.get("last_name"),
                "role": role,
            }
            return response_with_data(
                "OK",
                {
                    "access_token": create_access_token(
                        identity=result.get("email"),
                        additional_claims=claims,
                        fresh=True,
                    ),
                    "refresh_token": create_refresh_token(identity=result.get("email")),
                },
                200,
            )
        else:
            return response("Authentication failed!", 401)

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/login/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    user = User().find_by_email(current_user)
    role = User().get_role(current_user)
    claims = {
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "role": role,
    }
    try:
        return response_with_data(
            "OK",
            {
                "access_token": create_access_token(
                    identity=current_user,
                    additional_claims=claims,
                    fresh=False,
                ),
            },
            200,
        )
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/roles/assign", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def assign():
    user = User()
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        missing_fields = check_missing_fields(data, ["email", "role"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        email = data["email"]
        role_name = data["role"]

        if user.find_by_email(email):
            if not role.find_by_name(role_name):
                return response("Role not found!", 404)
            result = user.assign_role(email, role_name)
            if isinstance(result, Exception):
                return response("Role assignment failed!" + str(result), 403)
            return response("Role assgined successfully!", 200)
        else:
            return response("User not found!", 404)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def get_users():
    user = User()
    try:
        data = user.get_users()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/role", methods=["GET"])
@jwt_required()
# @roles_required(["admin"])
def get_role():
    user = User()
    email = get_jwt_identity()
    try:
        data = user.get_role(email)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/permissions", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def get_permissions():
    user = User()
    email = get_jwt_identity()
    try:
        data = user.get_permissions(email)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/permissions/grant", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def grant_permission():
    user = User()
    email = get_jwt_identity()
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return response("Invalid JSON format or empty payload", 400)
    missing_fields = check_missing_fields(data, ["email", "permission"])
    if missing_fields:
        return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

    permission = data["permission"]
    email = data["email"]
    try:
        data = user.add_permission(email, permission)
        if not isinstance(data, Exception):
            if data:
                return response_with_data("OK", "Permission granted!", 200)
            return response_with_data("OK", "Permission already granted!", 409)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        error_code = parse_integer_from_string(str(e))
        if error_code == 1062:
            return response("Permission already granted!", 409)
        return response("Something went wrong, " + str(e), 400)


@auth_blueprint.route("/api/v1/auth/users/permissions/revoke", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def revoke_permission():
    user = User()
    email = get_jwt_identity()
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return response("Invalid JSON format or empty payload", 400)
    missing_fields = check_missing_fields(data, ["email", "permission"])
    if missing_fields:
        return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

    permission = data["permission"]
    email = data["email"]
    try:
        data = user.remove_permission(email, permission)
        if not isinstance(data, Exception):
            if data:
                return response_with_data("OK", "Permission revoked!", 200)
            else:
                return response_with_data(
                    "OK", "Permission already revoked or does not exist!", 400
                )
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
