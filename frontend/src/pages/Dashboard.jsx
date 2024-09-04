import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";

import Topbar from "../layout/Topbar";
import Sidebar from "../layout/Sidebar";
import { Toolbar } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import { useSelector } from "react-redux";
const drawerWidth = 240;

function Dashboard(props) {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  React.useEffect(() => {
    const isLoggedIn = auth.isLoggedIn;
    if (!isLoggedIn) {
      // Redirect to dashboard or home page
      navigate("/login");
    }
  });
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {/* Topbar */}
        <Topbar />
      </AppBar>

      {/* sidebar */}

      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Dashboard;
