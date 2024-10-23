from flask import Blueprint, send_file
from flask_jwt_extended import jwt_required
from utils import generate_excel_file, generate_pdf_file
from ..models import Attendee, Meeting
from utils.exception import DatabaseException
from utils.responses import response

reports_blueprint = Blueprint("reports_blueprint", __name__)


@reports_blueprint.route("/api/v1/reports/excel/<int:id>", methods=["GET"])
@jwt_required()
def generate_excel_reports(id):
    attendees = Attendee().get_by_meeting_id(id)
    try:
        file = generate_excel_file(attendees, id)
        return send_file(
            file,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)


@reports_blueprint.route("/api/v1/reports/pdf/<int:id>", methods=["GET"])
@jwt_required()
def generate_pdf_reports(id):
    attendees = Attendee().get_by_meeting_id(id)
    meeting = Meeting().get_by_id(id)
    try:
        file = generate_pdf_file(meeting, attendees)
        return send_file(
            file,
            mimetype="application/pdf",
        )
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
