import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Meeting from "./pages/Meeting";
import NotFound from "./pages/NotFound";
import Master from "./pages/Master";
import Users from "./pages/Users";
import AppSetting from "./pages/AppSetting";

export const AppRouter = createBrowserRouter([
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
        path: "/dashboard/meetings",
        element: <Meeting />,
      },
      {
        path: "/dashboard/users",
        element: <Users />,
      },
      {
        path: "/dashboard/settings",
        element: <AppSetting />,
      },
    ],
  },
  {
    path: "*",
    component: <NotFound />,
  },
]);
