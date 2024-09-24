var ESPATNAOTDRModule = require('./ESPATNAOTDR.js');

function DeviceFactory() {

    this.createDeviceInstanceFromSubType = function (subType) {
        var result = null;
        result = new ESPATNAOTDRModule.ESPATNAOTDR();
        return result;

    }

}

// export the class
module.exports =
{
    DeviceFactory
}