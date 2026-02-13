import axios from "axios";
import { BASE_URL } from "config";
import { SocialMediaTemplate, createSchedule, deleteSchedule, disconnectSocialPlatform, facebookConnect, linkedinConnect, socialPost, twitterConnect, updateSchedular } from "./endpoint";



/**
 * @method [pickaTemplate] to get the templates of social-media
 * @returns Promise
 */
export const pickaTemplate = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${SocialMediaTemplate}`, { headers: headers })
}


/**
 * @method [connectToLinkedinSocial] used to connect with linkedin-social-media
 * @returns Promise
 */
export const connectToLinkedinSocial = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${linkedinConnect}`, { headers: headers })
}

/**
 * @method [connectToTwitterSocial] used to connect with twitter-social-media
 * @returns Promise
 */
export const connectToTwitterSocial = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${twitterConnect}`, { headers: headers })
}


/**
 * @method [connectToFacebookSocial] used to connect with facebook-social-media
 * @returns Promise
 */
export const connectToFacebookSocial = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${facebookConnect} `, { headers: headers })
}


/**
 * @method [getMetaPages] used to get meta pages (instagram / facebook)
 * @returns Promise
 */
export const getMetaPages = (url, id) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${url}${id}/`, { headers: headers })
}


/**
 * @method [socialEventList] used to get list of social events scheduled or published 
 * @returns Promise
 */
export const socialEventList = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}api/social/schedules/`, { headers: headers })
}


/**
 * @method [createSocialPost] to fetch the list from the server
 * @returns Promise
 */
export const createSocialPost = (requestData) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.post(`${BASE_URL}${socialPost}`, requestData, { headers: headers })
}

/**
 * @method [schedulePost] to create a social-media-post
 * @returns Promise
 */
export const schedulePost = (requestData) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.post(`${BASE_URL}${createSchedule}`, requestData, { headers: headers })
}

/**
 * @method [disconnectSocialMedia] used to disconnect the existing social-meida
 * @returns Promise
 */
export const disconnectSocialMedia = (val) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.delete(`${BASE_URL}${disconnectSocialPlatform}${val.social_platform_id}/`,{ headers: headers })
}

/**
 * @method [updateSocialSchedule] to update the scheduled event from the list
 * @returns Promise
 */
export const updateSocialSchedule = (scheduleId, requestData) => {
    const authToken = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${authToken}`
    }
  
    return axios.put(`${BASE_URL}${updateSchedular}${scheduleId}/`, requestData, { headers: headers })
  }


/**
 * @method [deleteScheduleEvent] used to delete the scheduled event from the list
 * @returns Promise
 */
export const deleteScheduleEvent = (scheduleId, requestData) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.delete(`${BASE_URL}${deleteSchedule}${scheduleId}/`, { headers: headers, data: requestData })
}



