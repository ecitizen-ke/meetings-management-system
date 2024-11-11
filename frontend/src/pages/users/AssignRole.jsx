import { ChevronLeft } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { deleteData, getData, postData } from '../../utils/api';
import { Config } from '../../Config';
import { getToken, showMessage } from '../../utils/helpers';
import { useDispatch } from 'react-redux';
import { handleApiError } from '../../utils/errorHandler';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
const AssignRole = () => {
  const [roles, setRoles] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const dispatch = useDispatch();
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();
  // Get values of 'email' and 'name'
  const email = queryParams.get('email');
  const name = queryParams.get('name');
  useEffect(() => {
    fetchRoles();
  }, []);
  const fetchRoles = async () => {
    try {
      const { data } = await getData(`${Config.API_URL}/roles`, customHeaders);
      const roles = data.map((role) => ({
        value: role.name,
        label: role.name,
      }));
      setRoles(roles);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  const onSubmit = async (data) => {
    let payload = {
      email: null,
      role: null,
    };
    payload.email = email;
    payload.role = data.roles.value;
    try {
      const response = await postData(
        `${Config.API_URL}/auth/users/roles/assign`,
        payload,
        customHeaders
      );

      reset();
      showMessage('Role assigned successfully!', 'success', dispatch);
      navigate(`/dashboard/users`);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  return (
    <div className='container-fluid'>
      <div className='header d-flex align-items-center justify-content-between'>
        <div>
          <h4>Assign Roles to User</h4>
          <br />
          <strong>Name:</strong>
          {name}
          <br />
          <strong>Email</strong>&nbsp;{email}
        </div>
        <Button
          onClick={() => window.history.back()}
          variant='contained'
          color='primary'
        >
          <ChevronLeft />
          &nbsp; Back to Users
        </Button>
      </div>
      <div className='mt-3'>
        <div className='row'>
          <div className='col-lg-3'></div>
          <div className='col-lg-6'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box mb={2}>
                Roles
                <Controller
                  name='roles'
                  control={control}
                  rules={{ required: 'Please select at least one role' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={roles}
                      placeholder='Select roles'
                      styles={{
                        control: (base) => ({ ...base, minHeight: 55 }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  )}
                />
                {errors.roles && (
                  <span style={{ color: 'crimson' }}>
                    {errors.roles.message}
                  </span>
                )}
              </Box>

              <Button
                disabled={isSubmitting}
                type='submit'
                variant='contained'
                color='primary'
                fullWidth
              >
                {isSubmitting ? 'Assigning...' : 'Assign Role'}
              </Button>
            </form>
          </div>
          <div className='col-lg-3'></div>
        </div>
      </div>
    </div>
  );
};

export default AssignRole;
