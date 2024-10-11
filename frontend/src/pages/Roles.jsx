import { Add, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Modal,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getData, postData } from '../utils/api';
import { Config } from '../Config';
import { handleApiError } from '../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
const customHeaders = {
  Authorization: 'Bearer xxxxxx',
  'Content-Type': 'application/json',
};

const Roles = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [roles, setRoles] = useState([]);
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

  const onSubmit = async (data) => {
    try {
      const result = await postData(
        `${Config.API_URL}/roles`,
        data,
        customHeaders
      );
      fetchRoles();
      reset();
      setOpen(false);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const fetchRoles = async () => {
    // Fetch roles data from API
    try {
      const { data } = await getData(`${Config.API_URL}/roles`, customHeaders);
      setRoles(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchRoles();
  }, []);

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Name', width: 220 },
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
            >
              Edit
            </Button>

            <Button
              style={{ marginRight: 8 }}
              variant='contained'
              color='secondary'
              size='small'
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
          <h3>Roles &nbsp; </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {' '}
            <Button
              onClick={handleOpen}
              variant='contained'
              endIcon={<Add />}
              color='secondary'
            >
              Add New Role
            </Button>
          </div>
        </div>
      </div>
      <br />
      <Divider />

      {/* Roles List */}
      <div style={{ width: '100%', marginTop: '35px' }}>
        <DataGrid
          rows={roles}
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

      {/* roles modal */}
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
              <h2>New Role</h2>
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
    </>
  );
};

export default Roles;
