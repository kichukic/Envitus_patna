function Device() {

    this.logicalDeviceId = null;
    this.deviceId = 0;
    this.type = null;
    this.devFamily = null;
    this.subType = null;
    this.registerFrom = null;
    this.registerTo = null;
    this.customerName = null;
    this.lotNo = null;
    this.serialNo = null;
    this.grade = null;
    this.deployment = null;
    this.location = null;
    this.timeZone = null;
    this.activated = null;
    this.creationLog = null;
    this.deactLog = null;
    this.latestAQI = null;
    this.nearTimeStatus = null;
    this.lastDataReceiveTime = null;

    this.toJson = function () {
        return JSON.stringify(this);
    }

}

Device.prototype.toJson = function () {
    return JSON.stringify(this);
}

Device.prototype.parse = function (deviceDetails) {
    this.deviceId = deviceDetails.deviceId;
    if (deviceDetails.logicalDeviceId == null) {
        this.logicalDeviceId = deviceDetails.deviceId + "_L";
    }
    else
    {
        this.logicalDeviceId = deviceDetails.logicalDeviceId;
    }
    this.type = deviceDetails.type;
    this.devFamily = deviceDetails.devFamily;
    this.subType = deviceDetails.subType;
    this.registerFrom = deviceDetails.registerFrom;
    this.registerTo = deviceDetails.registerTo;
    this.timeZone = deviceDetails.timeZone;
    this.customerName = deviceDetails.customerName;
    this.lotNo = deviceDetails.lotNo;
    this.serialNo = deviceDetails.serialNo;
    this.grade = deviceDetails.grade;
    this.deployment = deviceDetails.deployment;
    this.location = deviceDetails.location;
    this.description = deviceDetails.description;
    this.activated = deviceDetails.activated;
    this.creationLog = deviceDetails.creationLog;
    this.deactLog = deviceDetails.deactLog;
    this.latestAQI = deviceDetails.latestAQI;
    this.nearTimeStatus = deviceDetails.nearTimeStatus;
    this.lastDataReceiveTime = deviceDetails.lastDataReceiveTime;
}


// export the class
module.exports =
 {
     Device
 };
