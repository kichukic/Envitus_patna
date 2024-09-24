const fakeData = {showWarning : true};

export function authUser(dispatch, loginDetails) {
    const response = await new Promise ((resolve) => {
        resolve(fakeData);
    });
}