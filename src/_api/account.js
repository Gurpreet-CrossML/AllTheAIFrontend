import axios from 'axios';
import { BASE_URL } from 'config';
import { authLogin, authLogout, authRegister, authforgotPassword, getProfile, verfiyAuthForgotPassword } from './endpoint';

/**
 * @method [getPersonalInfo] to fetch the list from the server
 * @returns Promise
 */
export const getPersonalInfo = () => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}${getProfile}`, { headers: headers });
};

/**
 * @method [setPersonalInfo] to update the profile details
 * @returns Promise
 */
export const setPersonalInfo = (formData) => {
  const authToken = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${authToken}`
  };

  return axios.put(`${BASE_URL}${getProfile}`, formData, { headers: headers });
};

/**
 * @method  [changePassword] to change the password
 * @returns Promise
 */
export const changePassword = (requestData) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.post(`${BASE_URL}api/auth/change_password/`, requestData, { headers: headers });
};

/**
 * @method [userLogout] to logout the existing user
 * @returns Promise
 */
export const userLogout = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.post(`${BASE_URL}${authLogout}`, {}, { headers: headers });
};

/**
 * @method [deleteProfilePic]  to delete the profile picture from profile section
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

/**
 * @method [userLogin] to login the user
 * @returns Promise
 */
export const userLogin = (params) => {
  return axios.post(`${BASE_URL}${authLogin}`, params);
};

/**
 * @method [registerMethod] to register a new user
 * @returns Promise
 */
export const registerMethod = (params) => {
  return axios.post(`${BASE_URL}${authRegister}`, params);
};

/**
 * @method [forgetPassword] to reset the password if user has forget the password
 * @returns Promise
 */
export const forgetPassword = (params) => {
  return axios.post(`${BASE_URL}${authforgotPassword}`, params);
};

/**
 * @method [verifyForgotPassword] to verify the forget password
 * @returns Promise
 */
export const verifyForgotPassword = (params) => {
  return axios.post(`${BASE_URL}${verfiyAuthForgotPassword}`, params);
};
