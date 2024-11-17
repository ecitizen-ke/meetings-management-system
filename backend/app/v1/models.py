import json
from datetime import datetime
from passlib.hash import pbkdf2_sha256 as sha256
from app.db import Database
from utils import combine_date_time, json_to_list, parse_date
import os


class Organization:
    def __init__(self):
        self.db = Database()

    def create(self, name, description, abbreviation=None):
        try:
            self.db.execute(
                "INSERT INTO organizations (name, description, abbreviation) VALUES (%s, %s, %s)",
                (name, description, abbreviation),
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
        except Exception as e:
            return e
        finally:
            self.db.close()

    def filter_by_search(self, search):
        try:
            return self.db.fetchmany(
                "SELECT id, name FROM organizations WHERE name LIKE %s", (f"%{search}%",)
            )
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            return self.db.fetchone("SELECT * FROM organizations WHERE id = %s", (id,))
        except Exception as e:
            return e

    def delete_organization(self, id):
        try:
            if not id:
                raise ValueError("ID cannot be None")
            if not self.db.fetchone("SELECT * FROM organizations WHERE id = %s", (id,)):
                raise ValueError("Organization does not exist")
            self.db.execute("DELETE FROM organizations WHERE id = %s", (id,))
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()


class Location:
    def __init__(self):
        self.db = Database()

    def create(self, county, town):
        try:
            # check if location already exists
            location = self.db.fetchone("SELECT * FROM locations WHERE county = %s", (county,))

            if location and town in location["town"]:
                return "Location already exists"
            # reset cursor to execute another
            self.db.reset_cursor()
            self.db.execute("INSERT INTO locations (county, town) VALUES (%s, %s)", (county, town))
            if self.db.insert_success():
                self.db.commit()
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

    def search_locations(self, county, town):
        try:
            query = "SELECT id, town FROM locations WHERE county LIKE %s AND town LIKE %s"
            params = (f"%{county}%", f"%{town}%")
            return self.db.fetchandfilter(query, params)
        except Exception as e:
            return e
        finally:
            self.db.close()


class Venue:
    def __init__(self):
        self.db = Database()

    def create(self, name, building, town, county, status, longitude, latitude):

        try:

            status = "available" if status == "" or status is None else status

            res = Location().search_locations(county, town)
            # check if location exists
            if not res:
                # create location
                Location().create(county, town)
                res = Location().search_locations(county, town)

            # fetch location ID from search result
            location_id = res[0]["id"]
            self.db.execute(
                "INSERT INTO venues (name, building, location_id, status, longitude, latitude) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, building, location_id, status, longitude, latitude),
            )

            if self.db.insert_success():
                self.db.commit()
                return self.db.fetchone(
                    "SELECT * FROM venues WHERE id = %s", (self.db.cursor.lastrowid,)
                )
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def update(self, name, building, town, county, status, longitude, latitude, venue_id):

        try:

            # check if location exists
            res = Location().search_locations(county, town)

            location_id = None

            if not res:
                Location().create(county, town)
                res = Location().search_locations(county, town)
                location_id = res[0]["id"]
            else:
                location_id = res[0]["id"]
            self.db.execute(
                """UPDATE venues SET name=%s, building=%s, location_id=%s, status=%s, longitude=%s, latitude=%s WHERE id=%s""",
                (name, building, location_id, status, longitude, latitude, venue_id),
            )
            self.db.commit()

        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            venues = self.db.fetchmany("SELECT * FROM venues")
            for venue in venues:
                venue["location"] = Location().get_by_id(venue["location_id"])
            return venues
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            venue = self.db.fetchone("SELECT * FROM venues WHERE id = %s", (id,))
            venue["location"] = Location().get_by_id(venue["location_id"])
            return venue
        except Exception as e:
            return e


class Meeting:
    def __init__(self):
        self.db = Database()

    def create(
        self,
        venue_id,
        title,
        description,
        meeting_date,
        start_time,
        end_time,
        organizations,
        status=None,
    ):
        try:

            self.db.execute(
                "INSERT INTO meetings (venue_id, title, description, meeting_date, start_time, end_time, organizations, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (
                    venue_id,
                    title,
                    description,
                    meeting_date,
                    start_time,
                    end_time,
                    organizations,
                    status,
                ),
            )

            if self.db.insert_success():

                meeting_id = self.db.cursor.lastrowid
                self.add_organizations(meeting_id, organizations)
                self.db.commit()

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
                meeting["organizations"] = self.get_organizations_by_meeting(meeting["id"])
                meeting["venue"] = Venue().get_by_id(meeting["venue_id"])
                meeting["meeting_date"] = str(meeting["meeting_date"])

            return meetings
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_by_id(self, id):
        try:
            self.db.execute("SELECT * FROM meetings WHERE id = %s", (id,))
            meeting = self.db.cursor.fetchone()
            if meeting:
                meeting["start_time"] = str(meeting["start_time"])
                meeting["end_time"] = str(meeting["end_time"])
                meeting["organizations"] = self.get_organizations_by_meeting(meeting["id"])
                meeting["venue"] = Venue().get_by_id(meeting["venue_id"])
                meeting["meeting_date"] = str(meeting["meeting_date"])
                return meeting
        except Exception as e:
            return e

    def update(
        self,
        venue_id,
        title,
        description,
        meeting_date,
        start_time,
        end_time,
        organizations,
        status,
        meeting_id,
    ):
        try:
            self.db.execute(
                """
                UPDATE meetings SET venue_id=%s, title = %s, description = %s, meeting_date = %s, start_time = %s, end_time =%s, organizations = %s, status = %s WHERE id = %s""",
                (
                    venue_id,
                    title,
                    description,
                    meeting_date,
                    start_time,
                    end_time,
                    organizations,
                    status,
                    meeting_id,
                ),
            )
            self.db.commit()

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
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def add_organizations(self, meeting_id, organizations):
        organizations = json.loads(organizations)
        if not isinstance(organizations, list):
            raise ValueError("organizations must be a list of organization IDs")

        for id in organizations:
            self.db.execute(
                "INSERT INTO meetings_organizations(meeting_id, organization_id) VALUES (%s, %s)",
                (meeting_id, id),
            )

    def get_organizations_by_meeting(self, meeting_id):
        try:
            ids = self.db.fetchandfilter(
                "SELECT * FROM meetings_organizations WHERE meeting_id = %s", (meeting_id,)
            )
            organizations = []
            for organization in ids:
                self.db.execute(
                    "SELECT * FROM organizations WHERE id = %s", (organization["organization_id"],)
                )
                organizations.append(self.db.cursor.fetchone())
            return organizations

        except Exception as e:
            return e

    def is_date_valid(self, meeting_date):
        current_date = datetime.now().date()
        try:
            meeting_date = datetime.strptime(meeting_date, "%Y-%m-%d").date()
        except ValueError:
            return False
        if meeting_date < current_date:
            return False
        return True

    def is_time_valid(self, start_time, end_time):
        try:
            start_time = datetime.strptime(start_time, "%H:%M:%S").time()
            end_time = datetime.strptime(end_time, "%H:%M:%S").time()
        except ValueError:
            return False
        if start_time >= end_time:
            return False
        return True


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


