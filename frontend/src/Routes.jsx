import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Meeting from "./pages/Meeting";
import NotFound from "./pages/NotFound";
import Master from "./pages/Master";
import Users from "./pages/Users";
import AppSetting from "./pages/AppSetting";
import Landing from "./pages/Landing";
import QrPage from "./pages/QrPage";
import Attendees from "./pages/Attendees";
import Main from "./pages/Main";
import Department from "./pages/Department";
import EditMeeting from "./pages/EditMeeting";
import EditVenue from "./pages/EditVenue";
import { Suspense } from "react";
import Venue from "./pages/Venue";
import Organizations from "./pages/Organizations";
import Register from "./pages/auth/Register";

function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
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
    path: "/meeting/:id",
    exact: true,
    element: <Landing />,
  },
  {
    path: "/attendance/:id",
    exact: true,
    element: <QrPage />,
  },

  {
    path: "/",
    exact: true,
    element: (
      <Master>
        <Dashboard />
      </Master>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<Loading />}>
        <Dashboard />
      </Suspense>
    ),
    children: [
      {
        path: "/dashboard",
        element: <Main />,
      },
      {
        path: "/dashboard/meetings",
        element: (
          <Suspense fallback={<Loading />}>
            <Meeting />,
          </Suspense>
        ),
      },
      {
        path: "/dashboard/meeting/:id",
        exact: true,
        element: <EditMeeting />,
      },
      {
        path: "/dashboard/attendees/:id",
        exact: true,
        element: <Attendees />,
      },
      {
        path: "/dashboard/users",
        element: <Users />,
      },
      {
        path: "/dashboard/venues",
        element: <Venue />,
      },
      {
        path: "/dashboard/venue/:id",
        element: <EditVenue />,
      },
      {
        path: "/dashboard/departments",
        element: <Department />,
      },
      {
        path: "/dashboard/organizations",
        element: <Organizations />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
