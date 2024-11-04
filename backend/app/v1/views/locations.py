from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Location
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.decorators import roles_required


locations_blueprint = Blueprint("locations_blueprint", __name__)


@locations_blueprint.route("/api/v1/locations", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall():
    locations = Location()
    try:
        data = locations.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@locations_blueprint.route("/api/v1/location-search", methods=["GET"])
@jwt_required()
def get_locations_select():
    county = request.args.get("county", None)
    search = request.args.get("search", "")

    if not county:
        return response("County is required", 400)

    locations_model = Location()
    locations = locations_model.filter_by_county_and_search(county, search)

    if not isinstance(locations, list):
        return response(str(locations), 400)
    # format locaions for choices js library
    locations = [
        {"value": location["id"], "label": location["town"]} for location in locations
    ]

    return response_with_data("OK", locations, 200)


@locations_blueprint.route("/api/v1/locations/<int:id>", methods=["GET"])
@jwt_required()
def fetchone(id):
    location = Location()
    try:
        data = location.get_by_id(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
