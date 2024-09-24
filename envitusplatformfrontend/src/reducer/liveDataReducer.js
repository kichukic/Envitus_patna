const liveDataReducer = (state = {dashBoard: {}}, action) => {
    const newState = {...state};
    switch (action.type) {
    case 'UPDATE_DASHBOARD_DATA':
        newState.dashBoard = action.payload;
        break;
    default:
        break;
    }
    
    return newState;
};

export default liveDataReducer;
