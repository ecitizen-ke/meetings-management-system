import React from "react";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Outlet, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import Swal from "sweetalert2";

import {
  Build,
  DashboardSharp,
  Grade,
  Grid3x3Sharp,
  Logout,
  MeetingRoom,
  Room,
  Settings,
  SupervisedUserCircle,
} from "@mui/icons-material";
import { Box, Container } from "@mui/material";
import Profile from "../components/Profile";
import { useDispatch } from "react-redux";
import { logout } from "../redux/features/auth/authSlice";
import Department from "../pages/Department";
const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const drawerWidth = 240;

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  // logout user
  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Are you sure youwant to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#398e3d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        // todo: logout user
        dispatch(logout());
        navigate("/login");
      }
    });
  };

  const navigateTo = (item) => {
    if (item.slug === "logout") {
      // Perform logout logic here

      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardSharp color="primary" />,
      path: "/dashboard",
      slug: "dashboard",
    },
    {
      text: "Meetings",
      icon: <MeetingRoom color="primary" />,
      path: "/dashboard/meetings",
      slug: "meetings",
    },
    {
      text: "Venues",
      icon: <Room color="primary" />,
      path: "/dashboard/venues",
      slug: "venues",
    },
    {
      text: "Departments",
      icon: <Grid3x3Sharp color="primary" />,
      path: "/dashboard/departments",
      slug: "departments",
    },
    {
      text: "Users",
      icon: <SupervisedUserCircle color="primary" />,
      path: "/dashboard/users",
      slug: "users",
    },
  ];

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <Profile />
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            style={{
              textDecoration: "none",
              color: "#3b3b3b",
            }}
            className={({ isActive }) =>
              isActive ? "active-link" : "inactive-link"
            }
            to={`${item.path}`}
          >
            <ListItem
              onClick={() => navigateTo(item)}
              key={index}
              disablePadding
            >
              <ListItemButton>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </NavLink>
        ))}
        <ListItem onClick={() => handleLogout()} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={`Logout`} />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Sidebar;
