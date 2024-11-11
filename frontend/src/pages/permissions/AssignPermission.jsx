import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Button, Box, Typography, Divider } from '@mui/material';
import Select from 'react-select';
import { getData, postData } from '../../utils/api';
import { Config } from '../../Config';
import { handleApiError } from '../../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { getToken, showMessage } from '../../utils/helpers';

const AssignPermission = () => {
  const { id, role } = useParams(); // Get the role ID and role name from route params
  const dispatch = useDispatch();
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  // Fetch available permissions
  const fetchPermissions = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/permissions`,
        customHeaders
      );
      const permissionOptions = data.map((perm) => ({
        value: perm.name,
        label: perm.name,
      }));
      setPermissions(permissionOptions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        role,
        permissions: data.permissions.map((perm) => perm.value), // Map to get only permission IDs
      };
      console.log(payload);
      await postData(
        `${Config.API_URL}/roles/permissions/assign`,
        payload,
        customHeaders
      );
      reset();

      showMessage('Permission assigned successfully!', 'success', dispatch);
      navigate(`/dashboard/roles`);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h4'>Assign Permission to {role}</Typography>
      <Divider sx={{ my: 2 }} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={2}>
          <Controller
            name='permissions'
            control={control}
            rules={{ required: 'Please select at least one permission' }}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={permissions}
                placeholder='Select permissions'
                styles={{
                  control: (base) => ({ ...base, minHeight: 55 }),
                  menu: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            )}
          />
          {errors.permissions && (
            <span style={{ color: 'crimson' }}>
              {errors.permissions.message}
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
          {isSubmitting ? 'Assigning...' : 'Assign Permission'}
        </Button>
      </form>
    </Box>
  );
};

export default AssignPermission;
