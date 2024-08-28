import { Add, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Grid,
  Input,
  InputAdornment,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const Meeting = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "45%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "title", headerName: "Title", width: 330 },
    { field: "date", headerName: "Meeting Date", width: 330 },
    {
      field: "time",
      headerName: "Time",
      width: 130,
    },
  ];

  const rows = [
    { id: 1, title: "Kickoff Meeting", date: "28-08-2024", time: "16:30hrs" },
  ];

  const onSubmit = async (data) => {
    console.log(data);

    const res = await new Promise((resolve, reject) => {
      // Simulate an asynchronous operation using setTimeout
      setTimeout(() => {
        const success = true; // You can change this to false to test rejection

        if (success) {
          resolve("Operation was successful!");
        } else {
          reject("Operation failed.");
        }
      }, 5000);
    });

    console.log(res);
  };

  return (
    <>
      <div className="meetings-header">
        <div>
          <h3>Meetings</h3>
        </div>

        <div>
          <Button
            onClick={handleOpen}
            variant="contained"
            endIcon={<Add />}
            color="secondary"
          >
            Add New Meeting
          </Button>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </div>

      {/* create new meeting */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            flexDirection={`row`}
            justifyContent={`space-between`}
            display={`flex`}
            alignItems={`center`}
          >
            <div>
              <h2>New Meeting</h2>
            </div>
            <div>
              <Button
                variant="contained"
                onClick={handleClose}
                color="secondary"
              >
                Cancel
              </Button>
            </div>
          </Box>
          <Divider />
          <br />
          <br />
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
                <Grid item md={6} xs={12}>
                  <TextField
                    type="date"
                    label="Meeting Date"
                    variant="outlined"
                    fullWidth={true}
                    focused
                    {...register("date", {
                      required: "This is a required field",
                    })}
                    error={errors.date && true}
                  />
                  {errors.date && (
                    <span
                      style={{
                        color: "crimson",
                      }}
                    >
                      {errors.date.message}
                    </span>
                  )}
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    type="time"
                    label="Meeting Time"
                    variant="outlined"
                    fullWidth={true}
                    focused
                    {...register("time", {
                      required: "This field is required",
                    })}
                    error={errors.time && true}
                  />
                  {errors.time && (
                    <span
                      style={{
                        color: "crimson",
                      }}
                    >
                      {errors.time.message}
                    </span>
                  )}
                </Grid>
              </Grid>
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
                  {isSubmitting ? "Please wait ..." : "Save"}
                </Button>

                <br />
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
};

export default Meeting;
