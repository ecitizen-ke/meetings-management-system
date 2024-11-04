import unittest
from flask import json
from unittest.mock import MagicMock, patch
from app.v1.models import Organization


class TestOrganization(unittest.TestCase):
    @patch("app.v1.models.Database")
    def test_create_success(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.insert_success.return_value = True

        org = Organization()
        # Test successful creation
        with self.subTest("Successful Creation"):
            result = org.create("Test Org", "Description")
            db_instance.execute.assert_called_once_with(
                "INSERT INTO organizations (name, description) VALUES (%s, %s)",
                ("Test Org", "Description"),
            )
            db_instance.commit.assert_called_once()
            self.assertIsNone(result)

        # Test missing name
        with self.subTest("Missing Name"):
            result = org.create(None, "A test organization without a name")  # Pass None
            self.assertIsInstance(
                result, Exception
            )  # Expect an exception as the result
            self.assertIn("Name cannot be None", str(result))

        # Test missing description
        with self.subTest("Missing Description"):
            db_instance.reset_mock()  # Clear previous call history
            result = org.create("Test Org", "")
            db_instance.execute.assert_called_once_with(
                "INSERT INTO organizations (name, description) VALUES (%s, %s)",
                ("Test Org", ""),
            )
            db_instance.commit.assert_called_once()
            self.assertIsNone(result)

        # Test missing both name and description
        with self.subTest("Missing Name and Description"):
            result = org.create("", "")
            self.assertIsInstance(result, Exception)
            self.assertIn("Name cannot be None", str(result))

    @patch("app.v1.models.Database")
    def test_create_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.execute.side_effect = Exception("DB Error")

        org = Organization()
        result = org.create("Test Org", "Description")

        db_instance.rollback.assert_called_once()
        self.assertIsInstance(result, Exception)

    @patch("app.v1.models.Database")
    def test_fetch_all(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.fetchmany.return_value = [
            {"name": "Org 1", "description": "Description 1"},
            {"name": "Org 2", "description": "Description 2"},
        ]

        org = Organization()
        result = org.get_all()  # call the get all function

        # chek f method was called
        db_instance.fetchmany.assert_called_once()

        self.assertIsInstance(result, list)  # Expecting a list, not an Exception
        self.assertEqual(
            len(result), 2
        )  # Check that it returns the expected number of entries test_fetch_all(self, MockDatabase):

    @patch("app.v1.models.Database")
    def test_fetch_all_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.fetchmany.side_effect = Exception("DB Error")

        org = Organization()
        result = org.get_all()

        db_instance.fetchmany.assert_called_once()
        self.assertIsInstance(result, Exception)

    # test for the filter by search function
    @patch("app.v1.models.Database")
    def test_filter_by_search(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.fetchmany.return_value = [
            {"id": 1, "name": "Org 1"},
            {"id": 2, "name": "Org 2"},
        ]

        org = Organization()
        result = org.filter_by_search("Org")

        db_instance.fetchmany.assert_called_once_with(
            "SELECT id, name FROM organizations WHERE name LIKE %s", ("%Org%",)
        )

        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 2)

    # test for the filter by search function
    @patch("app.v1.models.Database")
    def test_filter_by_search_failure(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.fetchmany.side_effect = Exception("DB Error")

        org = Organization()
        result = org.filter_by_search("Org")

        db_instance.fetchmany.assert_called_once()
        self.assertIsInstance(result, Exception)

    @patch("app.v1.models.Database")
    def test_update(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.update_success.return_value = True

        org = Organization()
        result = org.update_organization(1, "Test Org", "Description")

        db_instance.execute.assert_called_once_with(
            "UPDATE organizations SET name = %s, description = %s WHERE id = %s",
            ("Test Org", "Description", 1),
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)

    @patch("app.v1.models.Database")
    def test_delete(self, MockDatabase):
        db_instance = MockDatabase.return_value
        db_instance.delete_success.return_value = True

        org = Organization()
        result = org.delete_organization(1)

        db_instance.execute.assert_called_once_with(
            "DELETE FROM organizations WHERE id = %s", (1,)
        )
        db_instance.commit.assert_called_once()
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
