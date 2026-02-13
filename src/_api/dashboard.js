import { BASE_URL } from "config";
import { activeSubscription, pageSizeHistory, pageSizeTransaction } from "./endpoint";
import axios from "axios";

/**
 * @method [contentHistoryDashboard] used to display content-history-table on dasboard 
 * @returns Promise 
 */
export const contentHistoryDashboard = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pageSizeHistory}`, { headers: headers })
}

/**
 * @method [transactionHistoryDashboard] used to display transaction-table on dasboard
 * @returns Promise
 */
export const transactionHistoryDashboard = () => {
    const authToken = localStorage.getItem('token');
    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }

    return axios.get(`${BASE_URL}${pageSizeTransaction}`, { headers: headers })
}

/**
 * @method [activePlan] to fetch the list from the server to display active plan subscribed 
 * @returns Promise
 */
export const activePlan = () => {
    const authToken = localStorage.getItem('token');

    // Headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    }
    return axios.get(`${BASE_URL}${activeSubscription}`, { headers: headers })
}