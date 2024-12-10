import {
  Add,
  ArrowRight,
  ChatRounded,
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
import { useDispatch } from 'react-redux';
import { setMeetingDetail, setQrLink } from '../../redux/features/qr/Qr';
import { useNavigate } from 'react-router';
import moment from 'moment';
import { deleteData, getData, postData } from '../../utils/api';
import Swal from 'sweetalert2';
import Notification from '../../components/Notification';
import { handleApiError } from '../../utils/errorHandler';
import { getToken, showMessage } from '../../utils/helpers';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
const Meeting = () => {
  const [meetings, setMeetings] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useTokenRefresh(getToken());
  const [countyData, setCountyData] = useState([]);

  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    fetchMeetings();
    if (token) {
    }
  }, [token]);

  const fetchMeetings = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/meetings`,
        customHeaders
      );
      setMeetings(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  // Navigate to qr page
  const navigateToQrPage = (data) => {
    sessionStorage.setItem('meeting', JSON.stringify(data.row));

    dispatch(
      setMeetingDetail({
        meeting: data.row,
      })
    );
    navigate('/attendance/' + data.row.id);
  };

  // delete a meeting
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#398e3d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteData(`${Config.API_URL}/meetings/${id}`, customHeaders)
          .then((result) => {
            fetchMeetings();
            showMessage(result.message, 'success', dispatch);
          })
          .catch((error) => {
            console.log(error);
            handleApiError(error, dispatch);
          });
      }
    });
  };

  // navigate to edit page
  const handleEdit = (id) => {
    navigate(`/dashboard/meeting/${id}`);
  };

  const columns = [
    {
      field: 'id',
      headerName: '#',
      width: 70,
    },
    { field: 'title', headerName: 'Title', width: 220 },
    {
      field: 'location',
      headerName: 'Location',
      width: 220,
      renderCell: (params) => {
        return params.row.venue?.location.county;
      },
    },

    {
      field: 'venue',
      headerName: 'Venue',
      width: 220,
      renderCell: (params) => {
        return params.row.venue?.building;
      },
    },
    { field: 'description', headerName: 'Description', width: 220 },
    {
      field: 'meeting_date',
      headerName: 'Meeting Date',
      width: 220,
      renderCell: (params) => (
        <div>{moment(params.row.meeting_date).format('MMMM D, YYYY')}</div>
      ),
    },
    {
      field: 'start_time',
      headerName: 'Start Time',
      width: 130,
      renderCell: (params) => (
        <div>{moment(params.row.start_time, 'HH:mm:ss').format('HH:mm A')}</div>
      ),
    },
    {
      field: 'end_time',
      headerName: 'End Time',
      width: 130,
      renderCell: (params) => (
        <div>{moment(params.row.end_time, 'HH:mm:ss').format('HH:mm A')}</div>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 430,
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
              onClick={() => handleEdit(params.row.id)}
              disabled={moment(params.row.meeting_date).isBefore(
                moment(),
                'day'
              )}
            >
              Edit
            </Button>

            <Button
              style={{ marginRight: 8 }}
              variant='contained'
              color='secondary'
              size='small'
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </Button>

            <Button
              onClick={() => navigateToQrPage(params)}
              variant='contained'
              color='warning'
              style={{ marginRight: 8 }}
              size='small'
              disabled={moment(params.row.meeting_date).isBefore(
                moment(),
                'day'
              )}
            >
              Generate QR
            </Button>
            <Button
              onClick={() => navigate('/dashboard/attendees/' + params.row.id)}
              variant='contained'
              color='info'
              size='small'
            >
              View Attendees
            </Button>
          </div>
        </>
      ),
    },
  ];

  const filterCounty = (cty) => {
    const filteredCounty = countyData.filter((county) => county.county === cty);
    if (filterCounty.length > 0) {
      venue_id = filteredCounty[0].id; // retrieve id for the county
    } else {
      venue_id = null;
    }
    return filteredCounty;
  };

  return (
    <>
      <div className='meetings-header'>
        <div>
          <h3>
            Meetings &nbsp;{' '}
            <Badge
              max={10}
              badgeContent={meetings.length}
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
            {' '}
            <Button
              onClick={() => navigate('/dashboard/create-meeting')}
              variant='contained'
              endIcon={<Add />}
              color='secondary'
            >
              Add New Meeting
            </Button>
          </div>
        </div>
      </div>
      <br />
      <Notification />
      <br />
      <div style={{ width: '100%', marginTop: '35px' }}>
        {meetings.length > 0 ? (
          <DataGrid
            rows={meetings}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10]}
            localeText={{ noRowsLabel: 'No data available' }}
            // checkboxSelection
          />
        ) : (
          <Alert severity='info' color='warning'>
            No Meetings aaded yet
          </Alert>
        )}
      </div>
    </>
  );
};

export default Meeting;
