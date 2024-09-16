import { Add, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Modal,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Config } from "../Config";
import { DataGrid } from "@mui/x-data-grid";
import Swal from "sweetalert2";

const Boardroom = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [boardrooms, setBoardrooms] = useState([]);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchBoardrooms = () => {
    fetch(`${Config.API_URL}/boardrooms`)
      .then((resp) => resp.json())
      .then((resp) => setBoardrooms(resp))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchBoardrooms();
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

  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "name", headerName: "Name", width: 220 },
    { field: "location", headerName: "Location", width: 220 },
    { field: "description", headerName: "Description", width: 400 },
    {
      field: "capacity",
      headerName: "Capacity",
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
          </div>
        </>
      ),
    },
  ];

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

  //   create boardroom
  const onSubmit = (data) => {
    fetch(`${Config.API_URL}/boardrooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((resp) => resp.json())
      .then((resp) => {
        reset();
        setOpen(false);
        console.log(resp);
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <div className="meetings-header">
        <div>
          <h3>Boardrooms</h3>
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
              Add New Boardroom
            </Button>
          </div>
        </div>
      </div>

      {/* Boardrooms Table */}
      <div style={{ width: "100%", marginTop: "35px" }}>
        <DataGrid
          rows={boardrooms}
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

      {/* Add boardroom modal */}

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
              <h2>New Boardroom</h2>
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
                label="Name"
                variant="outlined"
                {...register("name", {
                  required: "This field is required",
                })}
                error={errors.name && true}
              />
              {errors.name && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.name.message}
                </span>
              )}
            </Box>

            <br />
            <Box className="my-2">
              <TextField
                fullWidth={true}
                id="outlined-basic"
                label="Capacity"
                variant="outlined"
                {...register("capacity", {
                  required: "This field is required",
                })}
                error={errors.capacity && true}
              />
              {errors.capacity && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.capacity.message}
                </span>
              )}
            </Box>
            <br />
            <Box className="my-2">
              <TextField
                fullWidth={true}
                id="outlined-basic"
                label="Location"
                variant="outlined"
                {...register("location", {
                  required: "This field is required",
                })}
                error={errors.location && true}
              />
              {errors.location && (
                <span
                  style={{
                    color: "crimson",
                  }}
                >
                  {errors.location.message}
                </span>
              )}
            </Box>
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

      {/* edit boardroom modal */}
      {/* delete boardroom modal */}
    </>
  );
};

export default Boardroom;
