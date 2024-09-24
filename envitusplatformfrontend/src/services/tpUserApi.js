import { updateThirdPartyUserDetails } from '../action/thirdPartyUserAction';

const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function getAllTpUsers(dispatch, options) {
    const response = axios.get(API + "thirdpartyuser?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                res.data.data.forEach(user => {
                    dispatch(updateThirdPartyUserDetails(user));
                });
                return res.data.data;
            }
        })
    }
}

export function addTpUser(dispatch, data) {
    const response = axios.post(API + "thirdpartyuser?" +
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

export function deleteTpUser(dispatch, options) {
    const response = axios.delete(API + "thirdpartyuser?" +
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

export function updateTpUser(dispatch, data) {
    const response = axios.put(API + "thirdpartyuser?" +
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

export function getTpUserCount(dispatch, options) {
    const response = axios.get(API + "thirdpartyuser/count?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data.ThirdPartyUserCount;
            }
        })
    }
}
