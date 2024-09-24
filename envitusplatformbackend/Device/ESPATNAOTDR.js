var AfmSensorDeviceModule = require('./AfmSensorDevice.js');

var ESPATNAOTDRSpecModule = require('../DeviceSpec/ESPATNAOTDRSpec.js')

function ESPATNAOTDR() {
    this.getDefaultParamDefinitions = function () {

        var specModule = new  ESPATNAOTDRSpecModule.ESPATNAOTDRSpec();
        var temp = specModule.getParamDefinitions();
        var newParamList = [


            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "latitude",
            },
            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "longitude",
            },
            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "er_init_sensor",
                displayName: 'Initialization Error',
                paramType: 'error',
            },
            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "er_read_sensor",
                displayName: 'Read Error',
                paramType: 'error',
            },
            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "er_data_range",
                displayName: 'Data Error',
                paramType: 'error',
            },
            {
                filteringMethod: null,
                filteringMethodDef: null,
                paramName: "er_system",
                displayName: 'System Error',
                paramType: 'error',
            }

        ];

        for (var i = 0; i < newParamList.length; i++) {
            temp.push(newParamList[i]);
        }
        return temp;
    }
}

ESPATNAOTDR.prototype = new AfmSensorDeviceModule.AfmSensorDevice();
ESPATNAOTDR.prototype.constructor = ESPATNAOTDR;
ESPATNAOTDR.prototype.parent = AfmSensorDeviceModule.AfmSensorDevice.prototype;


// export the class
module.exports =
{
    ESPATNAOTDR
};
