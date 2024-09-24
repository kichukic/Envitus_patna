const alarmReducer = (state = { data: {} }, action) => {
    const newState = { ...state };
    switch (action.type) {
    case 'UPDATE_ALARMRULE_DETAILS':
        newState.data= action.payload;
        break;
    default:
        break;
    }
    return newState;
};

export default alarmReducer;
