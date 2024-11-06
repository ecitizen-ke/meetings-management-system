import json
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils import parse_integer_from_string
from utils.responses import response, response_with_data, no_data_found
from utils.validations import check_missing_fields
from utils.exception import DatabaseException
from utils.decorators import roles_required
from ..models import Meeting, Report


meetings_blueprint = Blueprint("meetings_blueprint", __name__)


@meetings_blueprint.route("/api/v1/meetings", methods=["POST"])
@jwt_required()
@roles_required(["admin"])
def create():
    meeting = Meeting()

    try:
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        fields = [
            "title",
            "description",
            "meeting_date",
            "start_time",
            "end_time",
            "organizations",
        ]
        missing_fields = check_missing_fields(data, fields)
        # check for missing fields and return error message
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)
        # check meeting date is in the future
        if not meeting.is_date_valid(data.get("meeting_date")):
            return response("Meeting date should be in the future", 400)
        # check start time is before end time
        if not meeting.is_time_valid(data.get("start_time"), data.get("end_time")):
            return response("Start time should be before end time", 400)
        venue_id = data.get("venue_id")
        title = data.get("title")
        description = data.get("description")
        meeting_date = data.get("meeting_date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        status = data.get("status")
        organizations = json.dumps(data.get("organizations"))

        data = meeting.create(
            venue_id,
            title,
            description,
            meeting_date,
            start_time,
            end_time,
            organizations,
            status,
        )

        if not isinstance(data, Exception):
            return response("Meeting created successfully!", 201)
        else:
            raise DatabaseException(data)
    except DatabaseException as e:
        error_code = parse_integer_from_string(str(e))
        if error_code == 1452:
            return response("An organization id provided does not exist in the table!", 400)
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchall():
    meetings = Meeting()
    try:
        data = meetings.get_all()
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def fetchone(id):
    meetings = Meeting()
    try:
        data = meetings.get_by_id(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:id>/organizations", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def get_organizations_per_meeting(id):
    meetings = Meeting()
    try:
        data = meetings.get_organizations_by_meeting(id)
        if not isinstance(data, Exception):
            if not data:
                return no_data_found()
            return response_with_data("OK", data, 200)
        else:
            raise DatabaseException(str(data))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:meeting_id>", methods=["PATCH"])
@jwt_required()
@roles_required(["admin"])
def update(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        fields = [
            "title",
            "description",
            "meeting_date",
            "start_time",
            "end_time",
            "organizations",
        ]
        missing_fields = check_missing_fields(data, fields)
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        venue_id = data.get("venue_id")
        title = data.get("title")
        description = data.get("description")
        meeting_date = data.get("meeting_date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        status = data.get("status")
        organizations = json.dumps(data.get("organizations"))

        if not meeting.get_by_id(meeting_id):
            return response("Meeting not found", 404)

        meeting.update(
            venue_id,
            title,
            description,
            meeting_date,
            start_time,
            end_time,
            organizations,
            status,
            meeting_id,
        )
        return response("Meeting updated successfully", 200)

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/update-status/<int:meeting_id>", methods=["PATCH"])
@jwt_required()
@roles_required(["admin"])
def update_status(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()
        status = data["status"]

        missing_fields = check_missing_fields(data, ["status"])
        if missing_fields:
            return response(f"Field(s) {', '.join(missing_fields)} required!", 400)

        if not meeting.get_by_id(meeting_id):
            return response("Meeting not found", 404)
        meeting.update_status(meeting_id, status)
        return response("Meeting status updated successfully", 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["DELETE"])
@jwt_required()
@roles_required(["admin"])
def delete(id):
    meeting = Meeting()
    try:
        if not meeting.get_by_id(id):
            return response("Meeting not found", 404)
        meeting.delete(id)
        return response("Meeting deleted successfully", 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/summary", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def summerize():
    report = Report()
    try:
        return response_with_data("OK", report.meetings_summary(), 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
