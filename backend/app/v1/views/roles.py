from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils import parse_integer_from_string
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.decorators import roles_required
from utils.validations import check_missing_fields
from ..models import Role


roles_blueprint = Blueprint("roles_blueprint", __name__)


@roles_blueprint.route("/api/v1/roles", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create_role():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)
        missing_fields = check_missing_fields(data, ["name", "description"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        name = data.get("name")
        description = data.get("description")
        result = role.create(name, description)

        if not isinstance(result, Exception):
            return response("Role created successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall():
    role = Role()
    try:
        data = role.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/<int:id>", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetch_by_id(id):
    role = Role()
    try:
        data = role.get_permissions(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/<int:id>", methods=["DELETE"])
@jwt_required()
@roles_required(["admin"])
def delete(id):
    role = Role()
    try:
        result = role.delete(id)
        if not isinstance(result, Exception):
            return response("Role deleted successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/<int:id>", methods=["PUT"])
@jwt_required()
@roles_required(["admin"])
def update(id):
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        missing_fields = check_missing_fields(data, ["name", "description"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        name = data.get("name")
        description = data.get("description")
        result = role.update(id, name, description)
        if not isinstance(result, Exception):
            return response("Role updated successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/<string:role>/permissions", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def get_permissions(role):
    try:
        data = Role().get_permissions(role)
        if not isinstance(data, Exception):
            if data:
                return response_with_data("OK", data, 200)
            return no_data_found()
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/permissions/assign", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def assign_permissions():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        missing_fields = check_missing_fields(data, ["role", "permissions"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        rol = data.get("role")
        permissions = data.get("permissions")

        result = role.add_permission(rol, permissions)
        if not isinstance(result, Exception):
            if result:
                return response("Permissions assigned successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        error_code = parse_integer_from_string(str(e))
        if error_code == 1062:
            return response("Permission already granted!", 409)
        return response("Something went wrong, " + str(e), 400)
