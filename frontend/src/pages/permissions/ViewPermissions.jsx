import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { deleteData, getData } from '../../utils/api';
import { Config } from '../../Config';
import { getToken, showMessage } from '../../utils/helpers';
import { Alert, Badge } from '@mui/material';
import { ChevronLeft, Delete } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { handleApiError } from '../../utils/errorHandler';
import Notification from '../../components/Notification';

const ViewPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const params = useParams();
  const headers = {
    Authorization: `Bearer ${getToken()}`, // Replace with your actual token
  };
  const dispatch = useDispatch();

  const handleDelete = (permission) => {
    // Implement delete permission logic here
    Swal.fire({
      title: 'Delete Permission',
      text: 'Are you sure you want to delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#398e3d',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Proceed',
    }).then(async (result) => {
      if (result.isConfirmed) {
        // todo: delete
        try {
          const result = await deleteData(
            `${Config.API_URL}/permissions/delete`,
            headers
          );
          showMessage(`Permission deleted successfully`, dispatch);
        } catch (error) {
          handleApiError(error, dispatch);
        }
      }
    });
  };

  useEffect(() => {
    fetchPermissions(params.name);
  }, []);

  const fetchPermissions = async (role) => {
    const { data } = await getData(
      `${Config.API_URL}/roles/${role}/permissions`,
      headers
    );
    setPermissions(data);
  };
  return (
    <div className='container'>
      <div className='mb-3 d-flex align-items-center justify-content-between border-bottom'>
        <div>
          {' '}
          <h4>
            Permissions &nbsp;
            {permissions.length > 0 && (
              <Badge
                max={10}
                badgeContent={permissions.length}
                color='secondary'
              ></Badge>
            )}{' '}
          </h4>
          <strong>Role: </strong>
          {params.name}
        </div>
        <div>
          <button
            type='button'
            onClick={() => window.history.back()}
            className='btn btn-light'
          >
            <ChevronLeft />
            &nbsp;Back
          </button>
        </div>
      </div>
      <br />
      <br />
      <Notification />
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission, index) => (
            <tr key={permission.id}>
              <td>{index + 1}</td>
              <td>{permission}</td>
              <td>
                <button
                  onClick={() => handleDelete(permission)}
                  className='btn btn-sm btn-danger rounded-0'
                >
                  Delete&nbsp;
                  <Delete fontSize='small' />
                </button>
              </td>
            </tr>
          ))}
          {permissions.length === 0 && (
            <tr>
              <td colSpan='3'>
                <Alert severity='info' color='warning'>
                  No permissions found.
                </Alert>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewPermissions;
