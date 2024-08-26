from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DB = os.getenv('MYSQL_DB')
    SECRET_KEY = os.getenv('SECRET_KEY')

    # Additional configurations
    SQLALCHEMY_TRACK_MODIFICATIONS = False
