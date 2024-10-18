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

        required_fields = ["first_name", "last_name", "organization", "designation", "email", "phone", "meeting_id"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"msg": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
          # Check if the attendee already registered for the meeting
        if attendee.check_attendance(email, meeting_id):
            return jsonify({"msg": "You cannot register twice"}), 409
        
        response, status_code = attendee.create(
            first_name,last_name,organization,designation,email,phone,meeting_id,
        )

        return jsonify(response), status_code

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@attendees_blueprint.route("/api/v1/attendees", methods=["GET"])
def fetchall():
    attendee = Attendee()
    response, status_code = attendee.get_all()
    return jsonify(response), status_code


@attendees_blueprint.route("/api/v1/attendees/<int:id>", methods=["GET"])
def fetch_by_meeting_id(id):
    attendee = Attendee()
    response, status_code = attendee.get_by_meeting_id(id)
    return jsonify(response), status_code
