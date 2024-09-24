const liveDataReducer = (state = {}, action) => {
    let newState = {...state};
    switch (action.type) {
    case 'INTIALIZE_FORM':
        newState = {...action.payload};
        newState.isFormValid = true;
        break;
    case 'UPDATE_VALUE':
        newState = {...newState, data: { ...newState.data, ...action.payload}}
        break;
    case 'UPDATE_VALIDATION':
        newState = {...newState, deviceFrmValSts: { ...newState.deviceFrmValSts, ...action.payload}}
        break;
    default:
        break;
    }
    
    return newState;
};

export default liveDataReducer;
