import React from 'react';
import { useForm } from 'react-hook-form';
import { Config } from '../../Config';
import { postData } from '../../utils/api';
import { getToken, showMessage } from '../../utils/helpers';
import { ChevronLeft } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { handleApiError } from '../../utils/errorHandler';
import { useNavigate } from 'react-router';
const CreatePermission = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    try {
      const url = `${Config.API_URL}/permissions`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      };

      const response = await postData(url, data, headers);
      showMessage(
        response.message || 'Permission created successfully!',
        'success',
        dispatch
      );
      reset(); // Reset form fields on success
      navigate('/dashboard/permissions');
    } catch (error) {
      handleApiError(
        'Failed to create permission. Check the console for more details.',
        dispatch
      );
      console.error(error);
    }
  };
  return (
    <div className='container mt-5'>
      <div className='d-flex justify-content-between align-items-center'>
        <div>
          <h2>Create Permission</h2>
        </div>
        <div>
          <button
            onClick={() => window.history.back()}
            className='btn btn-light'
          >
            <ChevronLeft /> Go Back
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='needs-validation'>
        <div className='mb-3'>
          <label htmlFor='permissionName' className='form-label'>
            Permission Name
          </label>
          <input
            id='permissionName'
            type='text'
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            {...register('name', { required: 'Permission name is required' })}
          />
          {errors.name && (
            <div className='invalid-feedback'>{errors.name.message}</div>
          )}
        </div>
        <button type='submit' className='btn btn-success'>
          Create
        </button>
      </form>
    </div>
  );
};

export default CreatePermission;
