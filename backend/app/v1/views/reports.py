from flask import Blueprint, jsonify, send_file
from utils import generate_excel_file, generate_pdf_file
from ..models import Attendee, Meeting


reports_blueprint = Blueprint("reports_blueprint", __name__)


@reports_blueprint.route("/api/v1/reports/excel/<int:id>", methods=["GET"])
def generate_excel_reports(id):
    attendees = Attendee().get_by_meeting_id(id)
    try:
        file = generate_excel_file(attendees, id)
        return send_file(
            file,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500


@reports_blueprint.route("/api/v1/reports/pdf/<int:id>", methods=["GET"])
def generate_pdf_reports(id):
    attendees = Attendee().get_by_meeting_id(id)
    meeting = Meeting().get_by_id(id)
    try:
        file = generate_pdf_file(meeting, attendees)
        return send_file(
            file,
            mimetype="application/pdf",
        )
    except Exception as e:
        return jsonify({"msg": f"Error occurred: {str(e)}"}), 500
