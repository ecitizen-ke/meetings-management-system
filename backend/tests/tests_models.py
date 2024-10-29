import unittest
from flask import json
from unittest.mock import MagicMock, patch
from app.v1.models import Boardroom, Resource, Meeting, Attendee, Role, Permission, User, Location


class TestBoardroom(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        boardroom = Boardroom()
        result = boardroom.create("Boardroom 1", 10, "Location", "Description")

        db_instance.execute.assert_called_once_with(
            "INSERT INTO boardrooms (name, capacity, location, description) VALUES (%s, %s, %s, %s)",
            ("Boardroom 1", 10, "Location", "Description")
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        boardroom = Boardroom()
        result = boardroom.create("Boardroom 1", 10, "Location", "Description")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)


class TestResource(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        resource = Resource()
        result = resource.create("Resource 1", "Description", 5)

        db_instance.execute.assert_called_once_with(
            "INSERT INTO resources (name, description, quantity) VALUES (%s, %s, %s)",
            ("Resource 1", "Description", 5)
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        resource = Resource()
        result = resource.create("Resource 1", "Description", 5)

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)


# class TestMeeting(unittest.TestCase):
#     @patch('app.v1.models.Database')
#     def test_create_success(self, MockDatabase):
#         db_instance = MockDatabase.return_value
#         db_instance.insert_success.return_value = True

#         meeting = Meeting()
#         result = meeting.create(
#             "Meeting 1", "Description", "2023-10-10", "10:00", "11:00", 1, 1, "Location", "0.0", "0.0", "County", "Town"
#         )

#         db_instance.execute.assert_called_once_with(
#             "INSERT INTO meetings (title, description, meeting_date, start_time, end_time, boardroom_id, organization_id, location, longitude, latitude, county, town) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
#             ('Meeting 1', 'Description', '2023-10-10', '10:00', '11:00', 1, 1, 'Location', '0.0', '0.0', 'County', 'Town')
#         )
#         db_instance.commit.assert_called_once()
#         self.assertIsNone(result)

#     @patch('app.v1.models.Database')
#     def test_create_failure(self, MockDatabase):
#         db_instance = MockDatabase.return_value
#         db_instance.execute.side_effect = Exception("DB Error")

#         meeting = Meeting()
#         result = meeting.create(
#             "Meeting 1", "Description", "2023-10-10", "10:00", "11:00", 1, 1, "Location", "0.0", "0.0", "County", "Town"
#         )

#         db_instance.rollback.assert_called_once()
#         expected_response = ({"msg": "An error occurred: DB Error"}, 500)
        
#         self.assertEqual(result, expected_response)


class TestAttendee(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        attendee = Attendee()
        result = attendee.create("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", 1)

        db_instance.execute.assert_called_once_with(
            "INSERT INTO attendees (first_name, last_name, organization, designation, email, phone,meeting_id)VALUES (%s, %s, %s, %s, %s, %s, %s)",
            ("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", 1)
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        attendee = Attendee()
        result = attendee.create("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", 1)

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)


class TestRole(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        role = Role()
        result = role.create("Role 1", "Description")

        db_instance.execute.assert_called_once_with(
            "INSERT INTO roles (name, description)VALUES (%s, %s)",
            ('Role 1', 'Description')
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        role = Role()
        result = role.create("Role 1", "Description")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)
        

class TestPermission(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        permission = Permission()
        result = permission.create("Permission 1")

        db_instance.execute.assert_called_once_with(
            "INSERT INTO permissions (name) VALUES (%s)",
            ("Permission 1",)
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        permission = Permission()
        result = permission.create("Permission 1")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)


class TestUser(unittest.TestCase):
    @patch('app.v1.models.User.generate_hash')
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase, mock_generate_hash):
        mock_generate_hash_value = '$pbkdf2-sha256$29000$IsQYQ2jtXas1BoDQ.r8XIg$fRe0dBwF6aH6DdQb.MdjK0eNDAKeBBpTjai1xWJcAPo'
        mock_generate_hash.return_value = mock_generate_hash_value

        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        user = User()
        result = user.create("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", "password")

        db_instance.execute.assert_called_once_with(
            "INSERT INTO users (first_name, last_name, organization, designation, email, phone, password) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            ("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", mock_generate_hash_value)
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        user = User()
        result = user.create("John", "Doe", "Org", "Designation", "email@example.com", "1234567890", "password")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)


class TestLocation(unittest.TestCase):
    @patch('app.v1.models.Database')
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.fetchone.return_value = None

        location = Location()
        result = location.create("County", "Town")

        db_instance.execute.assert_called_once_with(
            "INSERT INTO locations (county, town) VALUES (%s, %s)", ("County", "Town")
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch('app.v1.models.Database')
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        location = Location()
        result = location.create("County", "Town")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)

if __name__ == '__main__':
    unittest.main()