import axios from 'axios';
import { logout } from '../action/userAction';

export default {
    setupInterceptors: (store) => {
        axios.interceptors.request.use(
            config => {
                const token = sessionStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = 'Bearer ' + token;
                }
                config.headers['Content-Type'] = 'application/json';
                return config;
            },
            error => {
                Promise.reject(error)
            }
        );

        axios.interceptors.response.use(
            response => {
                if (response.data.errorCode === -10) {
                    store.dispatch(logout());
                    sessionStorage.removeItem("isLoggedIn");
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("ngStorage-loggedIn");
                }
                return response;
            },
            error => {
                Promise.reject(error)
            }
        );
    }
};
