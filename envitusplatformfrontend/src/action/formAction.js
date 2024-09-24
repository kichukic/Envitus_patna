export const intialaizeForm = (data) => {
    return {
        type: 'INTIALIZE_FORM',
        payload: data
    };
};

export const updateFormValue = (data) => {
    return {
        type: 'UPDATE_VALUE',
        payload: data
    };
};

export const updateFormValidation = (data) => {
    return {
        type: 'UPDATE_VALIDATION',
        payload: data
    };
};
