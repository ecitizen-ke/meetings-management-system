from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Attendee
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


attendees_blueprint = Blueprint("attendees_blueprint", __name__)


@attendees_blueprint.route("/api/v1/attendees", methods=["POST"])
@jwt_required()
def add():
    attendee = Attendee()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        meeting_id = data.get("meeting_id")

        if not all([first_name, last_name, organization, designation, email, phone, meeting_id]):
            return response("Missing required fields", 400)

        if not attendee.check_attendance(email, meeting_id):
            result = attendee.create(
                first_name, last_name, organization, designation, email, phone, meeting_id
            )
            if not isinstance(result, Exception):
                return response("Attendee added successfully", 201)
            else:
                raise DatabaseException(str(result))
        else:
            return response("You cannot register twice", 409)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@attendees_blueprint.route("/api/v1/attendees", methods=["GET"])
@jwt_required()
def fetchall():
    attendee = Attendee()
    return response_with_data("OK", attendee.get_all(), 200)


@attendees_blueprint.route("/api/v1/attendees/<int:id>", methods=["GET"])
@jwt_required()
def fetch_by_meeting_id(id):
    attendee = Attendee()
    return response_with_data("OK", attendee.get_by_meeting_id(id), 200)
