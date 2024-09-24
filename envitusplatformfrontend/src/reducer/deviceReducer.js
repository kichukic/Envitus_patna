const deviceReducer = (state = {data: {}}, action) => {
    const newState = {...state};
    switch (action.type) {
    case 'UPDATE_DEVICE_COUNT':
        newState.deviceCount = action.payload;
        break;
    case 'UPDATE_DEVICE_DETAILS':
        newState.data = {...newState.data, ...{[action.payload.deviceId]: action.payload}};
        break;
    case 'UPDATE_SELECTED_DEVICE':
        newState.selectedDevice = action.payload;
        break;
    default:
        break;
    }
    
    return newState;
};

export default deviceReducer;
