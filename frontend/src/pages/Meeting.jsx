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
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Snackbar from '@mui/material/Snackbar';
import { Config } from '../Config';
import { useDispatch } from 'react-redux';
import { setMeetingDetail, setQrLink } from '../redux/features/qr/Qr';
import { useNavigate } from 'react-router';
import moment from 'moment';
import { deleteData, getData, postData } from '../utils/api';
import Swal from 'sweetalert2';
import Notification from '../components/Notification';
import { handleApiError } from '../utils/errorHandler';
import { showMessage } from '../utils/helpers';
import { Link } from 'react-router-dom';

let count = 0;

const Meeting = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [meetings, setMeetings] = useState([]);
  const [openToast, setOpenToast] = useState(false);
  const [boardrooms, setBoardrooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const customHeaders = {
    Authorization: 'Bearer xxxxxx',
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
    fetchBoardrooms();
    fetchMeetings();
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

  const fetchBoardrooms = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/boardrooms`,
        customHeaders
      );
      setBoardrooms(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

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

  // create a meeting
  const onSubmit = async (data) => {
    data['department_id'] = 1; //todo:
    data['start_time'] = moment(data.start_time, 'HH:mm:ss').format('HH:mm:ss');
    data['end_time'] = moment(data.end_time, 'HH:mm:ss').format('HH:mm:ss');
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
      fetchMeetings();
      showMessage(result.message, 'success', dispatch);
    } catch (error) {
      setOpen(false);
      handleApiError(error, dispatch);
    }
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
            setOpenToast(true);
            fetchMeetings();
            showMessage(result.message, 'success', dispatch);
          })
          .catch((error) => {
            handleApiError(error, dispatch);
          });
      }
    });
  };

  // navigate to edit page
  const handleEdit = (id) => {
    navigate(`/dashboard/meeting/${id}`);
  };
  // snackbar close
  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };

  const columns = [
    {
      field: 'id',
      headerName: '#',
      width: 70,
    },
    { field: 'title', headerName: 'Title', width: 220 },
    { field: 'location', headerName: 'Location', width: 220 },
    { field: 'boardroom_name', headerName: 'Venue', width: 220 },
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
              onClick={handleOpen}
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
        <DataGrid
          rows={meetings}
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

      {/* create new meeting */}
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
              <h2>New Meeting</h2>
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
              <FormControl fullWidth>
                <InputLabel id='organization-select-label'>
                  Organization
                </InputLabel>
                <Select
                  labelId='organization-select-label'
                  id='organization-select-label'
                  // value={age}
                  label='Boardroom'
                  {...register('organization_id', {
                    required: 'This field is required',
                  })}
                  error={errors.organization_id && true}
                >
                  {organizations.map((organization) => (
                    <MenuItem key={organization.id} value={organization.id}>
                      {organization.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <br />
              <Link className='text-muted' to={`/dashboard/organizations`}>
                <small>
                  Create Organizations here <ArrowRight />
                </small>
              </Link>
              <br />
              <br />
              <TextField
                type='text'
                label='Location'
                variant='outlined'
                fullWidth={true}
                focused
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
              <br />
              <br />
              <FormControl fullWidth>
                <InputLabel id='bordroom-select-label'>Venue</InputLabel>
                <Select
                  labelId='bordroom-select-label'
                  id='bordroom-select-label'
                  // value={age}
                  label='Boardroom'
                  {...register('boardroom_id', {
                    required: 'This field is required',
                  })}
                  error={errors.boardroom_id && true}
                >
                  {boardrooms.map((boardroom) => (
                    <MenuItem key={boardroom.id} value={boardroom.id}>
                      {boardroom.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.boardroom_id && (
                <span
                  style={{
                    color: 'crimson',
                  }}
                >
                  {errors.boardroom_id.message}
                </span>
              )}
              <br />
              <Link className='text-muted' to={`/dashboard/venues`}>
                <small>Create Venues Here&nbsp;</small>
                <ArrowRight />
              </Link>
              <br />
              <br />
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
                  {isSubmitting ? 'Please wait ...' : 'Save'}
                </Button>
              </Box>
            </Box>
            <br />
          </form>
        </Box>
      </Modal>

      {/* edit meeting modal */}

      {/* Toastr */}

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message='Meeting was saved successfully'
      />
    </>
  );
};

export default Meeting;
