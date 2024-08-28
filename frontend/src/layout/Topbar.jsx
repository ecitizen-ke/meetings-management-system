import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Typography, Toolbar } from "@mui/material";
const Topbar = () => {
  return (
    <Toolbar>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        // onClick={handleDrawerToggle}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div">
        BMS
      </Typography>
    </Toolbar>
  );
};

export default Topbar;
