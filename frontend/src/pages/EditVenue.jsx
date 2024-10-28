import {
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getData, putData } from '../utils/api';
import { Config } from '../Config';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { Edit } from '@mui/icons-material';
import Notification from '../components/Notification';
import {
  hideNotification,
  showNotification,
} from '../redux/features/notifications/notificationSlice';
import { getToken } from '../utils/helpers';

const customHeaders = {
  Authorization: 'Bearer ' + getToken(),
  'Content-Type': 'application/json',
};

const EditVenue = () => {
  const [boardroom, setBoardroom] = useState();
  const dispatch = useDispatch();
  const params = useParams();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchBoardroom(params.id);
  }, []);

  const fetchBoardroom = async (id) => {
    // Fetch boardroom data from API
    try {
      const result = await getData(
        `${Config.API_URL}/boardroom/${id}`,
        customHeaders
      );
      setBoardroom(result);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.response.data.msg,
          type: 'error', // success, error, warning, info
        })
      );
      setTimeout(() => dispatch(hideNotification(), 3000));
    }
  };

  //   Update boardroom
  const handleUpdate = async () => {
    try {
      const response = await putData(
        `${Config.API_URL}/update_boardroom/${params.id}`,
        customHeaders
      );
      dispatch(
        showNotification({
          message: response.msg,
          type: 'success', // success, error, warning, info
        })
      );

      setTimeout(() => dispatch(hideNotification()), 3000);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.response.data.msg,
          type: 'error', // success, error, warning, info
        })
      );
      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
  return (
    <>
      <div className='page-header'>
        <div>
          <Typography variant='h4'>Edit -</Typography>
        </div>

        <div>
          <Button onClick={() => window.history.back()} variant='text'>
            Back
          </Button>
        </div>
      </div>
      <br />
      <Divider color='' />
      <br />
      <Notification />
      <br />

      <Grid container spacing={2}>
        <Grid item md={3} xs={12}></Grid>
        <Grid item md={6} xs={12}>
          {boardroom && (
            <form onSubmit={handleSubmit(handleUpdate)} action='' method='post'>
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

              <Box className='my-2'>
                <TextField
                  fullWidth={true}
                  id='outlined-basic'
                  label='Capacity'
                  variant='outlined'
                  {...register('capacity', {
                    required: 'This field is required',
                  })}
                  error={errors.capacity && true}
                />
                {errors.capacity && (
                  <span
                    style={{
                      color: 'crimson',
                    }}
                  >
                    {errors.capacity.message}
                  </span>
                )}
              </Box>
              <br />
              <Box className='my-2'>
                <TextField
                  fullWidth={true}
                  id='outlined-basic'
                  label='Location'
                  variant='outlined'
                  {...register('location', {
                    required: 'This field is required',
                  })}
                  error={errors.location && true}
                />
                {errors.location && (
                  <span
                    style={{
                      color: 'crimson',
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
                label='Meeting Description'
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
          )}
        </Grid>
        <Grid item md={3} xs={12}></Grid>
      </Grid>
    </>
  );
};

export default EditVenue;
