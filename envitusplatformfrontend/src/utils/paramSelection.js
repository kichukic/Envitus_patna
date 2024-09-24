import { GiMailbox } from "react-icons/gi";
import { MdMarkunreadMailbox, MdSignalCellular0Bar, MdSignalCellular1Bar, 
    MdSignalCellular2Bar, MdSignalCellular3Bar, MdSignalCellular4Bar} from "react-icons/md";
import { FaBatteryQuarter, FaBatteryHalf, FaBatteryThreeQuarters, FaBatteryFull } from "react-icons/fa";
import React from 'react';

export const getParamDets = (deviceData, excludeElem) => {
    const params = {paramName: []};
    deviceData.paramDefinitions.forEach(param => {
        if(param.isDisplayEnabled && !(excludeElem.includes(param.paramName))) {
            params.paramName.push(param.paramName);
        }
    })
    return params;
}

export const getDisplayName = (selectedDeviceData, excludeElements, needUnit) => {
    const displayNameArray = ['Device']; const displayParamNameArray = ['Device'];
    const paramLimitArray = ['Device']; const needSpecific = []
    selectedDeviceData.paramDefinitions.forEach(param => {
        if(param.isDisplayEnabled && !(excludeElements.includes(param.paramName))) {
            const dpName = (needUnit) ? (param.displayName + ' ' + param.unit) : (param.displayName);
            displayNameArray.push(dpName);
            displayParamNameArray.push(param.paramName);
            paramLimitArray.push(param.limits);
            needSpecific.push(Boolean(param.needSpecific));
        }
    });
    const displayNamesObject = {
        displayNameArray: displayNameArray,
        displayParamNameArray: displayParamNameArray,
        paramLimitArray: paramLimitArray,
        needSpecific: needSpecific
    }
    return displayNamesObject;
};

export const getDisplayValue = (rawDataValue, selectedDeviceData, excludeElements) => {
    const displayValueArray = [];
    rawDataValue.forEach(element => {
        const content = [element.logicalDeviceId];
        selectedDeviceData.paramDefinitions.forEach(param => {
            if(param.isDisplayEnabled && param.valueType !== 'string' && !(excludeElements.includes(param.displayName))) {
                if(param.paramName === 'receivedTime') {
                    content.push(new Date(element.data[param.paramName]).toLocaleString());
                } else{
                    const paramVal = (element.data[param.paramName] !== null) ? ((typeof(element.data[param.paramName]) !== 'number') ?
                        (element.data[param.paramName]) : (element.data[param.paramName]).toFixed(param.valuePrecision)) : 'NULL'
                    content.push(paramVal);
                }
            }
        })
        displayValueArray.push(content);
    });
    return displayValueArray;
}

export const getParamDefint = (selectedDeviceData, paramName) => {
    return selectedDeviceData.paramDefinitions.find(param => {
        return param.paramName === paramName;
    })
}

export const getDisplayNameAndValue = (rawDataValue, selectedDeviceData, excludeElements) => {
    const displayNamesObject = getDisplayName(selectedDeviceData, excludeElements, true);
    const displayValueArray = getDisplayValue(rawDataValue, selectedDeviceData, excludeElements);

    const displayObject = {
        displayNamesObject: displayNamesObject,
        displayValueArray: displayValueArray
    }
    return displayObject;
}

export const getFirstDisplayParamName = (selectedDeviceData, excludeElements) => {
    let paramIndex = -1;
    let firstParamName;
    const param = selectedDeviceData.paramDefinitions;

    do {
        paramIndex++;
        firstParamName = param[paramIndex].paramName;
    } while(!(param[paramIndex].isDisplayEnabled && !(excludeElements.includes(param[paramIndex].displayName))))

    return firstParamName;
}

export const getParamValueLimitIndex = (limits, value) => {
    if (limits != null && limits.length > 0 && value != null) {
        for (let i = 0; i < limits.length; i++) {
            if (limits[i].min != null && limits[i].max != null && value > limits[i].min && value <= limits[i].max)
            {return i;}
            if (limits[i].min != null && limits[i].max == null && value > limits[i].min)
            {return i;}
            if (limits[i].min == null && limits[i].max != null && value <= limits[i].max)
            {return i;}
        }
    }
    return -1;
}

export const getParamIcon = (iconName, value) => {
    switch (iconName) {
    case "filledMailBox":
        return <GiMailbox className="paramIcon" />
    case "emptyMailBox":
        return <MdMarkunreadMailbox className="paramIcon" />
    case "signal":
        switch (value) {
        case 0:
            return <MdSignalCellular0Bar className="paramIcon" />
        case 1:
            return <MdSignalCellular1Bar className="paramIcon" />
        case 2:
            return <MdSignalCellular2Bar className="paramIcon" />
        case 3:
            return <MdSignalCellular3Bar className="paramIcon" />
        case 4:
            return <MdSignalCellular4Bar className="paramIcon" />
        default:
            return <MdSignalCellular4Bar className="paramIcon" />
        }
    case "battery":
        switch (value) {
        case 0:
            return <FaBatteryQuarter className="paramIcon" />
        case 1:
            return <FaBatteryHalf className="paramIcon" />
        case 2:
            return <FaBatteryThreeQuarters className="paramIcon" />
        case 3:
            return <FaBatteryFull className="paramIcon" />
        default:
            return <FaBatteryHalf className="paramIcon" />
        }
    default:
        return "";
    }
}

export const getParams = (deviceData) => {
    const filteredParams = [];
    deviceData.paramDefinitions.forEach(param => {
        if((param.isDisplayEnabled || param.isDerived) && param.paramName !== "time") {
            filteredParams.push(param.paramName);
        }
    });
    return {count: filteredParams.length, params: filteredParams.join()}
}
