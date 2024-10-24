from flask import Blueprint, jsonify, request
import json
from ..models import Location

locations_blueprint = Blueprint("locations_blueprint", __name__)


@locations_blueprint.route("/api/v1/locations", methods=["GET"])
def fetchall():
    locations = Location()
    return jsonify(locations.get_all())


@locations_blueprint.route("/api/v1/location-towns", methods=["GET"])
def get_locations_select():
    county = request.args.get("county", None)
    search = request.args.get("search", "")

    if not county:
        return jsonify([])  # Return empty response if county is not provided

    locations_model = Location()
    locations = locations_model.filter_by_county_and_search(county, search)

    if not isinstance(locations, list):
        # get specific error message
        return jsonify(locations)

    response = []
    for location in locations:
        response.append({"id": location[0], "name": location[1]})

    return jsonify(response)
