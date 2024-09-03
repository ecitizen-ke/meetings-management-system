import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendeesList = () => {
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    const fetchAttendees = async () => {
      
      const response = await axios.get('http://localhost:5000/attendees');
      console.log(response.data)
      setAttendees(response.data);
    };

    fetchAttendees();
  }, []);

  return (
    <div>
      <h1>Attendees List</h1>
      <ul>
        {attendees.map((attendee) => (
          <li key={attendee.id}>
            {attendee.first_name} {attendee.last_name} - {attendee.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendeesList;
