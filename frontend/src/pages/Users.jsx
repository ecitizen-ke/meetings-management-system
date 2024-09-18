import { Add, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Config } from "../Config";
import axios from "axios";
import { postData } from "../utils/api";
import { useDispatch } from "react-redux";
import {
  hideNotification,
  showNotification,
} from "../redux/features/notifications/notificationSlice";
import Notification from "../components/Notification";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";
const Users = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openToast, setOpenToast] = useState(false);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

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

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  // fetch departments
  const fetchDepartments = () => {
    fetch(`${Config.API_URL}/departments`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDepartments(data);
      })
      .catch((error) => console.log(error));
  };

  // fetch users
  const fetchUsers = () => {
    fetch(`${Config.API_URL}/users`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setUsers(data);
      })
      .catch((error) => console.log(error));
  };

  // create users
  const onSubmit = async (data) => {
    data["password"] = "12345678";

    const customHeaders = {
      Authorization: "Bearer xxxxxx",
      "Content-Type": "application/json",
    };

    try {
      const result = await postData(
        `${Config.API_URL}/register`,
        data,
        customHeaders
      );
      console.log(result);
      dispatch(
        showNotification({
          message: result.msg,
          type: "success", // success, error, warning, info
        })
      );
      handleClose();
      setTimeout(() => dispatch(hideNotification()), 3000);
      // reset form
      reset();
      fetchUsers();
    } catch (error) {
      console.error("Error submitting data: ", error.response.data.msg);
      dispatch(
        showNotification({
          message: error.response.data.msg,
          type: "error", // success, error, warning, info
        })
      );
      handleClose();
      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
  // snackbar close
  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenToast(false);
  };

  const handleEdit = () => {};
  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#398e3d",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };

  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "first_name", headerName: "First Name", width: 220 },
    { field: "last_name", headerName: "Last Name", width: 220 },
    { field: "phone_number", headerName: "Phone Number", width: 220 },

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
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="meetings-header">
        <div>
          <h3>Users</h3>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Button
              onClick={handleOpen}
              variant="contained"
              endIcon={<Add />}
              color="secondary"
            >
              Add New User
            </Button>
          </div>
        </div>
      </div>
      <br />
      <Notification />
      <br />
      <div style={{ width: "100%", marginTop: "35px" }}>
        <DataGrid
          rows={users}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
          // checkboxSelection
        />
      </div>

      {/* Add user modal */}

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
              <h2>New User</h2>
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
            <Grid container spacing={2}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth={true}
                  id="outlined-basic"
                  label="First Name"
                  variant="outlined"
                  {...register("first_name", {
                    required: "This field is required",
                  })}
                  error={errors.first_name && true}
                />
                {errors.first_name && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.first_name.message}
                  </span>
                )}
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth={true}
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                  {...register("last_name", {
                    required: "This field is required",
                  })}
                  error={errors.last_name && true}
                />
                {errors.last_name && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.last_name.message}
                  </span>
                )}
              </Grid>
            </Grid>
            <br />
            <br />
            <Box>
              <TextField
                fullWidth={true}
                id="outlined-basic"
                label="Email"
                type="email"
                variant="outlined"
                {...register("email", {
                  required: "This field is required",
                })}
                error={errors.email && true}
              />
              {errors.email && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.email.message}
                </span>
              )}
            </Box>
            <br />
            <br />
            <Box>
              <TextField
                fullWidth={true}
                id="outlined-basic"
                label="Phone Number"
                type="tel"
                variant="outlined"
                {...register("phone_number", {
                  required: "This field is required",
                })}
                error={errors.phone_number && true}
              />
              {errors.phone_number && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.phone_number.message}
                </span>
              )}
            </Box>
            <br />
            <br />
            <Box>
              <TextField
                fullWidth={true}
                id="outlined-basic"
                label="Designation"
                type="text"
                variant="outlined"
                {...register("designation", {
                  required: "This field is required",
                })}
                error={errors.designation && true}
              />
              {errors.designation && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.designation.message}
                </span>
              )}
            </Box>
            <br />
            <br />
            <Box>
              <FormControl fullWidth>
                <InputLabel id="bordroom-select-label">Department</InputLabel>
                <Select
                  labelId="bordroom-select-label"
                  id="bordroom-select-label"
                  label="Department"
                  {...register("department_id", {
                    required: "This field is required",
                  })}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.department_id && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.department_id.message}
                </span>
              )}
            </Box>
            <br />
            <br />

            <Button
              disabled={isSubmitting}
              fullWidth={true}
              variant="contained"
              color="primary"
              type="submit"
            >
              {isSubmitting ? "Please wait ..." : "Save"}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Add user form */}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message="User was saved successfully"
      />
    </>
  );
};

export default Users;
