from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Permission
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.validations import check_missing_fields
from utils.decorators import roles_required


permissions_blueprint = Blueprint("permissions_blueprint", __name__)


@permissions_blueprint.route("/api/v1/permissions", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create_permission():
    permission = Permission()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload!", 400)
        missing_fields = check_missing_fields(data, ["name"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        perm = data.get("name")
        result = permission.create(perm)
        if not isinstance(result, Exception):
            return response("Permission created successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@permissions_blueprint.route("/api/v1/permissions", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall_permissions():
    permission = Permission()
    try:
        data = permission.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
