from flask import Blueprint, jsonify, request
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
        # resources_json = json.dumps(data["resources_id"])
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        required_fields = ["title", "description", "start_time", "end_time"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        meeting.create(
            data.get("title"),
            data.get("description"),
            data.get("meeting_date"),
            data.get("start_time"),
            data.get("end_time"),
            data.get("boardroom_id"),
            # resources_json,
            data.get("organization_id"),
            data.get("location"),
            data.get("longitude"),
            data.get("latitude"),
            data.get("county"),
            data.get("town"),
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


@meetings_blueprint.route("/api/v1/meetings/<int:meeting_id>", methods=["PUT"])
@jwt_required()
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

        # Check if all necessary fields are provided
        if not all([title, description, meeting_date, start_time, end_time, boardroom_id]):
            return jsonify({"error": "Missing required fields"}), 400

        if not meeting.get_by_id(meeting_id):
            return jsonify({"error": "Meeting not found"}), 404

        meeting.update(
            meeting_id, title, description, meeting_date, start_time, end_time, boardroom_id
        )

        return jsonify({"message": "Meeting updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@meetings_blueprint.route("/api/v1/meetings/update-status/<int:meeting_id>", methods=["PATCH"])
@jwt_required()
def update_status(meeting_id):
    try:
        meeting = Meeting()
        data = request.get_json()
        status = data["status"]

        # Check if all necessary fields are provided
        if not all([status]):
            return jsonify({"error": "Missing required fields"}), 400

        if not meeting.get_by_id(meeting_id):
            print(meeting.get_by_id(meeting_id))
            return jsonify({"error": "Meeting not found"}), 404
        meeting.update_status(meeting_id, status)
        return jsonify({"message": "Meeting status updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    meeting = Meeting()
    try:
        if not meeting.get_by_id(id):
            return jsonify({"error": "Meeting not found"}), 404
        meeting.delete(id)
        return jsonify({"msg": "Meeting deleted successfully"}), 200
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@meetings_blueprint.route("/api/v1/meetings/summary", methods=["GET"])
@jwt_required()
def summerize():
    report = Report()
    try:
        return jsonify(report.meetings_summary())
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500
