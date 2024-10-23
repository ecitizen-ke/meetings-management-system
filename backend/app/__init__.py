from flask import Flask
from config import Config


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    register_blueprints(app)
    initialize_extensions(app)
    return app


def initialize_extensions(app):
    from extensions import db, cors, jwt
    from .db import Database

    db.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)
    with app.app_context() as context:
        context.push()
        Database().create_tables()


def register_blueprints(app):
    from .v1.views.organizations import organizations_blueprint
    from .v1.views.boardrooms import boardroom_blueprint
    from .v1.views.meetings import meetings_blueprint
    from .v1.views.attendees import attendees_blueprint
    from .v1.views.resources import resources_blueprint
    from .v1.views.roles import roles_blueprint
    from .v1.views.auth import auth_blueprint
    from .v1.views.qr import qr_blueprint
    from .v1.views.reports import reports_blueprint

    app.register_blueprint(organizations_blueprint)
    app.register_blueprint(boardroom_blueprint)
    app.register_blueprint(meetings_blueprint)
    app.register_blueprint(attendees_blueprint)
    app.register_blueprint(roles_blueprint)
    app.register_blueprint(resources_blueprint)
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(qr_blueprint)
    app.register_blueprint(reports_blueprint)
