import axios from 'axios';
import { BASE_URL } from 'config';
import {
  categoriesList,
  contentEventHistory,
  contentGenerate,
  contentHistory,
  contentTemplate,
  contentUpdate,
  searchGeneratedContent,
  templateCategory,
  templateConfig,
  contentPageSize,
  connectSocialMedia
} from './endpoint';

/**
 * @method [pickaTemplate] to select the templates to generate a content
 * @returns Promise
 */
export const pickaTemplate = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${contentTemplate}`, { headers: headers });
};

/**
 * @method [getTemplateConfig] will return the list of the Question of that partciular template
 * @param {String} id
 * @returns Promise
 */
export const getTemplateConfig = (id) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${templateConfig}${id}${'/'}`, { headers: headers });
};

/**
 * @method [generateNewContent] use to generate a content
 * @param {Object} params
 * @returns Promise
 */
export const generateNewContent = (params) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.post(`${BASE_URL}${contentGenerate}`, params, { headers: headers });
};

/**
 * @method [updateContent] use to Update the content and save as Draft
 * @param {String} id
 * @param {Object} params
 * @returns Promise
 */
export const updateContent = (id, params) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.put(`${BASE_URL}${contentUpdate}${id}/`, params, { headers: headers });
};

/**
 * @method [historyOfContent] use to fetch the history of the generated content
 * @returns Promise
 */
export const historyOfContent = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${contentHistory}`, { headers: headers });
};

/**
 * @method [getEventsHistory] use to fetch the history of the event
 * @returns Promise
 */
export const getEventsHistory = (id) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${contentEventHistory}${id}${'/'}`, { headers: headers });
};

/**
 * @method [listCategories] need to fetch the categories list
 * @returns Promise
 */
export const listCategories = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${categoriesList}`, { headers: headers });
};

/**
 * @method [copyGeneratedContent] can make a  seperate copy of  generated content
 * @returns Promise
 */
export const copyGeneratedContent = (pathname, params) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.post(`${BASE_URL}${pathname}`, params, { headers: headers });
};

/**
 * @method [socialMediaConnected] used to connect the social-media
 * @returns Promise
 */
export const socialMediaConnected = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${connectSocialMedia}`, { headers: headers });
};

/**
 * @method [filterChange] to apply the filter on the tcontent-able
 * @returns Promise
 */
export const filterChange = (searchText) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${searchGeneratedContent}${searchText}`, { headers: headers });
};

/**
 * @method [pageSize] to change the page size  of the content history table
 * @returns Promise
 */
export const pageSize = (data) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${contentPageSize}${data}`, { headers: headers });
};

/**
 * @method [pageChange] to change the page of the content history table
 * @returns Promise
 */
export const pageChange = (url) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(url, { headers: headers });
};

/**
 * @method [categoryTemplate] to select the categories of which template should be choosen
 * @returns Promise
 */
export const categoryTemplate = (categoryId) => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${templateCategory}${categoryId}`, { headers: headers });
};

/**
 * @method [getPersonnaDetails] use to fetch the history of the generated content
 * @returns Promise
 */
export const getPersonnaDetails = () => {
  const authToken = localStorage.getItem('token');
  // Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`
  };

  return axios.get(`${BASE_URL}${contentPageSize}${data}`, { headers: headers });
};
