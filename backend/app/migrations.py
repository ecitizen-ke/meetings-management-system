from flask import current_app as app
import MySQLdb

def get_db_connection():
    return MySQLdb.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB'],
    )

def create_migrations_table(cursor):
    """Create a migrations table if it doesn't exist."""
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version TEXT NOT NULL UNIQUE,
        applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

def check_if_migration_applied(cursor, version):
    """Check if the migration version has already been applied."""
    cursor.execute("SELECT 1 FROM migrations WHERE version = %s", (version,))
    print ("migration version was already applied", version)
    return cursor.fetchone() is not None

def mark_migration_as_applied(cursor, version):
    """Mark the migration version as applied."""
    print("marking migration as applied", version)
    cursor.execute("INSERT INTO migrations (version) VALUES (%s)", (version,))

def run_migrations():
    connection = get_db_connection()
    cursor = connection.cursor()

    create_migrations_table(cursor)

    # This is a migration versioning number that will be usefull when we need to update the migrations in the future
    migration_version = '202409121509_ThirdMigration'

    if check_if_migration_applied(cursor, migration_version):
        print(f"Migration {migration_version} already applied.")
        cursor.close()
        connection.close()
        return

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

    cursor.execute("""
    SET @column_exists = (SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE table_name = 'meetings' 
            AND table_schema = DATABASE() 
            AND column_name = 'status');

            IF @column_exists = 0 THEN
                ALTER TABLE meetings
                ADD COLUMN status ENUM('draft', 'ongoing', 'complete', 'rescheduled', 'pending', 'cancelled') DEFAULT 'pending' AFTER resources_id;
            END IF;
    """)

    cursor.execute("""
    SET @column_exists = (SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = 'meetings'
            AND table_schema = DATABASE()
            AND column_name = 'location');

            IF @column_exists = 0 THEN
                ALTER TABLE meetings
                ADD COLUMN location TEXT AFTER boardroom_id;
            END IF;
    """)
    
    # make boardroom_id nullable
    cursor.execute("""
    ALTER TABLE meetings
    MODIFY COLUMN boardroom_id INT NULL;
    """)

    cursor.execute("""
    SET @column_exists = (SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = 'users'
            AND table_schema = DATABASE()
            AND column_name = 'designation');

            IF @column_exists = 0 THEN
                ALTER TABLE users
                ADD COLUMN designation VARCHAR(100) AFTER department_id;
            END IF;
    """)

    cursor.execute("""
    SET @column_exists = (SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE table_name = 'attendees'
            AND table_schema = DATABASE()
            AND column_name = 'designation');

            IF @column_exists = 0 THEN
                ALTER TABLE attendees
                ADD COLUMN designation VARCHAR(100) AFTER department;
            END IF;
    """)

    mark_migration_as_applied(cursor, migration_version)

    connection.commit()
    cursor.close()
    connection.close()
    print(f"Migration applied successfully.")

if __name__ == '__main__':
    run_migrations()