class Attendee:
    def __init__(self):
        self.db = Database()

    def create(
        self, meeting_id, first_name, last_name, organization, designation, email, phone, signature, salutation
    ):
        try:
            statement = "INSERT INTO attendees (meeting_id, first_name, last_name, organization, designation, email, phone, signature, salutation) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
            data = (
                meeting_id,
                first_name,
                last_name,
                organization,
                designation,
                email,
                phone,
                signature,
                salutation,
            )
            self.db.execute(statement, data)
            # check if organization exists
            if not self.db.fetchone("SELECT * FROM organizations WHERE name = %s", (organization,)):
                self._create_organization(organization)
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def _create_organization(self, organization_name):
        try:
            self.db.execute(
                "INSERT INTO organizations (name, description, abbreviation) VALUES (%s, %s, %s)",
                (organization_name, "Organization", "")
            )
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
        
    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM attendees")
        except Exception:
            pass
        finally:
            self.db.close()

    def get_by_meeting_id(self, id):
        try:
            attendees = self.db.fetchandfilter("SELECT * FROM attendees WHERE meeting_id = %s", (id,))
            for attendee in attendees:
                attendee["signature"] = os.getenv("APP_URL") + attendee["signature"]
            return attendees       
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
                User().assign_role(email, "user")
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
        """Assign a role to a user or update if it already exists."""
        try:
            role = self.db.fetchone("SELECT id FROM roles WHERE name = %s", (role_name,))
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))

            if user and role:
                # Check if the user has any role assigned
                user_role = self.db.fetchone(
                    "SELECT role_id FROM users_roles WHERE user_id = %s", (user["id"],)
                )
                if user_role:
                    self.db.execute(
                        "UPDATE users_roles SET role_id = %s WHERE user_id = %s",
                        (role["id"], user["id"]),
                    )
                    self.db.commit()
                else:
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
            fetch = self.db.fetchmany(
                "SELECT users.id, users.first_name, users.last_name, users.organization, users.designation, users.email, users.phone, roles.id as role, users.created_on, users.updated_on FROM users INNER JOIN users_roles ON users.id=users_roles.user_id INNER JOIN roles ON users_roles.role_id=roles.id"
            )
            roles = self.db.fetchmany("SELECT id, name, description FROM roles")
            if fetch and roles:
                users = []
                for user in fetch:
                    for role in roles:
                        if user["role"] == role["id"]:
                            user.update({"role": role})
                    users.append(user)
                return users
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_role(self, email):
        try:
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if user:
                role = self.db.fetchone(
                    "SELECT role_id FROM users_roles WHERE user_id = %s", (user["id"],)
                )
                if role:
                    return self.db.fetchone(
                        "SELECT name FROM roles WHERE id = %s", (role["role_id"],)
                    )
        except Exception as e:
            return e

    def has_role(self, email, role_name):
        try:
            role = self.db.fetchone("SELECT id FROM roles WHERE name = %s", (role_name,))
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if user and role:
                user_roles = self.db.fetchone(
                    "SELECT * FROM users_roles WHERE user_id = %s AND role_id = %s",
                    (user["id"], role["id"]),
                )
                if user_roles:
                    return True
        except Exception as e:
            return e

    def add_permission(self, email, permission):
        try:
            perm = self.db.fetchone("SELECT * FROM permissions WHERE name = %s", (permission,))
            user = self.db.fetchone("SELECT * FROM users WHERE email = %s", (email,))
            if perm and user:
                # check if permission exists
                data = self.db.execute(
                    "SELECT * FROM users_permissions WHERE user_id=%s AND permission_id=%s",
                    (user["id"], perm["id"]),
                )
                if data:
                    return False
                else:
                    self.db.execute(
                        "INSERT INTO users_permissions (user_id, permission_id) VALUES (%s, %s)",
                        (user["id"], perm["id"]),
                    )
                    if self.db.insert_success():
                        self.db.commit()
                        return True

        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def has_permission(self, email, permission_name):
        try:
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            permission = self.db.fetchone(
                "SELECT id FROM permissions WHERE name = %s", (permission_name,)
            )
            if user and permission:
                role = self.db.fetchone(
                    "SELECT role_id FROM users_roles WHERE user_id = %s", (user["id"],)
                )
                if role:
                    role_permissions = self.db.fetchone(
                        "SELECT * FROM roles_permissions WHERE role_id = %s AND permission_id = %s",
                        (role["role_id"], permission["id"]),
                    )
                    delegated_permission = self.db.fetchone(
                        "SELECT id FROM users_permissions WHERE permission_id = %s",
                        permission["id"],
                    )
                    if role_permissions or delegated_permission:
                        return True
        except Exception as e:
            return e
        finally:
            self.db.close()

    def get_permissions(self, email):
        try:
            user = self.db.fetchone("SELECT id FROM users WHERE email = %s", (email,))
            if user:
                results = self.db.fetchmany(
                    "select permissions.name FROM permissions INNER JOIN roles_permissions ON permissions.id=roles_permissions.permission_id INNER JOIN users_roles ON roles_permissions.role_id=users_roles.role_id INNER JOIN users ON users_roles.user_id=users.id WHERE users.id=%s",
                    (user["id"],),
                )
                delegated = self.db.fetchmany(
                    "select permissions.name FROM permissions INNER JOIN users_permissions ON permissions.id=users_permissions.permission_id INNER JOIN users ON users_permissions.user_id=users.id WHERE users.id=%s",
                    (user["id"],),
                )
                delegated_permissions = json_to_list(delegated, ["name"])
                native_permissions = json_to_list(results, ["name"])
                if delegated_permissions:
                    return native_permissions + delegated_permissions
                else:
                    return native_permissions
        except Exception as e:
            return e

    def remove_permission(self, email, permission):
        try:
            perm = self.db.fetchone("SELECT * FROM permissions WHERE name = %s", (permission,))
            user = self.db.fetchone("SELECT * FROM users WHERE email = %s", (email,))
            if perm and user:
                self.db.execute(
                    "DELETE FROM users_permissions WHERE permission_id=%s AND user_id=%s",
                    (perm["id"], user["id"]),
                )
                if self.db.insert_success():
                    self.db.commit()
                    return True
                else:
                    return False

        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

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

        try:
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
                if parse_date(meeting_date) < current_date:
                    meetings_status["complete"] += 1
                    Meeting().update_status(meeting["id"], "complete")
                elif parse_date(meeting_date) == current_date:
                    if start_date_time <= current_date_time <= end_date_time:
                        meetings_status["ongoing"] += 1
                        Meeting().update_status(meeting["id"], "ongoing")
                    elif current_date_time < start_date_time:
                        meetings_status["pending"] += 1
                        Meeting().update_status(meeting["id"], "pending")
                    elif current_date_time > end_date_time:
                        meetings_status["complete"] += 1
                        Meeting().update_status(meeting["id"], "complete")
                else:
                    meetings_status["pending"] += 1
                    Meeting().update_status(meeting["id"], "pending")
            return meetings_status
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
        except Exception as e:
            self.db.rollback()
            return e
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

    def add_permission(self, role, permissions):
        try:
            role = self.db.fetchone("SELECT * FROM roles WHERE name = %s", (role,))
            if role:
                for p in permissions:
                    permission = self.db.fetchone("SELECT * FROM permissions WHERE name = %s", (p,))
                    if permission:
                        # check if permission exists for role
                        data = self.db.execute(
                            "SELECT * FROM roles_permissions WHERE role_id=%s AND permission_id=%s",
                            (role["id"], permission["id"]),
                        )
                        if data:
                            return False
                        self.db.execute(
                            "INSERT INTO roles_permissions (role_id, permission_id) VALUES (%s, %s)",
                            (role["id"], permission["id"]),
                        )
                if self.db.insert_success():
                    self.db.commit()
                    return True

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

    def get_permissions(self, role):
        try:
            role = self.db.fetchone("SELECT * FROM roles WHERE name = %s", (role,))
            results = self.db.fetchmany(
                "SELECT permissions.name FROM permissions INNER JOIN roles_permissions ON permissions.id=roles_permissions.permission_id WHERE role_id = %s",
                (role["id"],),
            )
            return json_to_list(results, ["name"])
        except Exception as e:
            return e
        finally:
            self.db.close()

    def find_by_name(self, name):
        try:
            return self.db.fetchone("SELECT * FROM roles WHERE name = %s", (name,))
        except Exception as e:
            return e


class Permission:
    def __init__(self):
        self.db = Database()

    def create(self, name):
        try:
            self.db.execute("INSERT INTO permissions (name) VALUES (%s)", (name,))
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()

    def get_all(self):
        try:
            return self.db.fetchmany("SELECT * FROM permissions")
        except Exception as e:
            return e
        finally:
            self.db.close()

    def assign_permission_to_role(self, role, permission):
        try:
            role = self.db.fetchone("SELECT * FROM roles WHERE name = %s", (role,))
            permission = self.db.fetchone(
                "SELECT * FROM permissions WHERE name = %s", (permission,)
            )
            self.db.execute(
                "INSERT INTO roles_permissions (role_id, permission_id) VALUES (%s, %s)",
                (role["id"], permission["id"]),
            )
            if self.db.insert_success():
                self.db.commit()
        except Exception as e:
            self.db.rollback()
            return e
        finally:
            self.db.close()
