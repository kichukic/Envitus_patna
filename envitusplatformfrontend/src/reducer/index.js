import userReducer from './userReducer';
import deviceReducer from './deviceReducer';
import liveDataReducer from './liveDataReducer';
import formReducer from './formReducer';
import alarmReducer from './alarmReducer';
import thirdPartyUserReducer from './thirdPartyUserReducer';
import {combineReducers} from 'redux';
import {reducer as toastrReducer} from 'react-redux-toastr'

export const reducers = combineReducers({
    user: userReducer,
    devices: deviceReducer,
    formData: formReducer,
    liveData: liveDataReducer,
    alarmData: alarmReducer,
    thirdPartyUser: thirdPartyUserReducer,
    toastr: toastrReducer
});
