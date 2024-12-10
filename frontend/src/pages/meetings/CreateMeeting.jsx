import {
  Add,
  ArrowRight,
  ChatRounded,
  ChevronLeft,
  Close,
  Delete,
  Edit,
  PieChart,
  QrCode,
} from '@mui/icons-material';
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Snackbar from '@mui/material/Snackbar';
import { Config } from '../../Config';
import { useDispatch, useSelector } from 'react-redux';
import { setMeetingDetail, setQrLink } from '../../redux/features/qr/Qr';
import { useNavigate } from 'react-router';
import moment from 'moment';
import { deleteData, getData, postData } from '../../utils/api';
import Swal from 'sweetalert2';
import Notification from '../../components/Notification';
import { handleApiError } from '../../utils/errorHandler';
import { getToken, showMessage } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import axios from 'axios';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import {
  hideNotification,
  showNotification,
} from '../../redux/features/notifications/notificationSlice';
import VenueComponent from '../../components/VenueComponent';
import {
  resetVenueOther,
  toggleVenueOther,
} from '../../redux/features/venue/venueSlice';
let count = 0;
let townInputVal = null;
let venue_id = null;
let new_venue = null;
const CreateMeeting = () => {
  const [open, setOpen] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [organizations, setOrganizations] = useState([
    {
      label: 'Other (Specify)',
      value: 'Other',
    },
  ]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useTokenRefresh(getToken());
  const [venues, setVenues] = useState([
    {
      label: 'Other (Specify)',
      value: 'Other',
    },
  ]);
  const [venueOther, setVenueOther] = useState(false);
  const [noTownOption, setNoTownOption] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const createdVenue = useSelector((state) => state.venue);
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchVenues();
    fetchOrganizations();
    dispatch(resetVenueOther());
    if (token) {
    }
  }, [token]);
  // fetch Existing Venues
  const fetchVenues = async () => {
    try {
      const { data } = await getData(`${Config.API_URL}/venues`, customHeaders);
      let venueArray = [];
      data.forEach((venue) => {
        let venueObj = {
          label: '',
          value: '',
        };
        venueObj.label = venue.building + ',   ' + venue.name;
        venueObj.value = venue.id;
        venueArray.push(venueObj);
      });
      setVenues([...venueArray, ...venues]);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

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

  // create a meeting
  const onSubmit = async (data) => {
    data['start_time'] = moment(data.start_time, 'HH:mm:ss').format('HH:mm:ss');
    data['end_time'] = moment(data.end_time, 'HH:mm:ss').format('HH:mm:ss');
    data['organizations'] = selectedOrgs;
    data['venue_id'] = venue_id ? venue_id : createdVenue.venue.id;

    if (noTownOption) {
      data['no_town'] = true;
      data['town'] = townInputVal;
    } else {
      data['no_town'] = false;
    }
    console.log(data);
    try {
      const result = await postData(
        `${Config.API_URL}/meetings`,
        data,
        customHeaders
      );
      setOpen(false);
      reset();
      setOpenToast(true);
      showMessage(result.message, 'success', dispatch);
      navigate('/dashboard/meetings');
    } catch (error) {
      setOpen(false);
      handleApiError(error, dispatch);
    }
  };

  // snackbar close
  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };

  // close venue panel
  const handleClosePanel = () => {
    dispatch(resetVenueOther());
  };

  return (
    <div>
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
            startIcon={<ChevronLeft />}
            onClick={() => window.history.back()}
            variant='contained'
            color='secondary'
          >
            Back
          </Button>
        </div>
      </Box>
      <Divider />
      <br />
      <br />
      <div className='row'>
        <div className='col-lg-2'></div>
        <div className='col-lg-8'>
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
                label='Meeting Title'
                variant='outlined'
                {...register('title', {
                  required: 'This field is required',
                })}
                error={errors.title && true}
              />
              {errors.title && (
                <span
                  style={{
                    color: 'crimson',
                  }}
                >
                  {errors.title.message}
                </span>
              )}
              <br />
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
              <Grid container spacing={2}>
                <Grid item md={4} xs={12}>
                  <TextField
                    type='date'
                    label='Meeting Date'
                    variant='outlined'
                    fullWidth={true}
                    focused
                    {...register('meeting_date', {
                      required: 'This is a required field',
                    })}
                    error={errors.meeting_date && true}
                  />
                  {errors.meeting_date && (
                    <span
                      style={{
                        color: 'crimson',
                      }}
                    >
                      {errors.meeting_date.message}
                    </span>
                  )}
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    type='time'
                    label='Start Time'
                    variant='outlined'
                    fullWidth={true}
                    focused
                    {...register('start_time', {
                      required: 'This field is required',
                    })}
                    error={errors.start_time && true}
                  />
                  {errors.start_time && (
                    <span
                      style={{
                        color: 'crimson',
                      }}
                    >
                      {errors.start_time.message}
                    </span>
                  )}
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    type='time'
                    label='End Time'
                    variant='outlined'
                    fullWidth={true}
                    focused
                    {...register('end_time', {
                      required: 'This field is required',
                    })}
                    error={errors.end_time && true}
                  />
                  {errors.end_time && (
                    <span
                      style={{
                        color: 'crimson',
                      }}
                    >
                      {errors.end_time.message}
                    </span>
                  )}
                </Grid>
              </Grid>
              <br />
              <br />
              Organizations
              <Select
                isMulti={true}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                options={organizations}
                onChange={(selectedOptions) => {
                  const selectedIds = selectedOptions
                    ? selectedOptions.map((option) => option.id)
                    : [];
                  console.log('Selected IDs:', selectedIds);
                  setSelectedOrgs(selectedIds);
                }}
                onInputChange={(inputValue, { action }) => {
                  if (action === 'input-change') {
                    handleOrgInputChange(inputValue);
                  }
                }}
              />
              <br />
              <br />
              <div className='row mb-3'>
                <div className='col-lg-12'>
                  <label htmlFor=''>Venue</label>
                  <Select
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    options={venues}
                    onChange={(selectedOptions) => {
                      if (selectedOptions.value === 'Other') {
                        dispatch(toggleVenueOther());
                      } else {
                        venue_id = selectedOptions.value;
                        dispatch(resetVenueOther());
                      }
                    }}
                  />
                </div>
              </div>
              <Box
                flexDirection={`row`}
                display={`flex`}
                flexGrow={1}
                justifyContent={`space-between`}
                alignItems={`center`}
              >
                {!createdVenue.venueOther && (
                  <Button
                    disabled={isSubmitting || venueOther}
                    fullWidth={true}
                    variant='contained'
                    color='primary'
                    type='submit'
                  >
                    {isSubmitting ? 'Please wait ...' : 'Save Meeting'}
                  </Button>
                )}
              </Box>
            </Box>
            <br />
          </form>
          {createdVenue.venueOther && (
            <>
              <div className='row'>
                <div className='col-lg-1'></div>
                <div
                  style={{
                    border: '1px solid #11b449',
                    margin: '5px 0 30px 0',
                    borderRadius: '10px',
                  }}
                  className='col-lg-12 shadow-sm'
                >
                  <br />
                  <br />
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      {' '}
                      <h5>Create New Venue</h5>
                    </div>
                    <div>
                      <IconButton
                        title='Close panel'
                        onClick={() => handleClosePanel()}
                        aria-label='Close Panel'
                        size='medium'
                      >
                        <Close fontSize='inherit' />
                      </IconButton>
                    </div>
                  </div>
                  <Divider />
                  <br />
                  <VenueComponent isNewVenue={createdVenue.venueOther} />
                </div>
                <div className='col-lg-1'></div>
              </div>
            </>
          )}
        </div>
        <div className='col-lg-2'></div>
      </div>

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message='Meeting was saved successfully'
      />
    </div>
  );
};

export default CreateMeeting;
