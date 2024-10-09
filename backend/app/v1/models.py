from app.db import Connection
from datetime import datetime
from utils import combine_date_time


class Organization:
    def __init__(self):
        self.db = Connection()

    def create(self, name, description):
        try:
            self.db.insert(
                "INSERT INTO organizations (name, description) VALUES (%s, %s)",
                (name, description),
            )
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
        self.db = Connection()

    def create(self, name, capacity, location, description):
        try:
            self.db.insert(
                "INSERT INTO boardrooms (name, capacity, location, description) VALUES (%s, %s, %s, %s)",
                (name, capacity, location, description),
            )
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
        self.db = Connection()

    def create(self, name, description, quantity):
        try:

            self.db.insert(
                "INSERT INTO resources (name, description, quantity) VALUES (%s, %s, %s)",
                (name, description, quantity),
            )
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
        self.db = Connection()

    def create(
        self,
        title,
        description,
        meeting_date,
        start_time,
        end_time,
        boardroom_id,
        organization_id,
        # resources_id,
        location,
    ):
        try:
            self.db.insert(
                "INSERT INTO meetings (title, description, meeting_date, start_time, end_time, boardroom_id, organization_id, location) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    title,
                    description,
                    meeting_date,
                    start_time,
                    end_time,
                    boardroom_id,
                    organization_id,
                    # resources_id,
                    location,
                ),
            )
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            meetings = self.db.fetchmany("SELECT * FROM meetings")
            for meeting in meetings:
                meeting["start_time"] = str(meeting["start_time"])
                meeting["end_time"] = str(meeting["end_time"])
                self.db.cursor.execute(
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
            self.db.cursor.execute("SELECT * FROM meetings WHERE id = %s", (id,))
            meeting = self.db.cursor.fetchone()
            meeting["start_time"] = str(meeting["start_time"])
            meeting["end_time"] = str(meeting["end_time"])
            return meeting
        except Exception as e:
            return e

    def update(
        self, meeting_id, title, description, meeting_date, start_time, end_time, boardroom_id
    ):
        try:
            self.db.cursor.execute(
                """
                UPDATE meetings SET title = %s, description = %s, meeting_date = %s, start_time = %s, end_time =%s, boardroom_id = %s
                WHERE id = %s
            """,
                (title, description, meeting_date, start_time, end_time, boardroom_id, meeting_id),
            )
            self.db.conn.commit()

        except Exception as e:
            self.db.rollback()
            return e

    def update_status(self, meeting_id, status):
        try:
            self.db.cursor.execute(
                """
                UPDATE meetings SET status = %s WHERE id = %s""",
                (status, meeting_id),
            )
            self.db.conn.commit()
        except Exception as e:
            self.db.rollback()
            return e

    def delete(self, id):
        try:
            self.db.cursor.execute("DELETE FROM meetings WHERE id = %s", (id,))
            self.db.conn.commit()
        except Exception as e:
            print(str(e))
            self.db.rollback()
            return e
        finally:
            self.db.close()


class Attendee:
    def __init__(self):
        self.db = Connection()

    def create(self, first_name, last_name, organization, designation, email, phone, meeting_id):
        try:
            statement = "INSERT INTO attendees (first_name, last_name, organization, designation, email, phone,meeting_id)VALUES (%s, %s, %s, %s, %s, %s, %s)"
            data = (first_name, last_name, organization, designation, email, phone, meeting_id)
            self.db.insert(statement, data)
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
        self.db = Connection()

    def create(self, name, description):
        try:
            statement = "INSERT INTO roles (name, description)VALUES (%s, %s)"
            data = (name, description)
            self.db.insert(statement, data)
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


class User:
    def __init__(self):
        self.db = Connection()

    def create(self, first_name, last_name, organization, designation, email, phone, password):
        """Save user details to users table in the database"""
        try:
            self.db.insert(
                "INSERT INTO users (first_name, last_name, organization, designation, email, phone, password) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (first_name, last_name, organization, designation, email, phone, password),
            )
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
        """Login user using login credentials"""
        user = self.find_by_email(email)
        if user and user["password"] == password:
            return user
        else:
            return False

    def asign_role(self, email, role_name):
        """Fetch all users in the database table"""
        try:
            role = self.db.fetchone("SELECT id FROM roles WHERE name = %s", (role_name,))
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if role:
                self.db.insert(
                    "INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)",
                    (user["id"], role["id"]),
                )
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
                if start_date_time <= current_date <= end_date_time:
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
