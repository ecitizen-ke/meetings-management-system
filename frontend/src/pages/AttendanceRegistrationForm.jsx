import React, { useEffect, useState } from 'react';
import '../assets/landing.css';
import { Config } from '../Config';
import { useParams } from 'react-router';
import moment from 'moment';
import logo from '../assets/logo.svg';
import { useForm } from 'react-hook-form';
import { Snackbar } from '@mui/material';
import SignPad from '../components/SignPad';
import { useDispatch, useSelector } from 'react-redux';
import { handleApiError } from '../utils/errorHandler';
import { getData, postData } from '../utils/api';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { getToken } from '../utils/helpers';

const AttendanceRegistrationForm = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [orgOther, setOrgOther] = useState(false);
  const [orgOtherValue, setOrgOtherValue] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionVisibility, setSuggestionVisibility] = useState(true);
  const sign = useSelector((state) => state.signature);
  const dispatch = useDispatch();
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

  const fetchMeetingDetail = async () => {
    try {
      // Fetch meeting details
      const { data } = await getData(
        `${Config.API_URL}/attendees/meeting/${id}`,
        customHeaders
      );
      setMeeting(data);
      let orgArray = [];
      data.organizations.map((org) => {
        let orgObj = {
          label: '',
          value: '',
        };
        orgObj.label = org.name;
        orgObj.value = org.name;
        orgArray.push(orgObj, {
          label: 'Other (Specify)',
          value: 'Other',
        });
      });
      setOrganizations(orgArray);
    } catch (error) {
      console.error('An error occurred:', error.message);
      // Handle network errors or other exceptions
      throw error;
    }
  };

  useEffect(() => {
    fetchMeetingDetail();
  }, []);

  const onSubmit = async (data) => {
    if (!id) throw new Error("Meeting don't exist");
    if (!sign.signatureImage) {
      Swal.fire({
        // title: "Logout",
        text: 'Please ensure you have signed ',
        icon: 'warning',
        // showCancelButton: true,
        confirmButtonColor: '#398e3d',
        // cancelButtonColor: "#d33",
        confirmButtonText: 'ok',
      }).then((result) => {
        if (result.isConfirmed) {
        }
      });
      return;
    }
    try {
      data['meeting_id'] = id;
      data['signature'] = sign.signatureImage;

      if (!selectedOrg) {
        Swal.fire({
          // title: "Logout",
          text: 'Please select orgnization ',
          icon: 'warning',
          // showCancelButton: true,
          confirmButtonColor: '#398e3d',
          // cancelButtonColor: "#d33",
          confirmButtonText: 'ok',
        }).then((result) => {
          if (result.isConfirmed) {
          }
        });
        return;
      }
      data['organization'] = selectedOrg;

      const result = await postData(`${Config.API_URL}/attendees`, data, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      setOpenToast(true);
      setIsRegistered(true);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const fetchOptions = async (input) => {
    try {
      setTimeout(async () => {
        const { data } = await getData(
          `${Config.API_URL}/organizations-search?search=${input}`,
          customHeaders
        );
        console.log(data);
        const formattedOptions = data.map((item) => ({
          value: item.name,
          label: item.name,
        }));
        console.log(formattedOptions);
        setSuggestions(formattedOptions);
      }, 800);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const handleKeyUp = (e) => {
    const input = e.target.value;
    console.log(input);
    setInputValue(input);
    if (input.length > 2) {
      // Fetch only if input has more than 2 characters
      fetchOptions(input);
      setSuggestionVisibility(true);
    } else {
      setSuggestions([]);
    }
  };

  const onSuggestionClick = (suggestion) => {
    setSelectedOrg(suggestion);
    setSuggestionVisibility(false);
  };
  const handleOrgChange = (org) => {
    setSelectedOrg(org);
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };

  return (
    <div
      style={{
        backgroundColor: '#efefef',
      }}
    >
      <nav className='navbar fixed-top navbar-expand-lg shadow-sm bg-body-tertiary'>
        <div className='container'>
          <a className='navbar-brand' href='#'>
            <img src={logo} alt='logo' height='55' />
          </a>
          <button className='navbar-toggler' type='button'>
            <span className='navbar-toggler-icon'></span>
          </button>
          <div className='collapse navbar-collapse' id='navbarNav'>
            <ul className='navbar-nav'>
              {/* <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
      <div className='landing-page-outer container-fluid'>
        <div className='landing-page-inner row p-3  borderd-0'>
          <div className='col-lg-3 m-2'></div>
          <div className='registration-form card col-lg-6 m-2'>
            <div className='card-body'>
              <h3 className='text-muted'>{meeting && meeting.title}</h3>
              <br />
              <table className='table table-striped'>
                <tbody>
                  <tr>
                    <th scope='row'>Venue</th>
                    <td></td>
                    <td></td>
                    <td>{meeting && meeting.venue.building}</td>
                  </tr>
                  <tr>
                    <th scope='row'>Date</th>
                    <td></td>
                    <td></td>
                    <td>
                      {meeting &&
                        moment(meeting.meeting_date).format('MMMM D, YYYY')}
                    </td>
                  </tr>
                  <tr>
                    <th scope='row'>Time</th>
                    <td></td>
                    <td></td>
                    <td>
                      {meeting &&
                        moment(meeting.start_time, 'HH:mm').format(
                          'hh:mm A'
                        )}{' '}
                      to{' '}
                      {meeting &&
                        moment(meeting.end_time, 'HH:mm').format('hh:mm A')}
                    </td>
                  </tr>
                </tbody>
              </table>
              {isRegistered && (
                <div className='alert alert-success' role='alert'>
                  You have successfully registered for the meeting.
                </div>
              )}
              {!isRegistered && (
                <div>
                  <br />
                  <br />
                  <h3 className='text-muted'>Registration</h3>

                  {/* Registration form */}
                  <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    action=''
                    method='post'
                  >
                    <div className='row'>
                      <div className='col-lg-6'>
                        <div className='my-3'>
                          <label htmlFor='name' className='form-label'>
                            First Name
                          </label>
                          <input
                            type='text'
                            className='form-control rounded-0'
                            id='first_name'
                            {...register('first_name', {
                              required: 'This field is required',
                            })}
                            name='first_name'
                            required
                          />
                          {errors.first_name && (
                            <span
                              style={{
                                color: 'crimson',
                              }}
                            >
                              {errors.first_name.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className='col-lg-6'>
                        <div className='my-3'>
                          <label htmlFor='l_name' className='form-label'>
                            Last Name
                          </label>
                          <input
                            type='text'
                            className='form-control rounded-0'
                            id='l_name'
                            name='l_name'
                            {...register('last_name', {
                              required: 'This field is required',
                            })}
                            required
                          />
                          {errors.last_name && (
                            <span
                              style={{
                                color: 'crimson',
                              }}
                            >
                              {errors.last_name.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='my-3'>
                      <label htmlFor='email' className='form-label'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        className='form-control rounded-0'
                        id='email'
                        {...register('email', {
                          required: 'This field is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Please enter a valid email address',
                          },
                          message: 'Please enter a valid email address',
                        })}
                        name='email'
                        required
                      />
                    </div>
                    {errors.email && (
                      <span
                        style={{
                          color: 'crimson',
                        }}
                      >
                        {errors.email.message}
                      </span>
                    )}
                    <div className='my-3'>
                      <label htmlFor='phone' className='form-label'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        className='form-control rounded-0'
                        id='phone'
                        name='phone'
                        {...register('phone', {
                          required: 'This field is required',
                        })}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <span
                        style={{
                          color: 'crimson',
                        }}
                      >
                        {errors.phone.message}
                      </span>
                    )}
                    <div className='my-3'>
                      <label htmlFor='organization' className='form-label'>
                        Organization
                      </label>
                      <Select
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        options={organizations}
                        // onInputChange={handleInputChange}
                        // inputValue={inputValue}
                        onChange={(selectedOptions) => {
                          if (selectedOptions.value === 'Other') {
                            // dispatch(toggleVenueOther());
                            setSuggestionVisibility(false);
                            setOrgOther(true);
                          } else {
                            setSelectedOrg(selectedOptions.value);
                            setOrgOther(false);
                          }
                        }}
                      />
                    </div>
                    {orgOther && (
                      <div className=' position-relative'>
                        <div
                          style={{
                            height: '80px',
                          }}
                        >
                          <label htmlFor='organization' className='form-label'>
                            Specify Organization{' '}
                            <span className='text-danger'>*</span>
                          </label>
                          <input
                            type='text'
                            className='form-control rounded-0'
                            id='organization'
                            onKeyUp={handleKeyUp}
                            onChange={(e) => handleOrgChange(e.target.value)}
                            name='organization'
                            value={selectedOrg}
                            required
                          />
                        </div>
                        {suggestionVisibility && (
                          <>
                            {suggestions.length > 0 && (
                              <div
                                style={{
                                  zIndex: '99999',
                                  width: '100%',
                                }}
                                className='position-absolute bg-white mt-3'
                              >
                                <small>
                                  <em>Suggestions ({suggestions.length})</em>
                                </small>
                                {suggestions.map((org, i) => (
                                  <div
                                    key={i}
                                    className='my-2 p-3 border-bottom shadow-sm'
                                  >
                                    <button
                                      onClick={() =>
                                        onSuggestionClick(org.value)
                                      }
                                      className='text-muted btn btn-light'
                                      href='#'
                                    >
                                      {org.value}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    {/* <div className="my-3">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        id="department"
                        {...register("department", {
                          required: "This field is required",
                        })}
                        name="department"
                        required
                      />
                    </div>
                    {errors.department && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.department.message}
                      </span>
                    )} */}
                    <div className='my-3'>
                      <label htmlFor='designation' className='form-label'>
                        Designation
                      </label>
                      <input
                        type='text'
                        className='form-control rounded-0'
                        id='designation'
                        {...register('designation', {
                          required: 'This field is required',
                        })}
                        name='designation'
                        required
                      />
                    </div>
                    {errors.designation && (
                      <span
                        style={{
                          color: 'crimson',
                        }}
                      >
                        {errors.designation.message}
                      </span>
                    )}
                    <div>
                      <label htmlFor=''>Sign</label>
                    </div>
                    <div
                      style={{
                        border: '2px dotted #ccc',
                      }}
                      className='my-3'
                    >
                      <br />
                      <SignPad />
                    </div>

                    <div className='my-3'>
                      <button
                        disabled={isSubmitting}
                        className='btn btn-success w-100 rounded-0 btn-large'
                      >
                        {isSubmitting ? 'Please wait ...' : 'Register'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          <div className='col-lg-3'></div>
        </div>
      </div>

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message='Attendance recorded successfully'
      />
    </div>
  );
};

export default AttendanceRegistrationForm;
