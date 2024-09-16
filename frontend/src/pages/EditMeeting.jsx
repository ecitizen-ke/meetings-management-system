import { Button, Divider, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getData } from "../utils/api";
import { Config } from "../Config";
import { useParams } from "react-router";

const EditMeeting = () => {
  const params = useParams();
  const [meeting, setMeeting] = useState(null);
  useEffect(() => {
    fetchMeeting();
  }, []);
  const fetchMeeting = async () => {
    const customHeaders = {
      Authorization: "Bearer xxxxxx",
      "Content-Type": "application/json",
    };
    try {
      const result = await getData(
        `${Config.API_URL}/meeting/${params.id}`,
        customHeaders
      );
      console.log(result);
      setMeeting(result);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.response.data.msg,
          type: "error", // success, error, warning, info
        })
      );
      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
  return (
    <>
      <div className="page-header">
        <div>
          <Typography variant="h4">
            Edit - {meeting && meeting.title}
          </Typography>
        </div>
        <div>
          <Button onClick={() => window.history.back()} variant="text">
            Back
          </Button>
        </div>
      </div>
      <br />
      <Divider color="" />
    </>
  );
};

export default EditMeeting;
