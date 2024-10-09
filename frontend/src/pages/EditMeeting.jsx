import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { getData, postData, putData } from "../utils/api";
import { Config } from "../Config";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { Edit } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import moment from "moment";
import {
  hideNotification,
  showNotification,
} from "../redux/features/notifications/notificationSlice";
import Notification from "../components/Notification";
import { handleApiError } from "../utils/errorHandler";
import { showMessage } from "../utils/helpers";

const EditMeeting = () => {
  const params = useParams();
  const [meeting, setMeeting] = useState(null);
  const [boardrooms, setBoardrooms] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  useEffect(() => {
    fetchMeeting();
    fetchBoardrooms();
  }, []);

  const fetchMeeting = async () => {
    const customHeaders = {
      Authorization: "Bearer xxxxxx",
      "Content-Type": "application/json",
    };
    try {
      const result = await getData(
        `${Config.API_URL}/meetings/${params.id}`,
        customHeaders
      );
      setMeeting(result);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
  const fetchBoardrooms = async () => {
    try {
      const customHeaders = {
        Authorization: "Bearer xxxxxx",
        "Content-Type": "application/json",
      };

      const result = await getData(
        `${Config.API_URL}/boardrooms`,
        customHeaders
      );
      setBoardrooms(result);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const onSubmit = async (data) => {
    const customHeaders = {
      Authorization: "Bearer xxxxxx",
      "Content-Type": "application/json",
    };
    try {
      const result = await putData(
        `${Config.API_URL}/meeting/${params.id}`,
        data,
        customHeaders
      );
      showMessage(result.msg, "success", dispatch);
      navigate("/dashboard/meetings");
    } catch (error) {
      handleApiError(error, dispatch);
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
      <br />

      <Notification />
      <br />

      <Grid container spacing={2}>
        <Grid item md={3} xs={12}></Grid>
        <Grid item md={6} xs={12}>
          {meeting && (
            <form onSubmit={handleSubmit(onSubmit)} action="" method="post">
              <Box className="my-2">
                <TextField
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Edit />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth={true}
                  id="outlined-basic"
                  label="Meeting Title"
                  defaultValue={meeting.title}
                  variant="outlined"
                  {...register("title", {
                    required: "This field is required",
                  })}
                  error={errors.title && true}
                />
                {errors.title && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.title.message}
                  </span>
                )}
                <br />
                <br />
                <br />
                <TextField
                  multiline={true}
                  minRows={5}
                  label="Meeting Description"
                  variant="outlined"
                  defaultValue={meeting && meeting.description}
                  focused={true}
                  fullWidth={true}
                  {...register("description", {
                    required: "This field is required",
                  })}
                  error={errors.description && true}
                />
                {errors.description && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.description.message}
                  </span>
                )}
                <br />
                <br />
                <br />

                <Grid container spacing={2}>
                  <Grid item md={4} xs={12}>
                    <TextField
                      type="date"
                      label="Meeting Date"
                      variant="outlined"
                      defaultValue={moment(
                        meeting && meeting.meeting_date
                      ).format("YYYY-MM-DD")}
                      fullWidth={true}
                      focused
                      {...register("meeting_date", {
                        required: "This is a required field",
                      })}
                      error={errors.meeting_date && true}
                    />
                    {errors.meeting_date && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.meeting_date.message}
                      </span>
                    )}
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <TextField
                      type="time"
                      label="Start Time"
                      variant="outlined"
                      fullWidth={true}
                      defaultValue={meeting && meeting.start_time}
                      focused
                      {...register("start_time", {
                        required: "This field is required",
                      })}
                      error={errors.start_time && true}
                    />
                    {errors.start_time && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.start_time.message}
                      </span>
                    )}
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <TextField
                      type="time"
                      label="End Time"
                      variant="outlined"
                      fullWidth={true}
                      defaultValue={meeting && meeting.end_time}
                      focused
                      {...register("end_time", {
                        required: "This field is required",
                      })}
                      error={errors.end_time && true}
                    />
                    {errors.end_time && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.end_time.message}
                      </span>
                    )}
                  </Grid>
                </Grid>
                <br />
                <br />
                <br />

                <FormControl fullWidth>
                  <InputLabel id="bordroom-select-label">Boardroom</InputLabel>
                  <Select
                    labelId="bordroom-select-label"
                    id="bordroom-select-label"
                    // value={age}
                    label="Boardroom"
                    {...register("boardroom_id", {
                      required: "This field is required",
                    })}
                    defaultValue={meeting.boardroom_id}
                  >
                    {boardrooms.map((boardroom) => (
                      <MenuItem
                        selected={boardroom.id === 2}
                        key={boardroom.id}
                        value={boardroom.id}
                      >
                        {boardroom.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <br />
                <br />
                <br />

                <Box
                  flexDirection={`row`}
                  display={`flex`}
                  flexGrow={1}
                  justifyContent={`space-between`}
                  alignItems={`center`}
                >
                  <Button
                    disabled={isSubmitting}
                    fullWidth={true}
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    {isSubmitting ? "Updating ..." : "Update"}
                  </Button>

                  <br />
                </Box>
              </Box>
            </form>
          )}
        </Grid>
        <Grid item md={3} xs={12}></Grid>
      </Grid>
    </>
  );
};

export default EditMeeting;
