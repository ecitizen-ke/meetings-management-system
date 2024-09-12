from flask import current_app as app
import MySQLdb
from werkzeug.security import generate_password_hash
import json
from datetime import time, datetime
from .migrations import get_db_connection


def create_department(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
        INSERT INTO departments (name, description)
        VALUES (%s, %s)
        """, (data['name'], data.get('description', ''))
        )
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting department: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def get_departments():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM departments")
    departments = cursor.fetchall()
    cursor.close()
    connection.close()
    return departments

def create_resource(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
        INSERT INTO resources (name, description)
        VALUES (%s, %s)
        """, (data['name'], data.get('description', ''))
        )
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting resource: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def get_resources():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM resources")
    resources = cursor.fetchall()
    cursor.close()
    connection.close()
    return resources

def create_boardroom(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
        INSERT INTO boardrooms (name, capacity, location, description)
        VALUES (%s, %s, %s, %s)
        """, (data['name'], data['capacity'], data['location'], data.get('description', ''))
        )
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting boardroom: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def get_boardrooms():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM boardrooms")
    boardrooms = cursor.fetchall()
    cursor.close()
    connection.close()
    return boardrooms

def create_user(data):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        hashed_password = generate_password_hash(data['password'])

        print(hashed_password)
        cursor.execute("""
        INSERT INTO users (first_name, last_name, email, phone_number, password, department_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        """, (data['first_name'], data.get('last_name', ''), data['email'], data.get('phone_number', ''), 
              hashed_password, data.get('department_id', 1))
        )
        
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting user: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def create_meeting(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        resources_json = json.dumps(data.get('resources_id', {}))

        cursor.execute("""
        INSERT INTO meetings (title, description, meeting_date, start_time, end_time, boardroom_id, department_id, resources_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (data['title'], data.get('description', ''), data['meeting_date'], data['start_time'], data['end_time'], data['boardroom_id'], data['department_id'], resources_json)
        )
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting meeting: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def get_users():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT id, first_name, last_name, email, phone_number, department_id FROM users")
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return users

def create_roles(data):
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
        INSERT INTO roles (name, description)
        VALUES (%s, %s)
        """, (data['name'], data.get('description', ''))
        )
        connection.commit()

    except Exception as e:
        connection.rollback()  # Rollback in case of error
        raise Exception(f"Error inserting role: {str(e)}")

    finally:
        cursor.close()
        connection.close()

def get_roles():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM roles")
    roles = cursor.fetchall()
    cursor.close()
    connection.close()
    return roles

def get_meetings(): 
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM meetings")
    meetings = cursor.fetchall()
    for meeting in meetings:
        meeting['start_time'] = str(meeting['start_time'])
        meeting['end_time'] = str(meeting['end_time'])

    for meeting in meetings:
        meeting['resources_id'] = json.loads(meeting['resources_id'])
    
    for meeting in meetings:
        cursor.execute("SELECT name FROM boardrooms WHERE id = %s", (meeting['boardroom_id'],))
        boardroom = cursor.fetchone()
        meeting['boardroom_name'] = boardroom['name']
    
    for meeting in meetings:
        cursor.execute("SELECT name FROM departments WHERE id = %s", (meeting['department_id'],))
        department = cursor.fetchone()
        meeting['department_name'] = department['name']

    cursor.close()
    connection.close()
    return meetings

def get_meeting_by_id(meeting_id):
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM meetings WHERE id = %s", (meeting_id,))
    meeting = cursor.fetchone()
    meeting['start_time'] = str(meeting['start_time'])
    meeting['end_time'] = str(meeting['end_time'])
    meeting['resources_id'] = json.loads(meeting['resources_id'])
    cursor.execute("SELECT name FROM boardrooms WHERE id = %s", (meeting['boardroom_id'],))
    boardroom = cursor.fetchone()
    meeting['boardroom_name'] = boardroom['name']
    cursor.execute("SELECT name FROM departments WHERE id = %s", (meeting['department_id'],))
    department = cursor.fetchone()
    meeting['department_name'] = department['name']
    cursor.close()
    connection.close()
    return meeting

def get_attendees(meeting_id):
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM attendees WHERE meeting_id = %s", (meeting_id,))
    attendees = cursor.fetchall()
    cursor.execute("SELECT title FROM meetings WHERE id = %s", (meeting_id,))
    meeting = cursor.fetchone()
    for attendee in attendees:
        attendee['meeting_title'] = meeting['title']
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

def assign_role_to_user(user_id, role_name):
    connection = get_db_connection()
    cursor = connection.cursor()

    # Fetch role by name
    cursor.execute("SELECT id FROM roles WHERE name = %s", (role_name,))
    role = cursor.fetchone()

    if role:
        # Assign role to user
        cursor.execute("INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)", (user_id, role['id']))
        connection.commit()

    cursor.close()
    connection.close()

from datetime import datetime, date, time, timedelta

def reports_summary():
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM meetings")
    meetings = cursor.fetchall()

    meetings_summary = {
        "pending": 0,
        "ongoing": 0,
        "complete": 0
    }

    current_datetime = datetime.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    for meeting in meetings:
        meeting_date = meeting['meeting_date']
        start_time = meeting['start_time']
        end_time = meeting['end_time']

        
        if isinstance(start_time, timedelta):
            start_time = (datetime.min + start_time).time()
        if isinstance(end_time, timedelta):
            end_time = (datetime.min + end_time).time()

        start_datetime = datetime.combine(meeting_date, start_time)
        end_datetime = datetime.combine(meeting_date, end_time)

        if meeting_date < current_date:  
            meetings_summary['complete'] += 1
        elif meeting_date == current_date:  
            if start_datetime <= current_datetime <= end_datetime:
                meetings_summary['ongoing'] += 1
            elif current_datetime < start_datetime:
                meetings_summary['pending'] += 1
            elif current_datetime > end_datetime:
                meetings_summary['complete'] += 1
        else:  
            meetings_summary['pending'] += 1

    cursor.close()
    connection.close()

    return meetings_summary
