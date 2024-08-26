from flask import Flask
from flask_mysqldb import MySQL
from .routes import main_bp
from config import Config

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mysql.init_app(app)

    # Register blueprints
    app.register_blueprint(main_bp)

    return app
