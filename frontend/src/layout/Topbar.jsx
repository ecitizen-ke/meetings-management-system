import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import {
  IconButton,
  Typography,
  Avatar,
  Box,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import avatar from '../assets/user.png';
import {
  Logout,
  SupervisedUserCircle,
  VerifiedUser,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const user = useSelector((state) => state.auth);
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#398e3d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Logout',
    }).then((result) => {
      if (result.isConfirmed) {
        // todo: logout user
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        dispatch(logout());
        navigate('/login');
      }
    });
  };

  return (
    <Toolbar>
      <IconButton
        color='inherit'
        aria-label='open drawer'
        edge='start'
        sx={{ mr: 2 }}
        // onClick={handleDrawerToggle}
      >
        <MenuIcon />
      </IconButton>
      <Typography variant='h6' noWrap component='div'>
        Meetings Management System
      </Typography>
      <Box sx={{ ml: 'auto' }}>
        Hi, {user.auth ? user.auth.name : ``}
        <IconButton onClick={handleMenuOpen}>
          <Avatar alt='Profile Picture' src={avatar} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SupervisedUserCircle fontSize='small' />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize='small' />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Toolbar>
  );
};

export default Topbar;
