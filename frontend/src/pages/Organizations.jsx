import {
  Badge,
  Box,
  Button,
  Divider,
  InputAdornment,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Notification from '../components/Notification';
import { Add, Edit } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { getData, postData } from '../utils/api';
import { Config } from '../Config';
import { handleApiError } from '../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { getToken, showMessage } from '../utils/helpers';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
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
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/organizations`,
        customHeaders
      );
      setOrganizations(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
  //   edit department
  const handleEdit = (id, name) => {
    // Implement edit functionality
  };
  const handleDelete = (id) => {
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
  const onSubmit = async (data) => {
    try {
      const result = await postData(
        `${Config.API_URL}/organizations`,
        data,
        customHeaders
      );
      setOpen(false);
      reset();
      setOpenToast(true);
      fetchOrganizations();

      showMessage(result.message, 'success', dispatch);
    } catch (error) {
      console.log(error);
      handleApiError(error, dispatch);
    }
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };

  //   columns

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Name', width: 350 },
    { field: 'description', headerName: 'Description', width: 400 },
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

  return (
    <>
      <div className='meetings-header'>
        <div>
          <h3>
            Organizations &nbsp;
            <Badge
              max={10}
              badgeContent={organizations.length}
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
              onClick={handleOpen}
              variant='contained'
              endIcon={<Add />}
              color='secondary'
            >
              Add Organization
            </Button>
          </div>
        </div>
      </div>
      <br />
      <Divider color='' />
      <br />
      <Notification />
      <br />

      {/* List of organizations  */}

      <div style={{ width: '100%', marginTop: '35px' }}>
        <DataGrid
          rows={organizations}
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

      {/* Add Organization Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Box
            flexDirection={`row`}
            justifyContent={`space-between`}
            display={`flex`}
            alignItems={`center`}
          >
            <div>
              <h2>New Organization</h2>
            </div>
            <div>
              <Button
                variant='contained'
                onClick={handleClose}
                color='secondary'
              >
                Close
              </Button>
            </div>
          </Box>

          <Divider />
          <br />
          <br />
          <form onSubmit={handleSubmit(onSubmit)} action='' method='post'>
            <Box className='my-2'>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Edit />
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                id='outlined-basic'
                label='Name'
                variant='outlined'
                {...register('name', {
                  required: 'This field is required',
                })}
                error={errors.name && true}
              />
              {errors.name && (
                <span
                  style={{
                    color: 'crimson',
                  }}
                >
                  {errors.name.message}
                </span>
              )}
            </Box>

            <br />
            <br />

            <TextField
              multiline={true}
              minRows={5}
              label='Description'
              variant='outlined'
              fullWidth={true}
              {...register('description', {
                required: 'This field is required',
              })}
              error={errors.description && true}
            />
            {errors.description && (
              <span
                style={{
                  color: 'crimson',
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
              variant='contained'
              color='primary'
              type='submit'
            >
              {isSubmitting ? 'Please wait ...' : 'Save'}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* toast notification */}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message='Organization added successfully'
      />
    </>
  );
};

export default Organizations;
