import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { getData } from '../../utils/api';
import { Config } from '../../Config';
import { getToken } from '../../utils/helpers';

const ViewPermissions = () => {
  const params = useParams();
  const headers = {
    Authorization: `Bearer ${getToken()}`, // Replace with your actual token
  };

  useEffect(() => {
    fetchPermissions(params.name);
  });

  const fetchPermissions = async (role) => {
    const { data } = await getData(
      `${Config.API_URL}/roles/${role}/permissions`,
      headers
    );
    console.log(data); // Display the fetched permissions in the console for debugging purposes.
  };
  return <div className='container'></div>;
};

export default ViewPermissions;
