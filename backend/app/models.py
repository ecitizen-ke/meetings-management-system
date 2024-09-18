from flask import current_app as app, jsonify
import MySQLdb
from werkzeug.security import generate_password_hash
import json
from datetime import datetime, date, time, timedelta
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
        INSERT INTO users (first_name, last_name, email, phone_number, password, department_id,designation)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data['first_name'], data.get('last_name', ''), data['email'], data.get('phone_number', ''), 
              hashed_password, data.get('department_id', 1), data.get('designation', 'staff') )
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

        cursor.execute("SELECT status FROM boardrooms WHERE id = %s", (data['boardroom_id'],))
        boardroom = cursor.fetchone()

        if not boardroom:  
            return {"error": "Boardroom not found"}, 404

        if boardroom[0] == 'unavailable':
            return {"error": "Boardroom is not available"}, 400

        cursor.execute("SELECT start_time, end_time, meeting_date,title FROM meetings WHERE boardroom_id = %s AND (status = 'pending' OR status = 'ongoing')", (data['boardroom_id'],))
        meetings = cursor.fetchall()


        for meeting in meetings:
            meeting_start_time = meeting[0]  # Access start_time by index
            meeting_end_time = meeting[1]    # Access end_time by index
            meeting_date = meeting[2]        # Access meeting_date by index


            if isinstance(meeting_date, str):
                meeting_date = datetime.strptime(meeting_date, '%Y-%m-%d').date()
            if isinstance(meeting_start_time, str):
                meeting_start_time = datetime.strptime(meeting_start_time, '%H:%M:%S').time()
            if isinstance(meeting_end_time, str):
                meeting_end_time = datetime.strptime(meeting_end_time, '%H:%M:%S').time()

            if isinstance(meeting_start_time, timedelta):
                meeting_start_time = (datetime.min + meeting_start_time).time()
            if isinstance(meeting_end_time, timedelta):
                meeting_end_time = (datetime.min + meeting_end_time).time()

            meeting_start_datetime = datetime.combine(meeting_date, meeting_start_time)
            meeting_end_datetime = datetime.combine(meeting_date, meeting_end_time)

            if isinstance(data['meeting_date'], str):
                data['meeting_date'] = datetime.strptime(data['meeting_date'], '%Y-%m-%d').date()

            if isinstance(data['start_time'], str):
                data['start_time'] = datetime.strptime(data['start_time'], '%H:%M:%S').time()
            if isinstance(data['end_time'], str):
                data['end_time'] = datetime.strptime(data['end_time'], '%H:%M:%S').time()

            data_start_datetime = datetime.combine(data['meeting_date'], data['start_time'])
            data_end_datetime = datetime.combine(data['meeting_date'], data['end_time'])

            if data_start_datetime < meeting_start_datetime and data_end_datetime < meeting_start_datetime:
                pass
            elif data_start_datetime > meeting_end_datetime and data_end_datetime > meeting_end_datetime:
                pass
            else:
                # return error and show the conflicting meeting
                return {"error": "Boardroom is not available at this time. Conflicting meeting: "+meeting[3]+' is being held from '+ meeting_start_datetime.strftime('%H:%M:%S') +' to '+ meeting_end_datetime.strftime('%H:%M:%S, %A,%d-%B-%Y') }, 400

        # Insert the new meeting
        cursor.execute("""
        INSERT INTO meetings (title, description, meeting_date, start_time, end_time, boardroom_id, department_id, resources_id, location)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (data['title'], data.get('description', ''), data['meeting_date'], data['start_time'], data['end_time'],
            data['boardroom_id'], data['department_id'], resources_json, data.get('location', None)))
        connection.commit()

        return {"msg": "Meeting created successfully"}, 201
    except Exception as e:
        connection.rollback()  # Rollback in case of error
        return {"error": f"Error inserting meeting: {str(e)}"}, 500

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
        "INSERT INTO attendees (first_name, last_name, email, phone, department, meeting_id, designation) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (data['first_name'], data['last_name'], data['email'], data['phone'], data['department'], data['meeting_id'], data['designation'])
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

def update_meeting_status(meeting_id, status):
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE meetings SET status = %s WHERE id = %s", (status, meeting_id))
    connection.commit()
    cursor.close()
    connection.close()

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
            update_meeting_status(meeting['id'], 'complete')
        elif meeting_date == current_date:  
            if start_datetime <= current_datetime <= end_datetime:
                meetings_summary['ongoing'] += 1
                update_meeting_status(meeting['id'], 'ongoing')
            elif current_datetime < start_datetime:
                meetings_summary['pending'] += 1
                update_meeting_status(meeting['id'], 'pending')
            elif current_datetime > end_datetime:
                meetings_summary['complete'] += 1
                update_meeting_status(meeting['id'], 'complete')
        else:  
            meetings_summary['pending'] += 1
            update_meeting_status(meeting['id'], 'pending')

    cursor.close()
    connection.close()

    return meetings_summary
