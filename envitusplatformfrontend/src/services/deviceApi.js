import { updateDeviceCount, updateDeviceDetails } from '../action/deviceAction';

const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function getDeviceCount(dispatch, options) {
    const response = axios.get(API + "device/count?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                dispatch(updateDeviceCount(res.data.data.deviceCount));
                return res.data.data.deviceCount;
            }
        });
    }; 
}

export function getDeviceDetails(dispatch, id) {
    const response = axios.get(API + "device/" + id +"?" + new URLSearchParams(urlParam));
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                dispatch(updateDeviceDetails(res.data.data));
                return res.data.data;
            }
        });
    }; 
}

export function getDeviceSpec(dispatch, options) {
    const response = axios.get(API + "device/spec?" +
        new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then( (res) => {
            if(res.data && res.data.status === "ok") {
                return res.data.data.paramDefinitions;
            }
        });
    }; 
}

export function updateDeviceData(dispatch, data) {
    const response = axios.put(API + "device?" +
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

export function addDevice(dispatch, data) {
    const response = axios.post(API + "device?" +
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

export function deleteDevice(dispatch, options) {
    const response = axios.delete(API + "device?" +
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

export function getAllDevices(dispatch, options) {
    const response = axios.get(API + "device?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                res.data.data.forEach(device => {
                    dispatch(updateDeviceDetails(device));
                });
                return res.data.data;
            }
        })
    }
}
