import React, { useEffect, useState } from 'react';
import '../../assets/landing.css';
import { Config } from '../../Config';
import { useNavigate, useParams } from 'react-router';
import moment from 'moment';
import logo from '../../assets/logo.svg';
import { useForm } from 'react-hook-form';
import { Button, Snackbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { handleApiError } from '../../utils/errorHandler';
import { useDispatch } from 'react-redux';
import Notification from '../../components/Notification';
import { postData } from '../../utils/api';
import { showMessage } from '../../utils/helpers';

const Register = () => {
  const dispatch = useDispatch();
  const [openToast, setOpenToast] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {}, []);

  const onSubmit = async (data) => {
    try {
      const result = await postData(`${Config.API_URL}/auth/register`, data);
      setIsRegistered(true);
      showMessage(result.message, 'success', dispatch);
      navigate('/login');
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenToast(false);
  };
  const passwordValue = watch('password');

  return (
    <div
      style={{
        backgroundColor: '#efefef',
      }}
    >
      <nav className='navbar fixed-top navbar-expand-lg shadow-sm bg-body-tertiary'>
        <div className='container'>
          <Link to={`/login`} className='navbar-brand' href='#'>
            <img src={logo} alt='logo' height='55' />
          </Link>
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
            <div className='card-header'>
              <Button
                onClick={() => window.history.back()}
                variant='text'
                color='primary'
              >
                Go Back
              </Button>
            </div>
            <div className='card-body'>
              {isRegistered && (
                <div className='alert alert-success' role='alert'>
                  You have successfully registered
                </div>
              )}
              <Notification />
              {!isRegistered && (
                <div>
                  <div className='d-flex align-items-center'>
                    <div className='mr-3'></div>
                    <div>
                      <h3 className='text-muted'>Register</h3>
                    </div>
                  </div>

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
                          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                      <input
                        type='text'
                        className='form-control rounded-0'
                        id='organization'
                        name='organization'
                        required
                        {...register('organization', {
                          required: 'This field is required',
                        })}
                      />
                      {errors.organization && (
                        <span
                          style={{
                            color: 'crimson',
                          }}
                        >
                          {errors.organization.message}
                        </span>
                      )}
                    </div>

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

                    <div className='mb-3'>
                      <label>Password</label>
                      <input
                        name='password'
                        className='form-control'
                        type='password'
                        {...register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          pattern: {
                            value:
                              /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/,
                            message:
                              'Password must include uppercase, lowercase, number, and special character',
                          },
                        })}
                      />
                      {errors.password && (
                        <span
                          style={{
                            color: 'crimson',
                          }}
                        >
                          {errors.password.message}
                        </span>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className='mb-3'>
                      <label>Confirm Password</label>
                      <input
                        className='form-control'
                        name='password_confirmation'
                        type='password'
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) =>
                            value === passwordValue || 'Passwords do not match',
                        })}
                      />
                      {errors.confirmPassword && (
                        <span
                          style={{
                            color: 'crimson',
                          }}
                        >
                          {errors.confirmPassword.message}
                        </span>
                      )}
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
        message='Registered successfully'
      />
    </div>
  );
};

export default Register;
