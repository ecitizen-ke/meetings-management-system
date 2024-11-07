from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ..models import Attendee
from ..models import Meeting
from ..models import Venue
from ..models import Organization
from utils.exception import DatabaseException
from utils.responses import response, response_with_data, no_data_found
from utils.validations import check_missing_fields
from utils.decorators import roles_required


attendees_blueprint = Blueprint("attendees_blueprint", __name__)


@attendees_blueprint.route("/api/v1/attendees", methods=["POST"])
def add():
    attendee = Attendee()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        missing_fields = check_missing_fields(
            data,
            [
                "meeting_id",
                "first_name",
                "last_name",
                "organization",
                "designation",
                "email",
                "phone",
                "signature",
            ],
        )
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        meeting_id = data.get("meeting_id")
        signature = data.get("signature")

        if not attendee.check_attendance(email, meeting_id):
            result = attendee.create(
                meeting_id,
                first_name,
                last_name,
                organization,
                designation,
                email,
                phone,
                signature,
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
@roles_required(["admin"])
def fetchall():
    attendee = Attendee()
    try:
        data = attendee.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@attendees_blueprint.route("/api/v1/attendees/<int:id>", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetch_by_meeting_id(id):
    attendee = Attendee()
    try:
        data = attendee.get_by_meeting_id(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@attendees_blueprint.route("/api/v1/attendees/meeting/<int:id>", methods=["GET"])
def get_meeting_details(id):
    meeting = Meeting()
    try:
        data = meeting.get_by_id(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
