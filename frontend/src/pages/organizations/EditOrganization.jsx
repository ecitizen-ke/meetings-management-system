import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { getData } from '../../utils/api';
import { Config } from '../../Config';
import { getToken } from '../../utils/helpers';

const EditOrganization = () => {
  const params = useParams();
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };

  useEffect(() => {});
  const fetchOrganization = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/organization/${params.id}`,
        customHeaders
      );
    } catch (error) {}
  };
  return (
    <div className='container-fluid'>
      <div className='row'>
        <div className='col-lg-3'></div>
        <div className='col-lg-6'>
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
                label='Name'
                variant='outlined'
                {...register('name', {
                  required: 'This field is required',
                })}
                error={errors.name && true}
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
            </Box>

            <br />
            <br />

            <TextField
              multiline={true}
              minRows={5}
              label='Description'
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

            <Button
              disabled={isSubmitting}
              fullWidth={true}
              variant='contained'
              color='primary'
              type='submit'
            >
              {isSubmitting ? 'Please wait ...' : 'Save'}
            </Button>
          </form>
        </div>
        <div className='col-lg-3'></div>
      </div>
    </div>
  );
};

export default EditOrganization;
