from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Organization
from utils.exception import DatabaseException
from utils.responses import response, no_data_found, response_with_data
from utils.validations import check_missing_fields
from utils.decorators import roles_required


organizations_blueprint = Blueprint("organizations_blueprint", __name__)


@organizations_blueprint.route("/api/v1/organizations", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create():
    organization = Organization()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        missing_fields = check_missing_fields(data, ["name", "organization"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        name = data.get("name")
        description = data.get("description", "")
        result = organization.create(name, description)
        if not isinstance(result, Exception):
            return response("'Organization added successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@organizations_blueprint.route("/api/v1/organizations", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall():
    organization = Organization()
    try:
        res = organization.get_all()
        if not isinstance(res, Exception):
            if not res:
                return no_data_found()
            return response_with_data("OK", res, 200)
        else:
            raise DatabaseException(str(res))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
