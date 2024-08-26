import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MeetingForm from './components/MeetingForm';
import AttendeesList from './components/AttendeesList';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/meeting/:meetingId" component={MeetingForm} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/" component={AttendeesList} exact />
      </Switch>
    </Router>
  );
}

export default App;