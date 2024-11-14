import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import NotFound from './pages/NotFound';
import Master from './pages/Master';
import Users from './pages/users/Users';
import AppSetting from './pages/AppSetting';
import Landing from './pages/Landing';
import QrPage from './pages/QrPage';
import Attendees from './pages/attendees/Attendees';
import Main from './pages/Main';
import EditMeeting from './pages/meetings/EditMeeting';
import EditVenue from './pages/venues/EditVenue';
import { Suspense } from 'react';
import Venue from './pages/venues/Venue';
import Organizations from './pages/organizations/Organizations';
import Register from './pages/auth/Register';
import Roles from './pages/roles/Roles';
import Meeting from './pages/meetings/Meeting';
import CreateMeeting from './pages/meetings/CreateMeeting';
import CreateUsers from './pages/users/CreateUsers';
import Permissions from './pages/permissions/Permissions';
import CreatePermission from './pages/permissions/CreatePermission';
import AssignPermission from './pages/permissions/AssignPermission';
import ViewPermissions from './pages/permissions/ViewPermissions';
import AssignRole from './pages/users/AssignRole';
import AttendanceRegistrationForm from './pages/AttendanceRegistrationForm';

function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        zIndex: 9999999,
      }}
    >
      Loading...
    </div>
  );
}

export const AppRouter = createBrowserRouter([
  // landing page for the form
  {
    path: '/meetings/:id',
    exact: true,
    element: <AttendanceRegistrationForm />,
  },
  {
    path: '/attendance/:id',
    exact: true,
    element: <QrPage />,
  },

  {
    path: '/',
    exact: true,
    element: (
      <Master>
        <Dashboard />
      </Master>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Main />,
      },
      {
        path: '/dashboard/meetings',
        element: (
          <Suspense fallback={<Loading />}>
            <Meeting />,
          </Suspense>
        ),
      },
      {
        path: '/dashboard/create-meeting',
        exact: true,
        element: <CreateMeeting />,
      },
      {
        path: '/dashboard/meeting/:id',
        exact: true,
        element: <EditMeeting />,
      },
      {
        path: '/dashboard/attendees/:id',
        exact: true,
        element: <Attendees />,
      },
      {
        path: '/dashboard/users',
        element: <Users />,
      },
      {
        path: '/dashboard/create-users',
        element: <CreateUsers />,
      },
      {
        path: '/dashboard/assign-role',
        element: <AssignRole />,
      },
      {
        path: '/dashboard/venues',
        element: <Venue />,
      },
      {
        path: '/dashboard/venue/:id',
        element: <EditVenue />,
      },
      {
        path: '/dashboard/organizations',
        element: <Organizations />,
      },
      {
        path: '/dashboard/roles',
        element: <Roles />,
      },
      {
        path: '/dashboard/roles/assign-permission/:id/:role',
        element: <AssignPermission />,
      },
      {
        path: '/dashboard/permissions',
        element: <Permissions />,
      },
      {
        path: '/dashboard/create-permissions',
        element: <CreatePermission />,
      },
      {
        path: '/dashboard/create-permissions',
        element: <CreatePermission />,
      },
      {
        path: '/dashboard/roles/:name/permissions',
        element: <ViewPermissions />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
