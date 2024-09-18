import { Alert, AlertTitle } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const Notification = () => {
  const dispatch = useDispatch();

  const { message, type, isVisible } = useSelector(
    (state) => state.notification
  );
  if (!isVisible) return null;
  return (
    <>
      <Alert severity={type}>
        <AlertTitle>{type}</AlertTitle>
        {message}
      </Alert>
    </>
  );
};

export default Notification;
