const thirdPartyUserReducer = (state = { data: {} }, action) => {
    const newState = { ...state };
    switch (action.type) {
    case 'UPDATE_THIRDPARTYUSER_DETAILS':
        newState.data = {...newState.data, ...{[action.payload.name]: action.payload}};
        break;
    default:
        break;
    }
    return newState;
};

export default thirdPartyUserReducer;
