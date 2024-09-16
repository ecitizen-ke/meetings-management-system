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
import Boardroom from "./pages/Boardroom";
import Department from "./pages/Department";
import EditMeeting from "./pages/EditMeeting";

export const AppRouter = createBrowserRouter([
  // landing page for the form
  {
    path: "/meeting/:id",
    exact: true,
    element: <Landing />,
  },
  {
    path: "/attendance",
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
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        path: "/dashboard",
        element: <Main />,
      },
      {
        path: "/dashboard/meetings",
        element: <Meeting />,
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
        path: "/dashboard/boardrooms",
        element: <Boardroom />,
      },
      {
        path: "/dashboard/departments",
        element: <Department />,
      },
    ],
  },
  {
    path: "*",
    component: <NotFound />,
  },
]);
