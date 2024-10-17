import json
from flask import Blueprint, jsonify, request
from ..models import Meeting, Report


meetings_blueprint = Blueprint("meetings_blueprint", __name__)


@meetings_blueprint.route("/api/v1/meetings", methods=["POST"])
def create():
    meeting = Meeting()

    try:
        data = request.get_json()
        resources_json = json.dumps(data["resources_id"])
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        required_fields = ["title", "description", "start_time", "end_time"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        response,status_code =  meeting.create(
            data.get("title"),
            data.get("description"),
            data.get("meeting_date"),
            data.get("start_time"),
            data.get("end_time"),
            data.get("boardroom_id"),
            data.get("organization_id"),
            resources_json,
            data.get("location"),
            data.get("longitude"),
            data.get("latitude"),
            data.get("county"),
            data.get("town"),
        )
        #check the response  from the function in create 

        return jsonify (response),status_code
        # return jsonify({"msg": "Meeting added successfully"}), 201
    except Exception as e:
        return jsonify (response),status_code


@meetings_blueprint.route("/api/v1/meetings", methods=["GET"])
def fetchall():
    meetings = Meeting()
    try:
        response,status_code = meetings.get_all()
        return jsonify(response),status_code
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["GET"])
def fetchone(id):
    meetings = Meeting()
    try:
        response,status_code = meetings.get_by_id(id)
        return jsonify(response),status_code
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


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
        resources_id = json.dumps(data["resources_id"])
        organization_id = data["organization_id"]
        location = data.get("location")
        longitude = data.get("longitude")
        latitude = data.get("latitude")
        county = data.get("county")
        town = data.get("town")

        # Check if all necessary fields are provided
        if not all([title, description, meeting_date, start_time, end_time, boardroom_id]):
            return jsonify({"error": "Missing required fields"}), 400

        if not meeting.get_by_id(meeting_id):
            return jsonify({"error": "Meeting not found"}), 404

        response,status_code= meeting.update(
            meeting_id, title, description, meeting_date, start_time, end_time, boardroom_id, organization_id, resources_id, location, longitude, latitude, county, town
        )
        return jsonify(response),status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@meetings_blueprint.route("/api/v1/meetings/update-status/<int:meeting_id>", methods=["PATCH"])
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
        response,status_code = meeting.update_status(meeting_id, status)
        return jsonify(response),status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@meetings_blueprint.route("/api/v1/meetings/<int:id>", methods=["DELETE"])
def delete(id):
    meeting = Meeting()
    try:
        if meeting.get_by_id(id) is None:
            return jsonify({"error": "Meeting not found"}), 404
        response,status_code =  meeting.delete(id)
        return jsonify(response),status_code
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@meetings_blueprint.route("/api/v1/meetings/summary", methods=["GET"])
def summerize():
    report = Report()
    try:
        return jsonify(report.meetings_summary())
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500
