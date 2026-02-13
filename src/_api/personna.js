import axios from 'axios'
import { BASE_URL } from "config";
import { activePersona, createPersona, deletePersona, industriesList, pagePersona, pageSizePersonna, personaDetail, personaDropdown, personaList, personaSearch, personaStatus, personaTypes, targetAudience, tones, updatePersona } from './endpoint';

/**
 * @method [getList] to fetch the persona list from the server
 * @returns Promise
 */
export const getList = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaList}`, { headers: headers })
}

/**
 * @method [savePersonna] to create a new persona 
 * @returns Promise
 */
export const savePersonna = (params) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.post(`${BASE_URL}${createPersona}`, params, { headers: headers })
}

/**
 * @method [getTargetAudience] used to get the target audience list
 * @returns Promise
 */
export const getTargetAudience = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${targetAudience}`, { headers: headers })
}

/**
 * @method [getTones] used to get the  list of tones options
 * @returns Promise
 */
export const getTones = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${tones}`, { headers: headers })
}

/**
 * @method [getPersonaDetailsById] used to get the details of persona 
 * @returns Promise
 */
export const getPersonaDetailsById = (persona) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaDetail}${persona?.id}/`, { headers: headers })
}

/**
 * @method [getPersonaIndustryList] use to get the list of industryList 
 * @returns Promise
 */
export const getPersonaIndustryList = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${industriesList}`, { headers: headers })
}

/**
 * @method [getPersonaTypes] used to get the list of persona-type
 * @returns Promise
 */
export const getPersonaTypes = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaTypes}`, { headers: headers })
}

/**
 * @method [updatePersonaRecord] used to update the persona record
 * @returns Promise
 */
export const updatePersonaRecord = (id, params) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.put(`${BASE_URL}${updatePersona}${id?.id}/`, params, { headers: headers })
}

/**
 * @method [deletePersonaType] use to delete the persona the from the list
 * @returns Promise
 */
export const deletePersonaType = (id) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.delete(`${BASE_URL}${deletePersona}${id}/`, { headers: headers })
}

/**
 * @method [changeStatusForPersona] use to update the status of persona (active or deactive)
 * @returns Promise
 */
export const changeStatusForPersona = (id, status) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.put(`${BASE_URL}${personaStatus}${id}/?status=${status}`, {}, { headers: headers })
}


/**
 * @method [getPageSizePersona] to change the page size  of the persona-table
 * @returns Promise
 */
export const getPageSizePersona = (data) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pageSizePersonna}${data}`,  { headers: headers })
}

/**
 * @method [pageChange]  to change the page of the persona-table
 * @returns Promise
 */
export const pageChange = (data) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pagePersona}${data + 1}&page_size=25`, { headers: headers })
}


/**
 * @method [personaOption] use to get the list of existing persona in aoption 
 * @returns Promise
 */
export const personaOption = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaDropdown}`, { headers: headers })
}

/**
 * @method [personaSearchRecord] use to search the existing persona from the list
 * @returns Promise
 */
export const personaSearchRecord = (searchRecord) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaSearch}${searchRecord}`, { headers: headers })
}

/**
 * @method [activePersonna] use to activate the selected persona 
 * @returns Promise
 */
export const activePersonna = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${activePersona}`, { headers: headers })
}


/**
 * @method [filterChange] to apply the filter on the persona-table
 * @returns Promise
 */
export const filterChange = (searchText) => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${personaSearch}${searchText}`, { headers: headers })
}

