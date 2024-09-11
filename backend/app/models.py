from flask import current_app as app
import MySQLdb
from werkzeug.security import generate_password_hash
import json
# to serialize time to a json serializable format
from datetime import time

def get_db_connection():
    return MySQLdb.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB'],
    )
def ensure_tables_exist():
    connection = get_db_connection()
    cursor = connection.cursor()

    # create department table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)
    # create resources table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # cursor.create users table

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(100) NOT NULL,
        phone_number VARCHAR(30),
        password VARCHAR(255) NOT NULL,
        department_id INT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)
    
    # create boardroom table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS boardrooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capacity INT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)
    # create meeting table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        meeting_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        boardroom_id INT NOT NULL,
        department_id INT NOT NULL,
        resources_id JSON,
        FOREIGN KEY (boardroom_id) REFERENCES boardrooms(id),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        meeting_id INT NOT NULL,
        FOREIGN KEY (meeting_id) REFERENCES meetings(id),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

     # Create roles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # Create users_roles relationship table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (role_id) REFERENCES roles(id),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    # Create permissions table and relationships 
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (permission_id) REFERENCES permissions(id),
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    """)

    connection.commit()
    cursor.close()
    connection.close()

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
    ensure_tables_exist()
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
    ensure_tables_exist()
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
    ensure_tables_exist()
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
    ensure_tables_exist()
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
    ensure_tables_exist()
    connection = get_db_connection()
    cursor = connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT * FROM roles")
    roles = cursor.fetchall()
    cursor.close()
    connection.close()
    return roles

def get_meetings():
    ensure_tables_exist() 
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

