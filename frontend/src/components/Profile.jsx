import { Avatar, Container } from "@mui/material";
import React, { useEffect } from "react";
import user from "../assets/user.png";
import logo from "../assets/logo.svg";
import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((state) => state.auth);
  useEffect(() => {
    console.log("user ", user);
  });
  return (
    <Container className="profile-box">
      <div>
        {/* <Avatar alt="User Profile" src={user} sx={{ width: 56, height: 56 }} /> */}
        <img className="logo" src={logo} alt="Logo" />
      </div>
      <div>
        <div className="profile-name">John Doe</div>
        <div className="profile-email">
          <small>john.doe@gmail.com</small>
        </div>
      </div>
    </Container>
  );
};

export default Profile;
