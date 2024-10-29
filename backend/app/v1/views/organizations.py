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

        missing_fields = check_missing_fields(data, ["name", "description"])
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


@organizations_blueprint.route("/api/v1/organizations/<int:id>", methods=["PUT"])
@jwt_required()
def update_organization(id):
    organization = Organization()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        if "name" not in data:
            return response("'name' field is required!", 400)
        if not organization.get_by_id(id):
            return response("Organization not found!", 404)
        name = data.get("name")
        description = data.get("description", "")
        result = organization.update_organization(id, name, description)
        if not isinstance(result, Exception):
            return response("Organization updated successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
    except Exception as e:
        return response("Something went wrong, " + str(e), 400)


@organizations_blueprint.route("/api/v1/organizations/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_organization(id):
    organization = Organization()
    try:
        if not organization.get_by_id(id):
            return response("Organization not found!", 404)
        result = organization.delete_organization(id)
        if not isinstance(result, Exception):
            return response("Organization deleted successfully!", 200)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
    except Exception as e:
        return response("Something went wrong, " + str(e), 400)

@organizations_blueprint.route("/api/v1/organizations-select", methods=["GET"])
@jwt_required()
def search_organization():
    organization = Organization()
    try:
        search = request.args.get("search")
        res = organization.filter_by_search(search)
        if not isinstance(res, Exception):
            if not res:
                return no_data_found()
            return response_with_data("OK", res, 200)
        else:
            raise DatabaseException(str(res))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)