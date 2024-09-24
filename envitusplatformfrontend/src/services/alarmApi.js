import { updateAlarmruleDetails } from '../action/alarmAction';

const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function getAllAlarmrules(dispatch, options) {
    const response = axios.get(API + "alarm/rules/device?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                dispatch(updateAlarmruleDetails(res.data.data));
                return res.data.data;
            }
        })
    }
}

export function getAlarmruleCount(dispatch) {
    const response = axios.get(API + "alarm/rules/device/count?" + new URLSearchParams(urlParam));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data;
            }
        })
    }
}

export function deleteAlarmrule(dispatch, options) {
    const response = axios.delete(API + "alarm/rules/device?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return true;
            }
            return false;
        });
    }; 
}

export function addAlarmrule(dispatch, data) {
    const response = axios.post(API + "alarm/rules/device?" +
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

export function updateAlarmrule(dispatch, data) {
    const response = axios.put(API + "alarm/rules/device?" +
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

export function getAllActiveAlarm(dispatch, options) {
    const response = axios.get(API + "alarm/records?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data;
            }
        })
    }
}

export function getActiveAlarmCount(dispatch) {
    const response = axios.get(API + "alarm/records/count?" + new URLSearchParams(urlParam));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data;
            }
        })
    }
}

export function updateActiveAlarm(dispatch, data) {
    const response = axios.put(API + "alarm/records?" +
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
