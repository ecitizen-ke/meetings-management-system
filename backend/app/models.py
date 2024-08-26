# backend/app/models.py
from flask import current_app as app
import MySQLdb

def get_db_connection():
    return MySQLdb.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB']
    )

def get_meetings():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM meetings")
    meetings = cursor.fetchall()
    cursor.close()
    connection.close()
    return meetings

def get_meeting_by_id(meeting_id):
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM meetings WHERE id = %s", (meeting_id,))
    meeting = cursor.fetchone()
    cursor.close()
    connection.close()
    return meeting

def get_attendees(meeting_id):
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM attendees WHERE meeting_id = %s", (meeting_id,))
    attendees = cursor.fetchall()
    cursor.close()
    connection.close()
    return attendees

def add_attendee(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute(
        "INSERT INTO attendees (first_name, last_name, email, phone, department, meeting_id) VALUES (%s, %s, %s, %s, %s, %s)",
        (data['first_name'], data['last_name'], data['email'], data['phone'], data['department'], data['meeting_id'])
    )
    connection.commit()
    cursor.close()
    connection.close()
