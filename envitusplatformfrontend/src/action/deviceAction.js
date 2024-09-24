export const updateDeviceCount = (count) => {
    return {
        type: 'UPDATE_DEVICE_COUNT',
        payload: count
    };
};

export const updateDeviceDetails = (details) => {
    return {
        type: 'UPDATE_DEVICE_DETAILS',
        payload: details
    };
};

export const updateSelectedDevice = (deviceId) => {
    return {
        type: 'UPDATE_SELECTED_DEVICE',
        payload: deviceId
    };
};
