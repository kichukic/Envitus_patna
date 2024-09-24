export const deviceFormData = {
    deviceId: "",
    type: "",
    devFamily: "",
    subType: "",
    timeZone: "",
    registerFrom: null,
    registerTo: null,
    customerName: "",
    lotNo: "",
    serialNo: "",
    grade: "",
    deployment: "",
    location: {
        locId: "",
        city: "",
        zone: "",
        landMark: "",
        latitude: "",
        longitude: "",
        building: "",
        floor: "",
        slot: "",
        dataPosition: "",
        dataNormal:""
    },
    activated: "",
    creationLog: "",
    deactLog: "",
    latestAQI: "",
    nearTimeStatus: "",
    lastDataReceiveTime: "",
    paramDefinitions: []
};

export const deviceTypes = ["Sensor"];
export const deviceFamily =  process.env.REACT_APP_DEVICE_FAMILY.split(",") || ["Air", "Water", "Flood"];
export const deviceSubTypes = process.env.REACT_APP_DEVICE_SUBTYPE.split(",") || ["ESBHA001"];
export const deviceGrade = ["Consumer", "Industrial"];
export const deviceDeployment = ["Indoor", "Outdoor"];
export const deviceFilter = ["WMAFilter"];
export const deviceCalbFunc = ["translate", "scale"];

export const deviceFrmValRgex = {
    deviceId: /^[A-Za-z0-9.-_]{3,20}$/,
    customerName: /^[A-Za-z ]{3,20}$/,
    serialNo: /^[A-Za-z0-9.-_ ]{1,20}$/,
    lotNo: /^[0-9]{1,20}$/,
    location: {
        locId: /^[A-Za-z0-9]{3,20}$/,
        city: /^[A-Za-z ]{3,20}$/,
        zone: /^[A-Za-z ]{3,20}$/,
        landMark: /^[A-Za-z ]{3,20}$/,
        latitude: /^[+-]?[0-9.]{1,20}$/,
        longitude: /^[+-]?[0-9.-]{1,20}$/,
        slot: /^[A-Za-z0-9]{3,20}$/,
        dataPosition: /^[ 0-9.-]{3,20}$/,
        dataNormal: /^[ 0-9.-]{3,20}$/
    }
};

export const deviceFrmValSts = {
    deviceId: false,
    customerName: false,
    serialNo: false,
    lotNo: false,
    location: {
        locId: false,
        city: false,
        zone: false,
        landMark: false,
        latitude: false,
        longitude: false,
        slot: false,
        dataPosition: false,
        dataNormal: false
    }
};

export const calibrationValues = {
    min: "",
    max: "",
    offset: "",
    funct: ""
};

export const privilegeArray = {

}
export const superAdmin = [true, true, true, true, true];
export const admin = [true, true, true, false, true];
export const supervisor = [false, true, true, false, false];
export const operator = [false, true, false, false, false];
//1 = alarm manage
//2 = active alarm
//3 = device admin
//4 = third party user
//5 = user management 

export const userFormData = {
    name: "",
    role: "",
    email: "",
    contact: "",
    userName: "",
    password: "",
    activated: "",
    creationLog: "",
    deactLog: "",
    devices: ""
};

export const userFrmValRgex = {
    name: /^[A-Za-z ]{3,20}$/,
    contact: /^[0-9]{10,12}$/,
    userName: /^[A-Za-z0-9]{3,20}$/,
    password: /^(?=.*[0-9])(?=.*[a-zA-Z])([A-Za-z0-9]){8,16}$/,
};

export const userFrmValSts = {
    name: false,
    contact: false,
    userName: false,
    password: false,
};

const userRoleObject = process.env.REACT_APP_USER_ROLE.split(", ").map((user) => JSON.parse(user))
export const userRoles =  userRoleObject || [{label: "Administrator", value: "Administrator"},
    {label: "Supervisor", value: "Supervisor"}, {label: "Operator", value: "Operator"}
]

export const tpUserFormData = {
    name: "",
    limit: "",
    activated: "",
    creationLog: "",
    deactLog: "",
};

export const tpUserFrmValRgex = {
    name: /^[A-Za-z ]{3,20}$/,
    limit: /^[0-9]{1,15}$/,
};

export const tpUserFrmValSts = {
    name: false,
    limit: false,
};

export const chartColors = process.env.REACT_APP_CHART_COLOR.split(",") || ["#89fc00", "#008bf8", "#dc0073", "#f5b700"];

export const alarmruleFormData = {
    ruleName: "",
    type: "",
    clearingMode: "",
    timeInterval: "",
    message: "",
    info: {
        devType: "",
        paramDefs: {},
        deviceIds: [],
    },
};

export const alarmruleFrmValRgex = {
    ruleName: /^[A-Za-z0-9]{3,20}$/,
    timeInterval: /^[0-9]{1,20}$/,
    message: /^[A-Za-z0-9.-_ ]{3,50}$/,
};

export const alarmruleFrmValSts = {
    ruleName: false,
    timeInterval: false,
    message: false,
};

export const alarmruleClearingMode = [{display: "Time Based", value: "Time"},
    {display: "Manual", value: "Manual"}
]
