from flask_mysqldb import MySQL
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = MySQL()
cors = CORS()
jwt = JWTManager()
