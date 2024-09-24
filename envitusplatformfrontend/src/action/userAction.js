export const login = () => {
    return {
        type: 'LOGIN'
    };
};

export const logout = () => {
    return {
        type: 'LOGOUT'
    };
};

export const userPrivilegeRole = (role) => {
    return {
        type: 'USER_PRIVILEGE_ROLE',
        payload: role
    }
}

export const updateUserDetails = (details) => {
    return {
        type: 'UPDATE_USER_DETAILS',
        payload: details
    };
};
