from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Location
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found

locations_blueprint = Blueprint("locations_blueprint", __name__)


@locations_blueprint.route("/api/v1/locations", methods=["GET"])
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
