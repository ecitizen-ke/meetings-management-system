import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Notification from '../../components/Notification';
import { Config } from '../../Config';
import { getToken } from '../../utils/helpers';
import { DataGrid } from '@mui/x-data-grid';
import { getData } from '../../utils/api';

const Permissions = () => {
  const navigate = useNavigate();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchPermissions();
  }, []);
  const fetchPermissions = async () => {
    try {
      const url = `${Config.API_URL}/permissions`;
      const headers = {
        Authorization: `Bearer ${getToken()}`, // Replace with your actual token
      };

      const { data } = await getData(url, headers);
      console.log(data);
      setPermissions(data);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Permission Name', width: 200 },
    { field: 'created_on', headerName: 'Created On', width: 200 },
    { field: 'updated_on', headerName: 'Updated On', width: 200 },
  ];

  return (
    <div className='card'>
      <div className='card-header bg-success-subtle d-flex justify-content-end'>
        <Button
          onClick={() => navigate('/dashboard/create-permissions')}
          variant='contained'
          endIcon={<Add />}
          color='secondary'
        >
          Add New Permission
        </Button>
      </div>
      <div className='card-body'>
        <Notification />
        <br />
        <br />
        <div style={{ width: '100%' }}>
          <DataGrid
            rows={permissions}
            columns={columns}
            pageSize={5}
            loading={loading}
            getRowId={(row) => row.id}
            disableSelectionOnClick
          />
        </div>
      </div>
    </div>
  );
};

export default Permissions;
