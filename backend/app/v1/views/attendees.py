from flask import Blueprint, jsonify, request
from ..models import Attendee

attendees_blueprint = Blueprint("attendees_blueprint", __name__)


@attendees_blueprint.route("/api/v1/attendees", methods=["POST"])
def add():
    attendee = Attendee()
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        organization = data.get("organization")
        designation = data.get("designation")
        email = data.get("email")
        phone = data.get("phone")
        meeting_id = data.get("meeting_id")

        if not all([first_name, last_name, organization, designation, email, phone, meeting_id]):
            return jsonify({"error": "Missing required fields"}), 400

        if not attendee.check_attendance(email, meeting_id):
            attendee.create(
                first_name, last_name, organization, designation, email, phone, meeting_id
            )
            return jsonify({"msg": "Attendee added successfully"}), 201
        else:
            return jsonify({"msg": "You cannot register twice"}), 409

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@attendees_blueprint.route("/api/v1/attendees", methods=["GET"])
def fetchall():
    attendee = Attendee()
    return jsonify(attendee.get_all())


@attendees_blueprint.route("/api/v1/attendees/<int:id>", methods=["GET"])
def fetch_by_meeting_id(id):
    attendee = Attendee()
    return jsonify(attendee.get_by_meeting_id(id))
