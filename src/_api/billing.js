import axios from 'axios'
import { BASE_URL } from "config";
    import { billingAddress, billingCheckout, billingDetails, getSubscription, subscribePlan, subscriptionCancel } from './endpoint';

/**
 * @method [getSubscriptionPacks] to fetch the list from the server of subscription 
 * @returns Promise
 */
export const getSubscriptionPacks = () => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.get(`${BASE_URL}${getSubscription}`, { headers: headers })
}


/**
 * @method [subscribeToPlan] to select a specific  plan from the list
 * @returns Promise
 */
export const subscribeToPlan = (params) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.post(`${BASE_URL}${subscribePlan}`, params, { headers: headers })
}

/**
 * @method [getBillingAddressDetails] to get the billing address details
 * @returns Promise
 */
export const getBillingAddressDetails = () => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.get(`${BASE_URL}${billingDetails}`, { headers: headers })
}

/**
 * @method [addBillingAddressDetails] to add the details of billing address
 * @returns Promise
 */
export const addBillingAddressDetails = (params) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.post(`${BASE_URL}${billingAddress}`, params, { headers: headers })
}

/**
 * @method [updateBillingAddressDetails] to update the billing address details
 * @returns Promise
 */
export const updateBillingAddressDetails = (params) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.put(`${BASE_URL}${billingAddress}`, params, { headers: headers })
}

/**
 * @method [cancelSubscription] to cancel the account subscription
 * @returns Promise
 */
export const cancelSubscription = (params) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.put(`${BASE_URL}${subscriptionCancel}`, params, { headers: headers })
}

/**
 * @method [checkoutBilling] for the billing of selected plan 
 * @returns Promise
 */
export const checkoutBilling = (payload) => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.post(`${BASE_URL}${billingCheckout}`, payload, { headers: headers })
}
