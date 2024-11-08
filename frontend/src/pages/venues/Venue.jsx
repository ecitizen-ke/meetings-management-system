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
import { Config } from '../../Config';
import { DataGrid } from '@mui/x-data-grid';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import { deleteData, getData, postData } from '../../utils/api';
import {
  hideNotification,
  showNotification,
} from '../../redux/features/notifications/notificationSlice';
import Notification from '../../components/Notification';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../utils/helpers';
import { useTokenRefresh } from '../../hooks/useTokenRefresh';
import VenueComponent from '../../components/VenueComponent';
import { closeModal, openModal } from '../../redux/features/venue/venueSlice';
const Venue = () => {
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };
  const [open, setOpen] = useState(false);

  const [venues, setVenues] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useTokenRefresh(getToken());
  const [countyData, setCountyData] = useState([]);
  const venue = useSelector((state) => state.venue);
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
  const handleOpen = () => {
    dispatch(openModal());
  };
  const handleClose = () => {
    dispatch(closeModal());
  };
  useEffect(() => {
    fetchVenues();
  }, [token, venue]);

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

  const columns = [
    { field: 'id', headerName: '#', width: 70 },
    { field: 'name', headerName: 'Location', width: 300 },
    { field: 'building', headerName: 'Venue', width: 220 },
    { field: 'status', headerName: 'Status', width: 200 },
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
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const result = await deleteData(
            `${Config.API_URL}/venues/delete/${id}`,
            customHeaders
          );
          dispatch(
            showNotification({
              message: result.message,
              type: 'success', // success, error, warning, info
            })
          );
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
      }
    });
  };

  return (
    <>
      <div className='meetings-header'>
        <div>
          <h3>
            Venues &nbsp;
            <Badge
              max={10}
              badgeContent={venues?.length}
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
              Add New Venue
            </Button>
          </div>
        </div>
      </div>

      <Notification />

      {/* venues Table */}
      <div style={{ width: '100%', marginTop: '35px' }}>
        <DataGrid
          rows={venues}
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

      {/* Add boardroom modal */}

      <Modal
        open={venue.venueModal}
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
              <h2>New Venue</h2>
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
          <VenueComponent />
        </Box>
      </Modal>
    </>
  );
};

export default Venue;
