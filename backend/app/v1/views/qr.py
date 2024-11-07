from flask import Blueprint, send_file, current_app as app
from flask_jwt_extended import jwt_required
from ..models import Meeting
from utils import generate_qr_code
from utils.exception import DatabaseException
from utils.responses import response, no_data_found
from utils.decorators import roles_required

qr_blueprint = Blueprint("qr_blueprint", __name__)


@qr_blueprint.route("/api/v1/qr/<int:meeting_id>", methods=["GET"])
@jwt_required()
@roles_required(["admin"])
def get_qr_code(meeting_id):
    meeting = Meeting()
    server = app.config["SERVER"]
    url = str(server) + "/meetings/"
    try:
        if not meeting.get_by_id(meeting_id):
            return no_data_found()
        file = generate_qr_code(url, meeting_id)
        return send_file(file, mimetype="image/png")
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
