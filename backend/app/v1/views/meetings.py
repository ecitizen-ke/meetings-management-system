import json
from flask import Blueprint, request
from ..models import Meeting, Report
from utils.exception import DatabaseException
from utils.responses import response, response_with_data


meetings_blueprint = Blueprint("meetings_blueprint", __name__)


@meetings_blueprint.route("/api/v1/meetings", methods=["POST"])
def create():
    meeting = Meeting()

    try:
        data = request.get_json()
        required_fields = [
            "title",
            "description",
            "start_time",
            "end_time",
            "organization_id",
            "location",
            "meeting_date",
            "boardroom_id",
        ]
        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return response(f"Missing required fields: {', '.join(missing_fields)}", 400)

        result = meeting.create(
            data.get("title"),
            data.get("description"),
            data.get("meeting_date"),
            data.get("start_time"),
            data.get("end_time"),
            data.get("boardroom_id"),
            data.get("department_id"),
            # resources_json,
            data.get("organization_id"),
            data.get("location"),
            data.get("longitude"),
            data.get("latitude"),
            data.get("county"),
            data.get("town"),
        )
        if not isinstance(result, Exception):
            return response("Meeting added successfully!", 201)
        else:
            raise DatabaseException(str(result))
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings", methods=["GET"])
def fetchall():
    meetings = Meeting()
    return response_with_data("OK", meetings.get_all(), 200)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["GET"])
def fetchone(id):
    meetings = Meeting()
    return response_with_data("OK", meetings.get_by_id(id), 200)


@meetings_blueprint.route("/api/v1/meetings/<int:meeting_id>", methods=["PUT"])
def update(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()

        # meeting_id = data["meeting_id"]
        title = data["title"]
        description = data["description"]
        meeting_date = data["meeting_date"]
        start_time = data["start_time"]
        end_time = data["end_time"]
        boardroom_id = data["boardroom_id"]

        if not data or not isinstance(data, dict):
            return response("Invalid JSON format or empty payload", 400)

        # Check if all necessary fields are provided
        if not all([title, description, meeting_date, start_time, end_time, boardroom_id]):
            return response("Missing required fields!", 400)

        if not meeting.get_by_id(meeting_id):
            return response("Meeting not found!", 404)

        meeting.update(
            meeting_id, title, description, meeting_date, start_time, end_time, boardroom_id
        )

        return response("Meeting updated successfully!", 200)

    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/update-status/<int:meeting_id>", methods=["PATCH"])
def update_status(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()
        status = data["status"]

        # Check if all necessary fields are provided
        if not all([status]):
            return response("Missing required fields!", 400)

        if not meeting.get_by_id(meeting_id):
            return response("Meeting not found!", 404)
        meeting.update_status(meeting_id, status)
        return response("Meeting status updated successfully!", 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["DELETE"])
def delete(id):
    meeting = Meeting()
    try:
        if not meeting.get_by_id(id):
            return response("Meeting not found!", 404)
        meeting.delete(id)
        return response("Meeting deleted successfully!", 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@meetings_blueprint.route("/api/v1/meetings/summary", methods=["GET"])
def summerize():
    report = Report()
    try:
        return response_with_data("OK", report.meetings_summary(), 200)
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
