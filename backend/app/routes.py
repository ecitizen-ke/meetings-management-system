# backend/app/routes.py
from flask import Blueprint, request, jsonify, send_file, redirect, url_for
from .models import get_meetings, get_attendees, add_attendee, get_meeting_by_id
from .utils import generate_qr_code, generate_excel_report

main_bp = Blueprint('main', __name__)

@main_bp.route('/meetings', methods=['GET'])
def list_meetings():
    meetings = get_meetings()
    return jsonify(meetings)

@main_bp.route('/meeting/<int:meeting_id>', methods=['GET'])
def get_meeting(meeting_id):
    meeting = get_meeting_by_id(meeting_id)
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404
    return jsonify(meeting)

@main_bp.route('/attendees', methods=['GET'])
def submit_attendee():
    data = request.get_json()
    add_attendee(data)
    return jsonify({"message": "Attendee added successfully"}), 201

@main_bp.route('/admin/attendees/<int:meeting_id>', methods=['GET'])
def admin_attendees(meeting_id):
    attendees = get_attendees(meeting_id)
    return jsonify(attendees)

@main_bp.route('/admin/generate_qr/<int:meeting_id>', methods=['GET'])
def generate_qr(meeting_id):
    qr_path = generate_qr_code(meeting_id)
    return send_file(qr_path, mimetype='image/png')

@main_bp.route('/admin/generate_excel/<int:meeting_id>', methods=['GET'])
def generate_excel(meeting_id):
    excel_path = generate_excel_report(meeting_id)
    return send_file(excel_path, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
