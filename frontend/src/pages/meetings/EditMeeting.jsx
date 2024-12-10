import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getData, patchData, postData, putData } from '../../utils/api';
import { Config } from '../../Config';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { Edit } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import Notification from '../../components/Notification';
import { handleApiError } from '../../utils/errorHandler';
import { getToken, showMessage } from '../../utils/helpers';
import moment from 'moment';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import {
  resetVenueOther,
  toggleVenueOther,
} from '../../redux/features/venue/venueSlice';
let count = 0;
let townInputVal = null;
let venue_id = null;
let new_venue = null;
const EditMeeting = () => {
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };
  const params = useParams();
  const [meeting, setMeeting] = useState(null);
  const dispatch = useDispatch();
  const createdVenue = useSelector((state) => state.venue);
  const navigate = useNavigate();
  const token = useTokenRefresh(getToken());
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [organizations, setOrganizations] = useState([
    {
      label: 'Other (Specify)',
      value: 'Other',
    },
  ]);
  const [venues, setVenues] = useState([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  useEffect(() => {
    fetchVenues();
    fetchOrganizations();
    fetchMeeting();
  }, []);

  const fetchMeeting = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/meetings/${params.id}`,
        customHeaders
      );
      if (data.venue_id) {
        setValue('venue_id', data.venue_id); // Initialize the select field
      }
      console.log(data);
      setMeeting(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
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
      setVenues([...venueArray]);
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
  const onSubmit = async (data) => {
    try {
      data['start_time'] = moment(data.start_time, 'HH:mm:ss').format(
        'HH:mm:ss'
      );
      data['end_time'] = moment(data.end_time, 'HH:mm:ss').format('HH:mm:ss');

      data['organizations'] =
        selectedOrgs.length > 0
          ? selectedOrgs
          : meeting.organizations.map((org) => org.id);

      const result = await patchData(
        `${Config.API_URL}/meetings/${params.id}`,
        data,
        customHeaders
      );
      console.log(result);
      return;
      showMessage(result.msg, 'success', dispatch);
      navigate('/dashboard/meetings');
    } catch (error) {
      console.log(error);
      handleApiError(error, dispatch);
    }
  };

  return (
    <>
      <div className='page-header'>
        <div>
          <Typography variant='h4'>
            Update Meeting {meeting && meeting.title}
          </Typography>
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
          {meeting && (
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
                  defaultValue={meeting.title}
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
                  defaultValue={meeting.description}
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
                      defaultValue={moment(meeting.meeting_date).format(
                        'YYYY-MM-DD'
                      )}
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
                      defaultValue={moment(
                        meeting.start_time,
                        'HH:mm:ss'
                      ).format('HH:mm')}
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
                      defaultValue={moment(meeting.end_time, 'HH:mm:ss').format(
                        'HH:mm'
                      )}
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
                  defaultValue={meeting.organizations}
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
                    <select
                      {...register('venue_id', {
                        required: 'This field is required',
                      })}
                      className='form-control rounded-0'
                      id=''
                      defaultValue={meeting.venue_id || ''} // Set the default selected value for the <select>
                    >
                      {venues.map((venue) => (
                        <option value={venue.value} key={venue.value}>
                          {venue.label}
                        </option>
                      ))}
                    </select>
                    {errors.venue_id && (
                      <span
                        style={{
                          color: 'crimson',
                        }}
                      >
                        {errors.venue_id.message}
                      </span>
                    )}
                  </div>
                </div>
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
                    variant='contained'
                    color='primary'
                    type='submit'
                  >
                    {isSubmitting ? 'Please wait ...' : 'Update Meeting'}
                  </Button>
                </Box>
              </Box>
              <br />
            </form>
          )}
        </Grid>
        <Grid item md={3} xs={12}></Grid>
      </Grid>
    </>
  );
};

export default EditMeeting;
