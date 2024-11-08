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
import { getData, patchData, putData } from '../../utils/api';
import { Config } from '../../Config';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { Edit } from '@mui/icons-material';
import Notification from '../../components/Notification';
import {
  hideNotification,
  showNotification,
} from '../../redux/features/notifications/notificationSlice';
import { getToken } from '../../utils/helpers';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import axios from 'axios';
import VenueComponent from '../../components/VenueComponent';

const customHeaders = {
  Authorization: 'Bearer ' + getToken(),
  'Content-Type': 'application/json',
};
let location_id = null;
const center = { lat: 37.7749, lng: -122.4194 };
const EditVenue = () => {
  const [venue, setVenue] = useState();
  const dispatch = useDispatch();
  const params = useParams();
  const token = useTokenRefresh(getToken());

  const [counties, setCounties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [countyData, setCountyData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [position, setPosition] = useState(center);
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchCounties = async () => {
    try {
      const response = await getData(
        `${Config.API_URL}/locations`,
        customHeaders
      );
      const data = response.data;
      console.log(data);
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
      console.log(groupedCounties);
      setCounties(Object.keys(groupedCounties));
      // filter data to return name of the county based on id param
      if (params.id) {
        const venue = response.data.find((v) => v.id === parseInt(params.id));
        setVenue(venue);
        location_id = venue.id;
        setIsDisabled(false);
      }
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
  const handleCountySelect = (e) => {
    let selectedCounty = e.target.value;
    setCounty(selectedCounty);
    // filter the countyData , then retreive county id of the first county
    const countyDataFiltered = countyData.filter(
      (cnty) => cnty.county.toLowerCase() === selectedCounty.toLowerCase()
    );

    location_id = countyDataFiltered[0].id;
    console.log(location_id);
    setIsDisabled(false);
  };
  const handleInputChange = (e) => {
    setTimeout(async () => {
      const value = e.target.value;
      setTown(value);

      // Filter towns based on user input, case-insensitive
      if (value && county) {
        const results = await getData(
          `${Config.API_URL}/location-towns?county=${county}&&search=${value}`,
          customHeaders
        );
        console.log(results);
        setSuggestions(results.data);
      } else {
        setSuggestions([]); // Clear suggestions when input is empty
      }
    }, 3000);
  };

  const handleSuggestionClick = (suggestion) => {
    setTown(suggestion); // Set the input to the selected suggestion
    setSuggestions([]); // Clear suggestions
  };

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
    console.log(suggestion);
    const { lat, lng } = suggestion.geometry;
    setPosition({ lat, lng, location: suggestion.formatted });
    setLocSuggestions([]);
    setSearch(suggestion.formatted);
  };

  useEffect(() => {
    fetchVenue(params.id);
    fetchCounties();
  }, []);

  const fetchVenue = async (id) => {
    // Fetch Venue data from API
    try {
      const result = await getData(
        `${Config.API_URL}/venues/${id}`,
        customHeaders
      );
      console.log(result);
      setVenue(result.data);

      setSearch(result.data.name);
      // setCounty(result.data.county);
    } catch (error) {
      dispatch(
        showNotification({
          message: error.message,
          type: 'error', // success, error, warning, info
        })
      );
      setTimeout(() => dispatch(hideNotification(), 3000));
    }
  };

  //   Update Venue
  const handleUpdate = async (data) => {
    data['status'] = 'available';
    console.log(data);

    try {
      const response = await patchData(
        `${Config.API_URL}/venues/${params.id}`,
        data,
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
          <Typography variant='h4'>Edit - {venue?.building}</Typography>
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
          {venue && <VenueComponent venue={venue} />}
        </Grid>
        <Grid item md={3} xs={12}></Grid>
      </Grid>
    </>
  );
};

export default EditVenue;
