import axios from 'axios';
import { BASE_URL } from 'config';
import { transactionList } from './endpoint';

/**
 * @method [getList] to fetch the list from the server of transaction-history
 * @returns Promise
 */
export const getList = () => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}${transactionList}`, { headers: headers });
};

/**
 * @method [pageChange] to change the page of the transaction-table
 * @returns Promise
 */
export const pageChange = (data) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?page=${data + 1}&page_size=25`, { headers: headers });
};

/**
 * @method [pageSizeChange] to change the page size  of the transaction-table
 * @returns Promise
 */
export const pageSizeChange = (data) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?page_size=${data}`, { headers: headers });
};

/**
 * @method [filterChange] to apply the filter on the transaction-table
 * @returns Promise
 */
export const filterChange = (searchText) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?search=${searchText}`, { headers: headers });
};

/**
 * @method [getList] to fetch the list from the server
 * @returns Promise
 */
export const PageSizeChange = (data) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?page_size=${data}`, { headers: headers });
};

/**
 * @method [getList] to fetch the list from the server
 * @returns Promise
 */
export const PageChange = (data) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?page=${data + 1}&page_size=25`, { headers: headers });
};

/**
 * @method [getList] to fetch the list from the server
 * @returns Promise
 */
export const FilterChange = (searchText) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/transaction/?search=${searchText}`, { headers: headers });
};

/**
 * @method [download] to fetch the list from the server
 * @returns Promise
 */
export const downloadInvoice = (id) => {
  const authToken = localStorage.getItem('token');

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };
  return axios.get(`${BASE_URL}api/billing/invoice/${id}/`, { headers: headers });
};
