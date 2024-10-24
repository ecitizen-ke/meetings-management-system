from app.db import Database
from datetime import datetime
from utils import combine_date_time
from passlib.hash import pbkdf2_sha256 as sha256


class Organization:
    def __init__(self):
        self.db = Database()

    def create(self, name, description):
        try:
            self.db.execute(
                "INSERT INTO organizations (name, description) VALUES (%s, %s)",
                (name, description),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM organizations")
        except Exception:
            pass

        finally:
            self.db.close()


class Boardroom:
    def __init__(self):
        self.db = Database()

    def create(self, name, capacity, location, description):
        try:
            self.db.execute(
                "INSERT INTO boardrooms (name, capacity, location, description) VALUES (%s, %s, %s, %s)",
                (name, capacity, location, description),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM boardrooms")
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            return self.db.fetchone("SELECT status FROM boardrooms WHERE id = %s", (id,))
        except Exception as e:
            return e
        finally:
            self.db.close()


class Resource:
    def __init__(self):
        self.db = Database()

    def create(self, name, description, quantity):
        try:

            self.db.execute(
                "INSERT INTO resources (name, description, quantity) VALUES (%s, %s, %s)",
                (name, description, quantity),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM resources")
        except Exception as e:
            return e
        finally:
            self.db.close()


class Meeting:
    def __init__(self):
        self.db = Database()

    def create(
        self,
        title,
        description,
        meeting_date,
        start_time,
        end_time,
        boardroom_id,
        organization_id,
        location,
        longitude,
        latitude,
        county,
        town,
    ):
        try:

            self.db.execute(
                "INSERT INTO meetings (title, description, meeting_date, start_time, end_time, boardroom_id, organization_id, location, longitude, latitude, county, town) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s, %s)",
                (
                    title,
                    description,
                    meeting_date,
                    start_time,
                    end_time,
                    boardroom_id,
                    organization_id,
                    location,
                    longitude,
                    latitude,
                    county,
                    town,
                ),
            )

            if self.db.insert_success():
                self.db.commit()

        except Exception as e:
            self.db.rollback()
            print("Database error:", e)  # Print the full error message
            return {"msg": f"An error occurred: {str(e)}"}, 500
        finally:
            self.db.close()

    def get_all(self):
        try:
            meetings = self.db.fetchmany("SELECT * FROM meetings")

            for meeting in meetings:
                meeting["start_time"] = str(meeting["start_time"])
                meeting["end_time"] = str(meeting["end_time"])
                self.db.execute(
                    "SELECT name FROM boardrooms WHERE id = %s", (meeting["boardroom_id"],)
                )
                boardroom = self.db.cursor.fetchone()
                meeting["boardroom_name"] = boardroom["name"]
            return meetings
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            self.db.execute("SELECT * FROM meetings WHERE id = %s", (id,))
            meeting = self.db.cursor.fetchone()
            meeting["start_time"] = str(meeting["start_time"])
            meeting["end_time"] = str(meeting["end_time"])
            return meeting
        except Exception as e:
            return e

    def update(
        self,
        meeting_id,
        title,
        description,
        meeting_date,
        start_time,
        end_time,
        boardroom_id,
        organization_id,
        resources_id,
        location,
        longitude,
        latitude,
        county,
        town,
    ):
        try:
            self.db.execute(
                """
                UPDATE meetings SET title = %s, description = %s, meeting_date = %s, start_time = %s, end_time =%s, boardroom_id = %s, organization_id = %s, resources_id = %s, location = %s, longitude = %s, latitude = %s, county = %s, town = %s
                WHERE id = %s
            """,
                (
                    title,
                    description,
                    meeting_date,
                    start_time,
                    end_time,
                    boardroom_id,
                    meeting_id,
                    organization_id,
                    resources_id,
                    location,
                    longitude,
                    latitude,
                    county,
                    town,
                ),
            )
            self.db.commit()

            check_location = self.check_location(county, town)
            if not check_location:
                self.db.insert(
                    "INSERT INTO locations (county, town) VALUES (%s, %s)", (county, town)
                )

        except Exception as e:
            self.db.rollback()
            return e

    def update_status(self, meeting_id, status):
        try:
            self.db.execute(
                """
                UPDATE meetings SET status = %s WHERE id = %s""",
                (status, meeting_id),
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e

    def delete(self, id):
        try:
            self.db.execute("DELETE FROM meetings WHERE id = %s", (id,))
            self.db.commit()
        except Exception as e:
            print(str(e))
            self.db.rollback()
            return e
        finally:
            self.db.close()


class Attendee:
    def __init__(self):
        self.db = Database()

    def create(self, first_name, last_name, organization, designation, email, phone, meeting_id):
        try:
            statement = "INSERT INTO attendees (first_name, last_name, organization, designation, email, phone,meeting_id)VALUES (%s, %s, %s, %s, %s, %s, %s)"
            data = (first_name, last_name, organization, designation, email, phone, meeting_id)
            self.db.execute(statement, data)
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM attendees")
        except Exception:
            pass
        finally:
            self.db.close()

    def get_by_meeting_id(self, id):
        try:
            return self.db.fetchandfilter("SELECT * FROM attendees WHERE meeting_id = %s", (id,))
        except Exception as e:
            return e
        finally:
            self.db.close()

    def check_attendance(self, email, meeting_id):
        try:
            if self.db.fetchone(
                "SELECT * FROM attendees WHERE email = %s AND meeting_id = %s", (email, meeting_id)
            ):
                return True
        except Exception as e:
            return e


class Role:
    def __init__(self):
        self.db = Database()

    def create(self, name, description):
        try:
            statement = "INSERT INTO roles (name, description)VALUES (%s, %s)"
            data = (name, description)
            self.db.execute(statement, data)
            if self.db.insert_success():
                self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM roles")
        except Exception as e:
            return e
        finally:
            self.db.close()

    def update(self, id, name, description):
        try:
            self.db.execute(
                "UPDATE roles SET name = %s, description = %s WHERE id = %s",
                (name, description, id),
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def delete(self, id):
        try:
            self.db.execute("DELETE FROM roles WHERE id = %s", (id,))
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def add_permission(self, role_id, permissions):
        try:
            for permission in permissions:
                self.db.execute(
                    "INSERT INTO roles_permissions (role_id, permission_id) VALUES (%s, %s)",
                    (role_id, permission),
                )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def has_permission(self, role_id, permission_id):
        try:
            return self.db.fetchone(
                "SELECT * FROM roles_permissions WHERE role_id = %s AND permission_id = %s",
                (role_id, permission_id),
            )
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_permissions(self, role_id):
        try:
            return self.db.fetchmany(
                "SELECT * FROM roles_permissions WHERE role_id = %s", (role_id,)
            )
        except Exception as e:
            return e
        finally:
            self.db.close()


class Permission:
    def __init__(self):
        self.db = Database()

    def create(self, name):
        try:
            self.db.execute("INSERT INTO permissions (name) VALUES (%s)", (name,))
            if self.db.insert_success():
                self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM permissions")
        except Exception as e:
            return e
        finally:
            self.db.close()

    def assign_permission_to_role(self, role_id, permission_id):
        try:
            self.db.execute(
                "INSERT INTO roles_permissions (role_id, permission_id) VALUES (%s, %s)",
                (role_id, permission_id),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()


class User:

    def __init__(self):
        self.db = Database()

    def create(self, first_name, last_name, organization, designation, email, phone, password):
        """Save user details to users table in the database"""
        try:
            self.db.execute(
                "INSERT INTO users (first_name, last_name, organization, designation, email, phone, password) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (
                    first_name,
                    last_name,
                    organization,
                    designation,
                    email,
                    phone,
                    User.generate_hash(password),
                ),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def find_by_email(self, email):
        try:
            return self.db.fetchone("SELECT * FROM users WHERE email = %s", (email,))
        except Exception as e:
            return e

    def login(self, email, password):
        user = self.find_by_email(email)
        try:
            if user is not None and User.verify_hash(password, user.get("password")):
                return self.db.fetchone(
                    "SELECT * FROM users WHERE email=%s;",
                    (email,),
                )
        except Exception as e:
            return e
        finally:
            self.db.close()

    def assign_role(self, email, role_name):
        """Fetch all users in the database table"""
        try:
            role = self.db.fetchone("SELECT id FROM roles WHERE name = %s", (role_name,))
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if role:
                self.db.execute(
                    "INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)",
                    (user["id"], role["id"]),
                )
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_users(self):
        """Fetch all users in the database table"""
        try:
            return self.db.fetchmany("SELECT * FROM users")
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def has_role(self, email, role_name):
        try:
            role = self.db.fetchone("SELECT id FROM roles WHERE name = %s", (role_name,))
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if not role or not user:
                return False

            user_roles = self.db.fetchone(
                "SELECT * FROM users_roles WHERE user_id = %s AND role_id = %s",
                (user["id"], role["id"]),
            )
            if user_roles:
                return True
            else:
                return False

        except Exception as e:
            return e
        # finally:
        #     self.db.close()

    def has_permission(self, email, permission_name):
        try:

            permission = self.db.fetchone(
                "SELECT id FROM permissions WHERE name = %s", (permission_name,)
            )

            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if not permission or not user:
                return False  # Permission or User not found

            role = self.db.fetchone(
                "SELECT role_id FROM users_roles WHERE user_id = %s", (user["id"],)
            )
            if not role:
                return False  # User has no assigned roles

            role_permissions = self.db.fetchone(
                "SELECT * FROM roles_permissions WHERE role_id = %s AND permission_id = %s",
                (role["role_id"], permission["id"]),
            )
            if role_permissions:
                return True
            else:
                return False
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_role(self, email):
        try:
            # return email
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if not user:
                return None  # User

            role = self.db.fetchone(
                "SELECT role_id FROM users_roles WHERE user_id = %s", (user["id"],)
            )
            if not role:
                return None  # User has no assigned roles

            return self.db.fetchone("SELECT name FROM roles WHERE id = %s", (role["role_id"],))

        except Exception as e:
            print(f"Database Error: {e}")
            return None

    @staticmethod
    def generate_hash(password):
        return sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash):
        return sha256.verify(password, hash)


class Report:

    def __init__(self):
        self.meetings = Meeting()

    def meetings_summary(self):
        meetings_status = {"pending": 0, "ongoing": 0, "complete": 0}
        current_date_time = datetime.now()
        current_date = current_date_time.date()
        for meeting in self.meetings.get_all():
            meeting_date = meeting["meeting_date"]
            start = meeting["start_time"]
            end = meeting["end_time"]
            # construct date time from a given date and time
            start_date_time = combine_date_time(meeting_date, start)
            end_date_time = combine_date_time(meeting_date, end)
            if meeting_date < current_date:
                print("True")
                meetings_status["complete"] += 1
                # Meeting().update_status(meeting["id"], "complete")
            elif meeting_date == current_date:
                if start_date_time <= current_date_time <= end_date_time:
                    meetings_status["ongoing"] += 1
                    # Meeting().update_status(meeting["id"], "ongoing")
                elif current_date_time < start_date_time:
                    meetings_status["pending"] += 1
                    # Meeting().update_status(meeting["id"], "pending")
                elif current_date_time > end_date_time:
                    meetings_status["complete"] += 1
                    # Meeting().update_status(meeting["id"], "complete")
            else:
                meetings_status["pending"] += 1
                # self.meetings.update_status(meeting["id"], "pending")
        return meetings_status


class Location:
    def __init__(self):
        self.db = Database()

    def create(self, county, town):
        try:
            # check if location already exists
            location = self.db.fetchone("SELECT * FROM locations WHERE county = %s", (county,))
            # check if town exists in the list location variable
            if location and town in location["town"]:
                return "Location already exists"
            self.db.execute("INSERT INTO locations (county, town) VALUES (%s, %s)", (county, town))
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM locations")
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            return self.db.fetchone("SELECT * FROM locations WHERE id = %s", (id,))
        except Exception as e:
            return e
        finally:
            self.db.close()

    def filter_by_county_and_search(self, county, search):
        try:
            query = "SELECT id, town FROM locations WHERE county LIKE %s AND town LIKE %s ORDER BY town ASC LIMIT 10"
            params = (f"%{county}%", f"%{search}%")
            return self.db.fetchandfilter(query, params)
        except Exception as e:
            return e
        finally:
            self.db.close()
