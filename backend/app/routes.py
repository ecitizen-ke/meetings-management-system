# backend/app/routes.py
from flask import Blueprint, request, jsonify, send_file, redirect, url_for
from .models import (
    get_meetings,
    get_attendees,
    add_attendee,
    get_meeting_by_id,
    create_department,
    get_departments,
    create_resource,
    get_resources,
    create_boardroom,
    get_boardrooms,
    create_user,
    get_users,
    create_roles,
    get_roles,
    create_meeting,
    reports_summary,
    delete_meeting,
    update_meeting,
)
from .utils import generate_qr_code, generate_excel_report

main_bp = Blueprint("main", __name__)


@main_bp.route("/meetings", methods=["GET"])
def list_meetings():
    meetings = get_meetings()
    return jsonify(meetings)


@main_bp.route("/meeting/<int:meeting_id>", methods=["GET"])
def get_meeting(meeting_id):
    meeting = get_meeting_by_id(meeting_id)
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404
    return jsonify(meeting)


@main_bp.route("/attendees", methods=["POST"])
def submit_attendee():
    data = request.get_json()
    add_attendee(data)
    return jsonify({"message": "Attendee added successfully"}), 201


@main_bp.route("/admin/attendees/<int:meeting_id>", methods=["GET"])
def admin_attendees(meeting_id):
    attendees = get_attendees(meeting_id)
    return jsonify(attendees)


@main_bp.route("/admin/generate_qr/<int:meeting_id>", methods=["GET"])
def generate_qr(meeting_id):
    qr_path = generate_qr_code(meeting_id)
    return send_file(qr_path, mimetype="image/png")


@main_bp.route("/admin/generate_excel/<int:meeting_id>", methods=["GET"])
def generate_excel(meeting_id):
    excel_path = generate_excel_report(meeting_id)
    return send_file(
        excel_path,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@main_bp.route("/departments", methods=["POST"])
def create_department_route():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400

        create_department(data)
        return jsonify({"msg": "Department created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/departments", methods=["GET"])
def list_departments():
    departments = get_departments()
    return jsonify(departments)


@main_bp.route("/resources", methods=["POST"])
def create_resource_route():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400

        create_resource(data)
        return jsonify({"msg": "Resource created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/resources", methods=["GET"])
def list_resources():
    resources = get_resources()
    return jsonify(resources)


# boardrooms
@main_bp.route("/boardrooms", methods=["POST"])
def create_boardroom_route():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400

        create_boardroom(data)
        return jsonify({"msg": "Boardroom created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/boardrooms", methods=["GET"])
def list_boardrooms():
    boardrooms = get_boardrooms()
    return jsonify(boardrooms)


# create users
@main_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    try:
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        if "first_name" not in data or "password" not in data or "email" not in data:
            return (
                jsonify(
                    {"msg": "'first_name','email' and 'password' fields are required"}
                ),
                400,
            )

        create_user(data)

        return jsonify({"msg": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


# get users
@main_bp.route("/users", methods=["GET"])
def list_users():
    users = get_users()
    return jsonify(users)


@main_bp.route("/roles", methods=["POST"])
def create_role():
    try:
        data = request.get_json()
        if not data or not isinstance(data, dict):
            return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

        if "name" not in data:
            return jsonify({"msg": "'name' field is required"}), 400

        create_roles(data)
        return jsonify({"msg": "Role created successfully"}), 201
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/roles", methods=["GET"])
def list_roles():
    roles = get_roles()
    return jsonify(roles)


@main_bp.route("/create-meeting", methods=["POST"])
def init_meeting():
    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({"msg": "Invalid JSON format or empty payload"}), 400

    if (
        "title" not in data
        or "description" not in data
        or "start_time" not in data
        or "end_time" not in data
    ):
        return (
            jsonify(
                {
                    "msg": "'title','description','start_time' and 'end_time' fields are required"
                }
            ),
            400,
        )

    create_meeting(data)
    return jsonify({"msg": "Meeting created successfully"}), 201


@main_bp.route("/meeting/<int:meeting_id>", methods=["DELETE"])
def delete_meeting_route(meeting_id):
    try:
        # Check if meeting exists before attempting to delete
        meeting = get_meeting_by_id(meeting_id)
        if not meeting:
            return jsonify({"error": "Meeting not found"}), 404

        # Delete the meeting
        delete_meeting(meeting_id)
        return jsonify({"msg": "Meeting deleted successfully"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/meeting/<int:meeting_id>", methods=["PUT"])
def edit_meeting(meeting_id):
    try:
        # Retrieve the request data
        data = request.get_json()
        title = data.get("title")
        description = data.get("description")
        meeting_date = data.get("meeting_date")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        boardroom_id = data.get("boardroom_id")

        # Check if all necessary fields are provided
        if not all(
            [title, description, meeting_date, start_time, end_time, boardroom_id]
        ):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if the meeting exists
        meeting = get_meeting_by_id(meeting_id)
        if not meeting:
            return jsonify({"error": "Meeting not found"}), 404

        # Update the meeting details
        update_meeting(
            meeting_id, title, description, meeting_date, start_time, end_time, boardroom_id
        )
        return jsonify({"msg": "Meeting updated successfully"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@main_bp.route("/reports-summary", methods=["GET"])
def reports_summary_route():
    summary = reports_summary()
    return jsonify(summary)
