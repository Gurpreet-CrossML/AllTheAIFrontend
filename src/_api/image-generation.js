import axios from 'axios'
import { BASE_URL } from "config";
import { filterChangeImg, historyImage, imageConfig, imageGenerate, imageList, imageModel, imgTemplate, pageChangeImg } from './endpoint';

/**
 * @method [pickTemplate] to select the templates
 * @returns Promise
 */
export const pickaTemplate = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${imgTemplate}`, { headers: headers })
}


/**
 * @method [generateImage] to generate an image 
 * @returns Promise
 */
export const generateImage = (params) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.post(`${BASE_URL}${imageGenerate}`, params, { headers: headers })
}

/**
 * @method [generateImagesList] use to display the list of generated image in image-history-table
 * @returns Promise
 */
export const generateImagesList = () => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.get(`${BASE_URL}${imageList}`, { headers: headers })
}

/**
 * @method [generateImagesList] used to get an specific image with the help of its conifg id
 * @returns Promise
 */
export const imageHistory = (id) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.get(`${BASE_URL}${historyImage}${id?.id}${'/'}`, { headers: headers })
}


/**
 * @method [getImageModel] use to get image model list 
 * @returns Promise
 */
export const pickImageModel = () => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${imageModel}`, { headers: headers })
}

/**
 * @method [getImageConfig] used to fetch the history of the specific generated image 
 * @returns Promise
 */
export const getImageConfig = (template_id) => {

    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${imageConfig}${template_id}/`, { headers: headers })
}

/**
 * @method [filterChange] used  to apply filter on the image-history-table
 * @returns Promise
 */
export const filterChange = (searchText) => {

    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${filterChangeImg}${searchText}`, { headers: headers })
}

/**
 * @method [pageChange] to change the page of the image history table
 * @returns Promise
 */
export const pageChange = (data) => {

    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pageChangeImg}${data + 1}&page_size=25`, { headers: headers })
}

/**
 * @method [pageSizeChange] to change the page size  of the image history table
 * @returns Promise
 */
export const pageSizeChange = (data) => {

    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pageSizeImg}${data}`,{ headers: headers })
}
