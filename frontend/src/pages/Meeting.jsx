import {
  Add,
  ChatRounded,
  Delete,
  Edit,
  PieChart,
  QrCode,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Snackbar from "@mui/material/Snackbar";
import { Config } from "../Config";
import { useDispatch } from "react-redux";
import { setMeetingDetail, setQrLink } from "../redux/features/qr/Qr";
import { useNavigate } from "react-router";
import moment from "moment";

let count = 0;

const Meeting = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [meetings, setMeetings] = useState([]);
  const [openToast, setOpenToast] = useState(false);
  const [boardrooms, setBoardrooms] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const fetchBoardrooms = () => {
    fetch(`${Config.API_URL}/boardrooms`)
      .then((resp) => {
        return resp.json();
      })
      .then((resp) => {
        setBoardrooms(resp);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchMeetings = () => {
    fetch(`${Config.API_URL}/meetings`)
      .then((resp) => {
        return resp.json();
      })
      .then((resp) => {
        setMeetings(resp);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchBoardrooms();
    fetchMeetings();
  }, []);

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
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Generate QR Code
  const generateQrCode = (data) => {
    console.log(data);
    fetch(`${Config.API_URL}/admin/generate_qr/${data.row.id}`)
      .then((resp) => {
        return resp.blob();
      })
      .then((resp) => {
        // Create a URL for the Blob
        const imageUrl = URL.createObjectURL(resp);
        // window.open(imageUrl, "_blank").focus();
        dispatch(
          setQrLink({
            qrlink: imageUrl,
          })
        );

        dispatch(
          setMeetingDetail({
            meeting: data.row,
          })
        );
        navigate("/attendance");

        // alert(`Generated QR code for Meeting ID: ${data.row.id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // create a meeting
  const onSubmit = async (data) => {
    console.log(data);
    data["id"] = meetings.length + 1;
    // setMeetings([...meetings, data]);

    fetch(Config.API_URL + `/create-meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // The type of data you're sending
      },
      body: JSON.stringify(data), // The data you want to send
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json(); // Parse the JSON from the response
      })
      .then((res) => {
        setOpen(false);
        reset();
        setOpenToast(true);
        fetchMeetings();
      })
      .catch((error) => {
        console.error("Error:", error); // Handle any errors
      });
  };

  // delete a meeting
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete")) {
      fetch(`${Config.API_URL}/delete-meeting/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", // The type of data you're sending
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json(); // Parse the JSON from the response
        })
        .then((res) => {
          setOpenToast(true);
          fetchMeetings();
        })
        .catch((error) => {
          console.error("Error:", error); // Handle any errors
        });
    }
  };
  // snackbar close
  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenToast(false);
  };

  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "title", headerName: "Title", width: 220 },
    { field: "boardroom_name", headerName: "Boardroom", width: 220 },
    { field: "description", headerName: "Description", width: 220 },
    {
      field: "meeting_date",
      headerName: "Meeting Date",
      width: 130,
      renderCell: (params) => (
        <div>{moment(params.row.meeting_date).format("MMMM D, YYYY")}</div>
      ),
    },
    {
      field: "start_time",
      headerName: "Start Time",
      width: 130,
    },
    {
      field: "end_time",
      headerName: "End Time",
      width: 130,
    },
    {
      field: "actions",
      headerName: "",
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginRight: 8 }}
              onClick={() => handleEdit(params.row)}
            >
              Edit
            </Button>

            <Button
              style={{ marginRight: 8 }}
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(params.row)}
            >
              Delete
            </Button>

            <Button
              onClick={() => generateQrCode(params)}
              variant="contained"
              color="warning"
              style={{ marginRight: 8 }}
              size="small"
            >
              Generate QR
            </Button>
            <Button
              onClick={() => navigate("/dashboard/attendees/" + params.row.id)}
              variant="contained"
              color="info"
              size="small"
            >
              View
            </Button>
          </div>
        </>
      ),
    },
  ];
  return (
    <>
      <div className="meetings-header">
        <div>
          <h3>Meetings</h3>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {" "}
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
      </div>

      <div style={{ width: "100%", marginTop: "35px" }}>
        <DataGrid
          rows={meetings}
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
                Close
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
                <Grid item md={4} xs={12}>
                  <TextField
                    type="date"
                    label="Meeting Date"
                    variant="outlined"
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
                >
                  {boardrooms.map((boardroom) => (
                    <MenuItem key={boardroom.id} value={boardroom.id}>
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
                  {isSubmitting ? "Please wait ..." : "Save"}
                </Button>

                <br />
              </Box>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* edit meeting modal */}

      {/* Toastr */}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message="Meeting was saved successfully"
      />
    </>
  );
};

export default Meeting;
