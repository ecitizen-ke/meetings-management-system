import { Avatar, Container } from '@mui/material';
import React, { useEffect } from 'react';
import user from '../assets/user.png';

import { useSelector } from 'react-redux';

const Profile = () => {
  const user = useSelector((state) => state.auth);
  useEffect(() => {
    // console.log("user ", user);
  });
  return (
    <Container className='profile-box'>
      <div>
        <div className='profile-name'>{user.auth ? user.auth.name : ``}</div>
        <div className='profile-email'>
          <small>{user.auth ? user.auth.email : ``}</small>
        </div>
      </div>
    </Container>
  );
};

export default Profile;
