const userReducer = (state = { isLoggedIn: false, userPrivilegeRole: '', data: {} }, action) => {
    const newState = { ...state };
    switch (action.type) {
    case 'LOGIN':
        newState.isLoggedIn = true;
        break;
    case 'LOGOUT':
        newState.isLoggedIn = false;
        break;
    case 'USER_PRIVILEGE_ROLE':
        newState.userPrivilegeRole = action.payload;
        break;
    case 'UPDATE_USER_DETAILS':
        newState.data = {...newState.data, ...{[action.payload.userName]: action.payload}};
        break;
    default:
        break;
    }
    return newState;
};

export default userReducer;
