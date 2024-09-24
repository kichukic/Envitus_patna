import { login, logout, updateUserDetails } from '../action/userAction';

const axios = require('axios');
const API = process.env.REACT_APP_API_BASE_URL;
const urlParam = {};

export function authUser(dispatch, loginDetails) {

    const response = axios.post(API + "login?" + new URLSearchParams(loginDetails));

    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === "ok") {

                dispatch(login());
                sessionStorage.setItem("isLoggedIn", true);
                sessionStorage.setItem("token", res.data.data.token);
                sessionStorage.setItem("whoami", loginDetails.userName);
                sessionStorage.setItem("ngStorage-loggedIn", true);
                sessionStorage.setItem("ngStorage-userName", '"' + loginDetails.userName + '"');
                return true;
            }
            return false;
        });
    };
}

export function authOneLoginUser(dispatch) {

    const response = axios.get(API + "login/sso");
    return () => {
        return response.then((res) => {
            if (res && res.data.status === "ok") {
                dispatch(login());
                sessionStorage.setItem("isLoggedIn", true);
                sessionStorage.setItem("token", res.data.data.token);
                sessionStorage.setItem("whoami", res.data.data.userId);
                sessionStorage.setItem("ngStorage-loggedIn", true);
                sessionStorage.setItem("ngStorage-userName", '"' + res.data.data.userId + '"');
                return true;
            }
            return false;
        });
    };
}

export function getUserRole(dispatch, uname) {
    const response = axios.post(API + "loginprivilegehide?" + new URLSearchParams({ 0: uname }));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data;
            }
        })
    }
}

export function logOut(dispatch) {
    return () => {
        dispatch(logout());
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("whoami");
        sessionStorage.removeItem("ngStorage-loggedIn");
        return true;
    };
}

export function getAllUsers(dispatch, options) {
    const response = axios.get(API + "user?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                res.data.data.forEach(user => {
                    dispatch(updateUserDetails(user));
                });
                return res.data.data;
            }
        })
    }
}

export function addUser(dispatch, data) {
    const response = axios.post(API + "user?" +
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

export function regUser(dispatch, data) {
    const response = axios.post(API + "user/register?" +
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

export function deleteUser(dispatch, options) {
    const response = axios.delete(API + "user?" +
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

export function updateUser(dispatch, data) {
    const response = axios.put(API + "user?" +
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

export function getUserCount(dispatch, options) {
    const response = axios.get(API + "user/count?" + new URLSearchParams(Object.assign(urlParam, options)));
    return () => {
        return response.then((res) => {
            if (res.data && res.data.status === 'ok') {
                return res.data.data.userCount;
            }
        })
    }
}
