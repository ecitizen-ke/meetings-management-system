from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Role
from ..models import Permission
from ..models import User
from utils.exception import DatabaseException
from utils.responses import response, response_with_data
from utils.decorators import verify_role


roles_blueprint = Blueprint("roles_blueprint", __name__)


@roles_blueprint.route("/api/v1/roles", methods=["POST"])
@jwt_required()
@verify_role("create-role")
def add():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        name = data.get("name")
        description = data.get("description")

        missing_fields = [field for field in ["name"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)
        result = role.create(name, description)

        if not isinstance(result, Exception):
            return response("Role created successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles", methods=["GET"])
@jwt_required()
def fetchall():
    role = Role()
    return response_with_data("OK", role.get_all(), 200)


@roles_blueprint.route("/api/v1/roles/<int:id>", methods=["GET"])
def fetch_by_id(id):
    role = Role()
    return response_with_data("OK", role.get_permissions(id), 200)


@roles_blueprint.route("/api/v1/roles/<int:id>", methods=["DELETE"])
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
def update(id):
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        name = data.get("name")
        description = data.get("description")

        missing_fields = [field for field in ["name"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)
        result = role.update(id, name, description)
        if not isinstance(result, Exception):
            return response("Role updated successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/assign-permissions", methods=["POST"])
def assign_permissions():
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        role_id = data.get("role_id")
        permissions = data.get("permissions")

        missing_fields = [field for field in ["role_id", "permissions"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)

        result = role.add_permission(role_id, permissions)
        if not isinstance(result, Exception):
            return response("Permissions assigned successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/roles/assign-role", methods=["POST"])
def assign_role():
    user = User()
    role = Role()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        email = data.get("email")
        role_name = data.get("role_name")

        missing_fields = [field for field in ["email", "role_name"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)
        if user.find_by_email(email):
            result = user.assign_role(email, role_name)
            if isinstance(result, Exception):
                return response("Role assignment failed" + str(result), 403)
            return response("User role assgined Successfully", 200)
        else:
            return response("User not found!", 404)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/permissions", methods=["POST"])
def create_permission():
    permission = Permission()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)

        perm = data.get("name")

        missing_fields = [field for field in ["perm"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)

        result = permission.create(perm)
        if not isinstance(result, Exception):
            return response("Permission created successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@roles_blueprint.route("/api/v1/permissions", methods=["GET"])
def fetchall_permissions():
    permission = Permission()
    return response_with_data("OK", permission.get_all(), 200)
