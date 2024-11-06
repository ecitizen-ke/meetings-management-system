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
import { Config } from '../Config';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import { deleteData, getData, postData } from '../utils/api';
import {
  hideNotification,
  showNotification,
} from '../redux/features/notifications/notificationSlice';
import Notification from '../components/Notification';
import { useDispatch } from 'react-redux';
import { getToken } from '../utils/helpers';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import axios from 'axios';
import Select from 'react-select';
import {
  resetVenueOther,
  setCreatedVenue,
} from '../redux/features/venue/venueSlice';
let location_id = null;
let townInputVal = null;
let venue_id = null;
const center = { lat: 37.7749, lng: -122.4194 };
const VenueComponent = ({ isNewVenue }) => {
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useTokenRefresh(getToken());
  const [counties, setCounties] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [town, setTown] = useState('');
  const [county, setCounty] = useState('');
  const [countyData, setCountyData] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true);
  const [position, setPosition] = useState(center);
  const [locSuggestions, setLocSuggestions] = useState([]);
  const [search, setSearch] = useState('');
  const [noTownOption, setNoTownOption] = useState(false);
  const [towns, setTowns] = useState([
    {
      label: 'Other (Specify)',
      value: 'Other',
    },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchVenues = async () => {
    try {
      const response = await getData(`${Config.API_URL}/venues`, customHeaders);
      console.log(response.data);

      setVenues(response.data);
    } catch (error) {
      console.log(error);
      dispatch(
        showNotification({
          message: error.response.data.message,
          type: 'error', // success, error, warning, info
        })
      );
      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
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
    fetchVenues();
    fetchCounties();
  }, [token]);

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
    if (filterCounty.length > 0) {
      venue_id = filteredCounty[0].id; // retrieve id for the county
    } else {
      venue_id = null;
    }
    return filteredCounty;
  };

  const handleEdit = (data) => {
    navigate('/dashboard/venue/' + data.id);
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
        deleteBoardroom(id);
      }
    });
  };

  //   create venue
  const onSubmit = async (data) => {
    try {
      data['longitude'] = position.lat;
      data['latitude'] = position.lng;
      data['name'] = position.location;
      data['county'] = county;
      data['town'] = town;
      data['status'] = 'available'; //todo: advice on status
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
        <label htmlFor=''>Location</label>
        <input
          type='text'
          className='form-control w-100'
          placeholder='Type location...'
          value={search}
          onChange={handleSearchChange}
          style={{
            width: '300px',
            height: '40px',
            padding: '10px',
            marginBottom: '10px',
          }}
        />
        <div style={{ position: 'relative' }}>
          {locSuggestions.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '300px',
                listStyleType: 'none',
                padding: '0',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1000,
              }}
            >
              {locSuggestions.map((suggestion) => (
                <li
                  key={suggestion.geometry.lat + suggestion.geometry.lng}
                  onClick={() => handleLocSuggestionClick(suggestion)}
                  style={{ padding: '10px', cursor: 'pointer' }}
                >
                  {suggestion.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>

        <br />

        <Box className='my-2'>
          <TextField
            fullWidth={true}
            id='outlined-basic'
            label='Building'
            variant='outlined'
            {...register('building', {
              required: 'This field is required',
            })}
            error={errors.building && true}
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
                onChange={(value) => handleTownInput(value)}
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

export default VenueComponent;
