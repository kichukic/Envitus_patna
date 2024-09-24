const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function getDataStats(dispatch, options) {
    const response = axios.get(API + "device/sensor/stats?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return res.data.data.statPerDeviceId[0];
            }
        });
    }; 
}

export function getDataStatsCount(dispatch, options) {
    const response = axios.get(API + "device/sensor/stats/count?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {  
                const statCount = res.data.data.statCountPerDeviceId[0].stat;
                const timeFm = Object.getOwnPropertyNames( statCount )[0];
                return statCount[timeFm];
            }
        });
    }; 
}
