import { Add, Edit } from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Divider,
  InputAdornment,
  Modal,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router';
import { deleteData, getData, postData } from '../../utils/api';
import {
  hideNotification,
  showNotification,
} from '../../redux/features/notifications/notificationSlice';
import Notification from '../../components/Notification';
import { useDispatch } from 'react-redux';
import { getToken } from '../../utils/helpers';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import axios from 'axios';
import Select from 'react-select';
import {
  closeModal,
  resetVenueOther,
  setCreatedVenue,
} from '../../redux/features/venue/venueSlice';
import { Config } from '../../Config';
const center = { lat: 37.7749, lng: -122.4194 };

const EditVenue = () => {
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };
  const dispatch = useDispatch();
  const token = useTokenRefresh(getToken());
  const [counties, setCounties] = useState([]);
  const [town, setTown] = useState('');
  const [county, setCounty] = useState('');
  const [countyData, setCountyData] = useState([]);
  const [position, setPosition] = useState(center);
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [search, setSearch] = useState('');
  const [venue, setVenue] = useState(null);
  const [noTownOption, setNoTownOption] = useState(false);
  const params = useParams();
  const [towns, setTowns] = useState([
    {
      label: 'Other (Specify)',
      value: 'Other',
    },
  ]);
  const fetchCounties = async () => {
    try {
      const response = await getData(
        `${Config.API_URL}/locations`,
        customHeaders
      );
      const data = response.data;
      setCountyData(data);
      const groupedCounties = data.reduce((acc, county) => {
        if (!acc[county.county]) {
          acc[county.county] = [];
        }
        // Push the current county to the array for this county name
        acc[county.county].push(county);
        return acc;
      }, {});
      console.log(response);
      const countyArray = Object.keys(groupedCounties);

      const countiesFormatted = [];
      countyArray.forEach((county) => {
        const countyObj = {
          label: '',
          value: '',
        };
        countyObj.label = county;
        countyObj.value = county;
        countiesFormatted.push(countyObj);
      });
      setCounties(countiesFormatted);
    } catch (error) {
      console.log(error);
      dispatch(
        showNotification({
          message: error.message,
          type: 'error', // success, error, warning, info
        })
      );

      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };

  const fetchVenue = async () => {
    try {
      const response = await getData(
        `${Config.API_URL}/venues/${params.id}`,
        customHeaders
      );
      const data = response.data;
      if (data) {
        reset({
          building: venue?.building || '',
          venue: venue?.name || '',
          county: venue?.location?.county || '',
          town: venue?.location?.town || '',
          latitude: venue?.latitude || '',
          longitude: venue?.longitude || '',
          status: venue?.status || '',
        });
      }
      console.log(data);
      setVenue(data);
    } catch (error) {
      console.log(error);
      dispatch(
        showNotification({
          message: error.message,
          type: 'error', // success, error, warning, info
        })
      );

      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchCounties();
    fetchVenue();
  }, [token]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.length < 3) {
      setLocSuggestions([]);
      return;
    }

    const response = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      {
        params: {
          q: query,
          key: 'c89593580d7f46d7af4e2b4d83e239ef',
          limit: 5,
          countrycode: 'KE',
        },
      }
    );

    setLocSuggestions(response.data.results);
  };

  const handleLocSuggestionClick = (suggestion) => {
    const { lat, lng } = suggestion.geometry;
    setPosition({ lat, lng, location: suggestion.formatted });
    setLocSuggestions([]);
    setSearch(suggestion.formatted);
  };

  // handle manual town input
  const handleTownInput = (e) => {
    const town = e.target.value.trim();
    if (town) {
      setTown(town);
    } else {
      setTown('');
    }
  };

  const filterCounty = (cty) => {
    const filteredCounty = countyData.filter((county) => county.county === cty);
    let venue_id = null; // Declare venue_id here
    if (filteredCounty.length > 0) {
      venue_id = filteredCounty[0].id; // Retrieve id for the county
    }
    return filteredCounty;
  };

  //   create venue
  const onSubmit = async (data) => {
    try {
      console.log(data);
      return;
      const result = await postData(
        `${Config.API_URL}/venues`,
        data,
        customHeaders
      );

      console.log(result);
      dispatch(
        showNotification({
          message: result.message,
          type: 'success', // success, error, warning, info
        })
      );
      dispatch(
        setCreatedVenue({
          venue: data,
        })
      );
      dispatch(closeModal());
      dispatch(resetVenueOther());
      console.log(result);
      setTimeout(() => dispatch(hideNotification()), 3000);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.response.data.message,
          type: 'error', // success, error, warning, info
        })
      );

      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} action='' method='post'>
        <label htmlFor=''>Venue</label>
        <input
          type='text'
          className='form-control w-100'
          placeholder='Type venue...'
          {...register('venue', {
            required: 'This field is required',
          })}
          error={errors.building && true}
          style={{
            width: '300px',
            height: '40px',
            padding: '10px',
            marginBottom: '10px',
          }}
        />

        <br />

        <Box className='my-2'>
          <TextField
            fullWidth
            id='outlined-basic'
            label='Building'
            variant='outlined'
            {...register('building', { required: 'This field is required' })}
            error={!!errors.building}
          />

          {errors.building && (
            <span
              style={{
                color: 'crimson',
              }}
            >
              {errors.building.message}
            </span>
          )}
        </Box>
        <br />

        <div className='row mb-3'>
          <div className='col-lg-6'>
            <label htmlFor=''>County</label>
            <Select
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              options={counties}
              onChange={async (countyObj) => {
                // reset already filtered towns
                setTowns([]);
                setNoTownOption(false);
                townInputVal = null;
                filterCounty(countyObj.value);
                setCounty(countyObj.value);
                // get towns
                const { data } = await getData(
                  `${Config.API_URL}/location-search?county=${countyObj.value}`,
                  customHeaders
                );

                setTowns([...data, ...towns]);
              }}
            />
          </div>
          <div style={{ position: 'relative' }} className='col-lg-6'>
            <label htmlFor=''>Town</label>
            <Select
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              options={towns}
              onChange={(selectedOptions) => {
                console.log(selectedOptions);
                if (selectedOptions.value === 'Other') {
                  setNoTownOption(true);
                } else {
                  setNoTownOption(false);
                }
              }}
            />
          </div>
          <div className='col-lg-12 my-3'>
            {noTownOption && (
              <input
                className='form-control mt-2 rounded-0'
                type='text'
                onChange={handleTownInput}
                placeholder='Please specify town name'
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                }}
              />
            )}
          </div>
        </div>

        <br />
        <Button
          disabled={isSubmitting}
          variant='contained'
          fullWidth={true}
          color='primary'
          type='submit'
        >
          {isSubmitting ? 'Please wait ...' : 'Save Venue'}
        </Button>
        <br />
        <br />
      </form>
    </>
  );
};

export default EditVenue;
