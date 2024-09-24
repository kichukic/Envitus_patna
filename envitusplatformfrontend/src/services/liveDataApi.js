import { updateDashboardData } from '../action/liveDataAction';

const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function getDashboardData(dispatch, options) {
    const response = axios.get(API + "device/sensor/livedata/?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                dispatch(updateDashboardData(res.data.data));
                return res.data.data.liveDataPerDeviceId[0].dataList;
            }
        });
    }; 
}

export function getSummary(dispatch, options) {
    const response = axios.get(API + "device/sensor/summary?" +
        new URLSearchParams(urlParam));
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                dispatch(updateDashboardData(res.data.data));
                return res.data.data;
            }
        });
    }; 
}

export function getSummarySpec() {
    const response = axios.get(API + "device/summary/spec?" +
        new URLSearchParams(urlParam));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return res.data.data;
            }
        });
    }; 
}

export function getAllDeviceData(options) {
    const response = axios.get(API + "device/sensor/livedata/all?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return res.data.data;
            }
        });
    }; 
}

export function updateParam(dispatch, data) {
    const response = axios.post(API + "device/sensor/livedata/update?" +
        new URLSearchParams(urlParam), data);
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return true;
            }
            return false;
        });
    }; 
}

export function getDashboardDataCount(dispatch, options) {
    const response = axios.get(API + "device/sensor/livedata/count?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {  
                return res.data.data.liveDataCountPerDeviceId[0].count;
            }
        });
    }; 
}
