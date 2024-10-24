import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import Topbar from '../layout/Topbar';
import Sidebar from '../layout/Sidebar';
import { Toolbar } from '@mui/material';
import { Outlet, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../redux/features/auth/authSlice';
import { checkTokenExpiry, getToken } from '../utils/helpers';
const drawerWidth = 240;

function Dashboard(props) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  React.useEffect(() => {
    const authData = localStorage.getItem('user');
    if (!authData) {
      // Redirect to dashboard or home page
      navigate('/login');
    } else {
      const user = JSON.parse(authData);
      const authStatus = checkTokenExpiry(dispatch);

      if (!authStatus) {
        dispatch(
          login({
            auth: {
              email: user.auth.email,
              name: user.auth.name,
            },
            isLoggedIn: user.isLoggedIn,
            token: getToken(),
          })
        );
      } else {
        console.log(authStatus);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        dispatch(logout());
        // navigate('/login');
      }
    }
  }, []);
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
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
        component='main'
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
