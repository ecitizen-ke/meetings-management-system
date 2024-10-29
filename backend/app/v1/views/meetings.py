import json
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.responses import response, response_with_data
from utils.exception import DatabaseException
from ..models import Meeting, Report


meetings_blueprint = Blueprint("meetings_blueprint", __name__)


@meetings_blueprint.route("/api/v1/meetings", methods=["POST"])
@jwt_required()
def create():
    meeting = Meeting()

    try:
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        venue_id = data.get("venue_id")
        title = data.get("title")
        description = data.get("description")
        meeting_date = data.get("meeting_date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        status = data.get("status")
        organizations = json.dumps(data.get("organizations"))

        required_fields = [
            "title",
            "description",
            "meeting_date",
            "start_time",
            "end_time",
            "organizations",
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)
        meeting.create(
            venue_id,
            title,
            description,
            meeting_date,
            start_time,
            end_time,
            organizations,
            status,
        )
        return response("Meeting added successfully", 201)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings", methods=["GET"])
@jwt_required()
def fetchall():
    meetings = Meeting()
    return response_with_data("OK", meetings.get_all(), 200)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["GET"])
@jwt_required()
def fetchone(id):
    meetings = Meeting()
    return response_with_data("OK", meetings.get_by_id(id), 200)


@meetings_blueprint.route("/api/v1/meetings/<int:id>/organizations", methods=["GET"])
@jwt_required()
def get_organizations_per_meeting(id):
    meetings = Meeting()
    return response_with_data("OK", meetings.get_organizations_by_meeting(id), 200)


@meetings_blueprint.route("/api/v1/meetings/<int:meeting_id>", methods=["PATCH"])
@jwt_required()
def update(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        venue_id = data.get("venue_id")
        title = data.get("title")
        description = data.get("description")
        meeting_date = data.get("meeting_date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        status = data.get("status")
        organizations = json.dumps(data.get("organizations"))

        required_fields = [
            "title",
            "description",
            "meeting_date",
            "start_time",
            "end_time",
            "organizations",
        ]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)

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
def update_status(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()
        status = data["status"]

        missing_fields = [field for field in ["status"] if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)

        if not meeting.get_by_id(meeting_id):
            return response("Meeting not found", 404)
        meeting.update_status(meeting_id, status)
        return response("Meeting status updated successfully", 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["DELETE"])
@jwt_required()
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
def summerize():
    report = Report()
    try:
        return response_with_data("OK", report.meetings_summary(), 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
