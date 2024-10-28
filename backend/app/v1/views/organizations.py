from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Organization
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


organizations_blueprint = Blueprint("organizations_blueprint", __name__)


@organizations_blueprint.route("/api/v1/organizations", methods=["POST"])
@jwt_required()
def create():
    organization = Organization()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        if "name" not in data:
            return response("'name' field is required!", 400)
        name = data.get("name")
        description = data.get("description", "")
        result = organization.create(name, description)
        if not isinstance(result, Exception):
            return response("'Meeting added successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@organizations_blueprint.route("/api/v1/organizations", methods=["GET"])
@jwt_required()
def fetchall():
    organization = Organization()
    return response_with_data("OK", organization.get_all(), 200)


@organizations_blueprint.route("/api/v1/organizations-select", methods=["GET"])
def get_organizations_select():
    try:
        search = request.args.get("search", "")
        organization = Organization()
        organizations = organization.filter_by_search(search)
        if not isinstance(organizations, list):
            return response(str(organizations), 400)
        organizations = [
            {"value": org["id"], "label": org["name"]} for org in organizations
        ]
        return response_with_data("OK", organizations, 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
    
