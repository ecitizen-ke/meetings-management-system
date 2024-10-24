from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Location
from utils.exception import DatabaseException
from utils.responses import response, response_with_data

locations_blueprint = Blueprint("locations_blueprint", __name__)


@locations_blueprint.route("/api/v1/locations", methods=["GET"])
def fetchall():
    locations = Location()
    return response_with_data("OK", locations.get_all(), 200)


@locations_blueprint.route("/api/v1/location-towns", methods=["GET"])
def get_locations_select():
    county = request.args.get("county", None)
    search = request.args.get("search", "")

    if not county:
        return response("County is required", 400)

    locations_model = Location()
    locations = locations_model.filter_by_county_and_search(county, search)

    if not isinstance(locations, list):
        # get specific error message
        return response(str(locations), 400)
    # format locaions for choices js library
    locations = [{"value": location["town"], "label": location["town"]} for location in locations]
    
    return response_with_data("OK", locations, 200)
