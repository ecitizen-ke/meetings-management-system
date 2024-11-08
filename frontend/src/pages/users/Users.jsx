import { Add, ArrowForward, Edit } from '@mui/icons-material';
import {
  Badge,
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
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Config } from '../../Config';
import axios from 'axios';
import { getData, postData } from '../../utils/api';
import { useDispatch } from 'react-redux';
import {
  hideNotification,
  showNotification,
} from '../../redux/features/notifications/notificationSlice';
import Notification from '../../components/Notification';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/helpers';
import { handleApiError } from '../../utils/errorHandler';

const Users = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [openToast, setOpenToast] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // fetch users
  const fetchUsers = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/auth/users`,
        customHeaders
      );
      console.log(data);
      setUsers(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const handleEdit = () => {};
  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#398e3d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'first_name', headerName: 'First Name', width: 150 },
    { field: 'last_name', headerName: 'Last Name', width: 220 },
    { field: 'phone', headerName: 'Phone Number', width: 220 },
    { field: 'email', headerName: 'Email Address', width: 220 },
    { field: 'designation', headerName: 'Designation', width: 220 },
    {
      field: 'role',
      headerName: 'Role',
      width: 220,
      renderCell: (params) => {
        return params.row.role?.name;
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <div>
            <Button
              variant='contained'
              color='primary'
              size='small'
              style={{ marginRight: 8 }}
              onClick={() => handleEdit(params.row)}
            >
              Edit
            </Button>

            <Button
              style={{ marginRight: 8 }}
              variant='contained'
              color='secondary'
              size='small'
              onClick={() => handleDelete(params.row)}
            >
              Delete
            </Button>
          </div>
        </>
      ),
    },
  ];
  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };
  return (
    <>
      <div className='meetings-header'>
        <div>
          <h3>
            Users &nbsp;
            <Badge
              max={10}
              badgeContent={users.length}
              color='secondary'
            ></Badge>
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Button
              onClick={() => navigate('/dashboard/create-users')}
              variant='contained'
              endIcon={<Add />}
              color='secondary'
            >
              Add New User
            </Button>
          </div>
        </div>
      </div>
      <br />
      <Notification />
      <br />
      <div style={{ width: '100%', marginTop: '35px' }}>
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

      {/* Add user form */}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message='User was saved successfully'
      />
    </>
  );
};

export default Users;
