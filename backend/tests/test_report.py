import unittest
from unittest.mock import patch
from datetime import datetime, date, time
from app.v1.models import Report

# Mock combine_date_time function
def combine_date_time(date_string, time_string):
    if time_string is None:
        return None
    return datetime.combine(date_string, time_string)

class TestReport(unittest.TestCase):
    @patch('app.v1.models.combine_date_time', side_effect=combine_date_time)
    @patch('app.v1.models.Meeting')
    @patch('app.v1.models.datetime')
    def test_meetings_summary(self, mock_datetime, MockMeeting, mock_combine_date_time):
        # Mock current date and time
        mock_datetime.now.return_value = datetime(2023, 10, 10, 10, 0, 0)

        # Mock meeting data
        mock_meetings = [
            {"meeting_date": date(2023, 10, 9), "start_time": time(9, 0), "end_time": time(10, 0)},  # Complete
            {"meeting_date": date(2023, 10, 10), "start_time": time(9, 0), "end_time": time(11, 0)},  # Ongoing
            {"meeting_date": date(2023, 10, 10), "start_time": time(11, 0), "end_time": time(12, 0)},  # Pending
            {"meeting_date": date(2023, 10, 11), "start_time": time(9, 0), "end_time": time(10, 0)},  # Pending
        ]
        MockMeeting.return_value.get_all.return_value = mock_meetings

        # Create Report instance and call meetings_summary
        report = Report()
        result = report.meetings_summary()

        # Assert the expected results
        expected_result = {"pending": 2, "ongoing": 1, "complete": 1}
        self.assertEqual(result, expected_result)

if __name__ == '__main__':
    unittest.main()