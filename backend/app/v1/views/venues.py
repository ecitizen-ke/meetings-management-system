from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Venue
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.validations import check_missing_fields
from utils.decorators import roles_required


venue_blueprint = Blueprint("venue_blueprint", __name__)


@venue_blueprint.route("/api/v1/venues", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create():
    venue = Venue()
    try:
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        missing_fields = check_missing_fields(data, ["name", "building", "town", "county"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        name = data.get("name")
        building = data.get("building")
        town = data.get("town")
        county = data.get("county")
        status = data.get("status")
        longitude = data.get("longitude")
        latitude = data.get("latitude")

        result = venue.create(name, building, town, county, status, longitude, latitude)
        if not isinstance(result, Exception):
            return response("Venue added successfully!", 201)
        else:
            raise DatabaseException(str(result))

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@venue_blueprint.route("/api/v1/venues", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall():
    venue = Venue()
    try:
        data = venue.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@venue_blueprint.route("/api/v1/venues/<int:id>", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchone(id):
    venue = Venue()
    try:
        data = venue.get_by_id(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@venue_blueprint.route("/api/v1/venues/<int:venue_id>", methods=["PATCH"])
@jwt_required()
@roles_required(["admin"])
def update(venue_id):

    try:
        venue = Venue()
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        fields = ["name", "building", "town", "county", "status"]
        missing_fields = check_missing_fields(data, fields)
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        if not venue.get_by_id(venue_id):
            return response("Meeting not found", 404)
        name = data.get("name")
        building = data.get("building")
        town = data.get("town")
        county = data.get("county")
        status = data.get("status")
        longitude = data.get("longitude")
        latitude = data.get("latitude")

        venue.update(name, building, town, county, status, longitude, latitude, venue_id)
        return response("Meeting updated successfully", 200)

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
