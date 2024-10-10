from flask import Blueprint, send_file, current_app as app
from utils import generate_qr_code
from utils.exception import DatabaseException
from utils.responses import response

qr_blueprint = Blueprint("qr_blueprint", __name__)


@qr_blueprint.route("/api/v1/qr/<int:meeting_id>", methods=["GET"])
def get_qr_code(meeting_id):
    server = app.config["SERVER"]
    url = str(server) + "/meetings/"
    try:
        file = generate_qr_code(url, meeting_id)
        return send_file(file, mimetype="image/png")
    except DatabaseException as e:
        return response("Something went wrong, " + str(e), 400)
