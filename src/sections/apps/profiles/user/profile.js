import axios from 'axios';
import { BASE_URL } from 'config';

/**
 * @method [activePlan] to fetch the list from the server
 * @returns Promise
 */
export const updatePassword = (requestData) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.post(`${BASE_URL}api/auth/change_password/`, { requestData }, { headers: headers });
};

/**
 * @method [activePlan] to fetch the list from the server
 * @returns Promise
 */
export const authLogout = () => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.post(`${BASE_URL}api/auth/logout/`, {}, { headers: headers });
};

/**
 * @method [deletePersonaType] use to get the tones from the server
 * @returns Promise
 */
export const deleteProfilePic = (data) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.delete(`${BASE_URL}api/auth/picture/delete/`, { headers: headers, data: data });
};
