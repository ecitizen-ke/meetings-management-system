import axios from 'axios';

// for POST requests
export const postData = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(url, data, {
      headers: {
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.msg);
    }
    throw error;
  }
};

// for update requests
export const putData = async (url, data, headers = {}) => {
  try {
    const response = await axios.put(url, data, {
      headers: {
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    throw error;
  }
};

// patch data
export const patchData = async (url, data, headers = {}) => {
  try {
    const response = await axios.patch(url, data, {
      headers: {
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    throw error;
  }
};

// for GET requests
export const getData = async (url, headers = {}) => {
  try {
    const response = await axios.get(url, {
      headers: {
        ...headers,
      },
    });
    if (response.status === 204) {
      console.log('No data returned');
      return {
        data: [],
      };
    } else {
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    throw error;
  }
};

// for DELETE requests

export const deleteData = async (url, headers = {}) => {
  try {
    const response = await axios.delete(url, {
      headers: {
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Server responded with an error:', error.response.data);
      console.error('Status code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error in request setup:', error.message);
    }
    throw error;
  }
};
