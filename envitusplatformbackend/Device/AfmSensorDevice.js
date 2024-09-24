var DeviceModule = require('./Device.js');

var UnitConverterModule = require('../Utils/UnitConverter.js');
var unitConverter = new UnitConverterModule.UnitConverter();

var StatisticsManagerModule = require('../Calc/StatisticsManager.js');
var statManager = new StatisticsManagerModule.StatisticsManager();

var WMAFilteringModule = require('../Utils/WMAFiltering.js');
var filteringWMA = new WMAFilteringModule.WMAFiltering();

var SensorLiveDataHandlerModule = require('../Device/SensorLiveDataHandler.js')
var sensorLiveDataHandler = new SensorLiveDataHandlerModule.SensorLiveDataHandler();

var GenUtilsModule = require('../Utils/GenUtils.js');
var genUtils = new GenUtilsModule.GenUtils();


function AfmSensorDevice() {

    this.paramDefinitions = null;

    this.parse = function (jsonObject) {
        this.parent.parse.call(this, jsonObject);
        this.paramDefinitions = this.getDefaultParamDefinitions();
        if (jsonObject.paramDefinitions != null) {

            for (var i = 0; i < this.paramDefinitions.length; i++) {

                for (var j = 0; j < jsonObject.paramDefinitions.length; j++) {
                    if (this.paramDefinitions[i].paramName == jsonObject.paramDefinitions[j].paramName) {

                        this.paramDefinitions[i].filteringMethod = jsonObject.paramDefinitions[j].filteringMethod;
                        this.paramDefinitions[i].filteringMethodDef = jsonObject.paramDefinitions[j].filteringMethodDef;
                        this.paramDefinitions[i].maxRanges = jsonObject.paramDefinitions[j].maxRanges;
                        if (this.paramDefinitions[i].maxRanges != null) {

                            if (this.paramDefinitions[i].maxRanges.min != null && !genUtils.isNumber(this.paramDefinitions[i].maxRanges.min)) {
                                this.paramDefinitions[i].maxRanges.min = null;
                            }
                            if (this.paramDefinitions[i].maxRanges.max != null && !genUtils.isNumber(this.paramDefinitions[i].maxRanges.max)) {
                                this.paramDefinitions[i].maxRanges.max = null;
                            }

                            if (this.paramDefinitions[i].maxRanges.max == null && this.paramDefinitions[i].maxRanges.min == null) {
                                this.paramDefinitions[i].maxRanges = null;
                            }


                        }

                        this.paramDefinitions[i].calibration = jsonObject.paramDefinitions[j].calibration;

                        break;
                    }
                }
            }
        }

    }

    var processCalibration = function (val, paramDefItem) {

        if (paramDefItem.calibration != null) {
            if (paramDefItem.calibration.type == "curve") {
                for (var i = 0; i < paramDefItem.calibration.data.length; i++) {

                    var calibItem = paramDefItem.calibration.data[i];
                    if (val >= Number(calibItem.min) && val <= Number(calibItem.max)) {
                        //val += calibItem.offset;

                        if (calibItem.funct == null || calibItem.funct == "translate") {
                            val = Number((val + Number(calibItem.offset)).toFixed(2));

                        }
                        else if (calibItem.funct == "scale") {
                            val = Number((val * Number(calibItem.offset)).toFixed(2));

                        }
                       

                        break;

                    }
                }
            }
        }
        return val;
    }
    this.ProcessSensorData = function (currentData, callBack) {
        console.log(currentData)
        var filterResult = {}
        var paramDefs = this.paramDefinitions;
        var i = 0;
        var myInstance = this;
        var filterFunc = function () {

            if (paramDefs[i] && paramDefs[i].paramName && (paramDefs[i].paramName === "AQI" || paramDefs[i].paramName === "prominentPollutant")) {
                i++;
                if (i < paramDefs.length) {
                    filterFunc();
                } else if(process.env.NEED_AQI === "true") {
                    // insert AQI derived param.
                    filterResult.rawAQI = Number((myInstance.findAQIFromLiveData(filterResult)).toFixed(2));
                    callBack(null, filterResult);
                } else {
                    callBack(null, filterResult);
                }
                return true;
            }

            filterResult[paramDefs[i].paramName] = currentData[paramDefs[i].paramName];

            // check if data is within limits, otherwise bound to limits.
            var boundValueToLimits = function (value) {
		console.log('valuebefore',value)
                if (paramDefs[i].maxRanges != null) {
                    if (paramDefs[i].maxRanges.max != null && value > paramDefs[i].maxRanges.max) {
                        value = paramDefs[i].maxRanges.max;

                    }
                    if (paramDefs[i].maxRanges.min != null && value < paramDefs[i].maxRanges.min) {
                        value = paramDefs[i].maxRanges.min;
                    }
			console.log('valueafter',value )
                }
                return value;
            }
            var originalVal = filterResult[paramDefs[i].paramName];
            filterResult[paramDefs[i].paramName] = processCalibration(boundValueToLimits(filterResult[paramDefs[i].paramName]), paramDefs[i]);

            if (paramDefs[i].filteringMethod == "WMAFilter") {

                sensorLiveDataHandler.getLiveData(myInstance.logicalDeviceId, 1, 0, null, null, function (err, sensorId, resultList) {
                    if (!err && resultList != null && resultList.length > 0) {
                        var result = resultList[0];
                        if (result.data != null && result.data[paramDefs[i].paramName] != null) {

                            filteringWMA.parse(paramDefs[i].filteringMethodDef);
                            var oldValue = boundValueToLimits(result.data[paramDefs[i].paramName]);
                            var newValue = processCalibration(originalVal, paramDefs[i]);;
                           

                            var res = filteringWMA.filter(oldValue, newValue);

                            filterResult[paramDefs[i].paramName] = Number((boundValueToLimits(res)).toFixed(2));
                            //                            filterResult[paramDefs[i].paramName] = processCalibration(boundValueToLimits(res), paramDefs[i]);
                        }

                    }

                    i++;
                    if (i < paramDefs.length) {
                        filterFunc();
                    } else if(process.env.NEED_AQI === "true") {
                        // insert AQI derived param.
                        filterResult.rawAQI = Number((myInstance.findAQIFromLiveData(filterResult)).toFixed(2));
                        callBack(null, filterResult);
                    } else {
                        callBack(null, filterResult);
                    }
                });
            }
            else {
                i++;
                if (i < paramDefs.length) {
                    filterFunc();
                } else if(process.env.NEED_AQI === "true") {
                    // insert AQI derived param.
                    filterResult.rawAQI = Number((myInstance.findAQIFromLiveData(filterResult)).toFixed(2));
                    callBack(null, filterResult);
                } else {
                    callBack(null, filterResult);
                }
            }

        }

        if (paramDefs != null && paramDefs.length > 0)
            filterFunc();
        else {
            callBack(1, null);
        }
    }
    this.isAQIApplicableForParamType = function (paramName) {

        paramName = paramName.toUpperCase();

        if (paramName == "PM2P5" || paramName == "PM10" || paramName == "SO2" || paramName == "NO2" ||
            paramName == "CO" || paramName == "O3" || paramName == "NH3" || paramName == "C6H6")
            return true;
        //need to add AsH3
        return false;

    }

    // definition for weighted moving average
    this.getFiltringMethodWMADefinition = function () {

    }

    //to change the logic
    this.findAQIFromLiveData = function (currentData) {

        var resAqi = -1;
        var statForPm2p5 = null;
        var statForPm10 = null;
        var count = 0;
        var aqiValue = -9999999999;

        var paramValueMap = {};

        for (paramName in currentData) {
            if (!this.isAQIApplicableForParamType(paramName))
                continue;

            var tempAvg = currentData[paramName];
            // get value ug /meter cube(m3)
            //var ugPerM3 = unitConverter.convertPPMtoUgM3(paramName.toUpperCase(), tempAvg, null, null);


            var aqiVal = unitConverter.convertUgM3ToAqi(paramName.toUpperCase(), tempAvg);
           
            paramValueMap[paramName.toUpperCase()] = aqiVal;
        }

        for (var pname in paramValueMap) {
            /*
            if (pname == "PM2P5")
                statForPm2p5 = paramValueMap[pname];

            if (pname == "PM10")
                statForPm10 = paramValueMap[pname];;
            */
            /* need to add C6H6 */

            if (pname == "PM2P5" || pname == "PM10" ||
                pname == "SO2" || pname == "NO2" || pname == "NH3"
                || pname == "AsH3" || pname == "CO" || pname == "O3"
            ) {
                if (paramValueMap[pname] != null) {
                    count++;

                    aqiValue = Math.max(aqiValue, paramValueMap[pname]);

                }
            }

        }
        /*old code
                if (count >= 3 && (statForPm2p5 != null || statForPm10 != null)) {
                    // enough parameter for aqi calc

                    resAqi = aqiValue;
                }
        
                return resAqi;
        */
        if (count >= 1) {
            // enough parameter for aqi calc


            resAqi = aqiValue;
        }

        return resAqi;
    }

    // This function updates any derived stats for the device.
    this.updateDerivedStats = function (dailyStats, collectionNamePrefix, date) {

        var statForPm2p5 = null;
        var statForPm10 = null;
        var count = 0;
        var aqiValue = -9999999999;

        var paramValueMap = {};

        for (var j = 0; j < dailyStats.length; j++) {
            if (!this.isAQIApplicableForParamType(dailyStats[j].paramName))
                continue;

            var tempAvg = dailyStats[j].statParams.sum / dailyStats[j].statParams.count;
            // get value ug /meter cube(m3)
            var ugPerM3 = unitConverter.convertPPMtoUgM3(dailyStats[j].paramName.toUpperCase(), tempAvg, null, null);

            var aqiVal = unitConverter.convertUgM3ToAqi(dailyStats[j].paramName.toUpperCase(), ugPerM3);
            
            paramValueMap[dailyStats[j].paramName.toUpperCase()] = aqiVal;
        }

        for (var pname in paramValueMap) {

            /*if (pname == "PM2P5")
                statForPm2p5 = paramValueMap[pname];

            if (pname == "PM10")
                statForPm10 = paramValueMap[pname];;

                need to add C6H6
*/

            if (pname == "PM2P5" || pname == "PM10" ||
                pname == "SO2" || pname == "NO2"
                || pname == "CO" || pname == "O3"
                || pname == "NH3"
            ) {
                count++;
                aqiValue = Math.max(aqiValue, paramValueMap[pname]);
            }

        }
        /*
                if (count >=3  && (statForPm2p5 != null || statForPm10 != null)) {
                    // enough parameter for aqi calc

                    statManager.updateDailyStats(collectionNamePrefix + "_daily", "AQI", aqiValue, date, this.timeZone, function (err) {
                        // ignore error.
                    });
                } */
        if (count >= 1) {
            // enough parameter for aqi calc

            statManager.updateDailyStats(collectionNamePrefix + "_daily", "AQI", aqiValue, date, this.timeZone, null, function (err) {
                // ignore error.
            });
        }
    }

}

AfmSensorDevice.prototype = new DeviceModule.Device();
AfmSensorDevice.prototype.constructor = AfmSensorDevice;
AfmSensorDevice.prototype.parent = DeviceModule.Device.prototype;


AfmSensorDevice.prototype.getDefaultParamDefinitions = function () {

    //PM2p5 PM10 temperature humidity presssure NO2 SO2  CO O3 noise uptime Validity CO2  radiation latitude longitude receivedTime
    var paramDefinitions = [
        {
            filteringMethod: filteringWMA.name,
            filteringMethodDef: filteringWMA.getParamDefClass(.8, .2),
            paramName: "temperature",
            displayName: "Temperature",
            displayNameHtml: "Temperature",
            unit: 'oC',
            unitDisplayHtml: '<sup>o</sup>C',
            isFilteringEnabled: false,
            isDisplayEnabled: true,
            displayImage: "temperature.png",
            isPrimary: false,
            needsLiveData: false,
            hasLimits: true,
            maxRanges: {
                min: -10,
                max: 60
            },
            limits: [
                {
                    max: 10,
                    color: "ffff00",
                    description: "Low"
                },
                {
                    min: 10,
                    max: 30,
                    color: "00ff00",
                    description: "Moderate"
                },
                {
                    min: 30,
                    color: "ff0000",
                    description: "High"
                }
            ]
        },

        {
            paramName: "pressure",
            displayName: "Pressure",
            displayNameHtml: "Pressure",
            unit: 'mb',
            unitDisplayHtml: 'mb',
            displayImage: "pressure.png",
            isDisplayEnabled: true,
            needsLiveData: false,
            isPrimary: false,
            valuePrecision: 2,
            maxRanges: {
                min: 540,
                max: 1100
            },
            limits: [
                {
                    max: 980,
                    color: "e4e9ed",
                    description: "Low"
                },
                {
                    min: 980,
                    max: 1050,
                    color: "00B050",
                    description: "Normal"
                },
                {
                    min: 1050,
                    color: "800000",
                    description: "High"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,

            paramName: "humidity",
            displayName: "Humidity",
            displayNameHtml: "Humidity",
            unit: '%RH',
            unitDisplayHtml: '%RH',
            isDisplayEnabled: true,
            needsLiveData: false,
            isPrimary: false,
            displayImage: "humidity.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 90
            },
            limits: [
                {
                    max: 25,
                    color: "00B050",
                    description: "Dry"
                },
                {
                    min: 25,
                    max: 60,
                    color: "92D050",
                    description: "Normal"
                },
                {
                    min: 60,
                    color: "FFFF00",
                    description: "Moist"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "noise",
            displayName: "Noise",
            displayNameHtml: "Noise",
            unit: 'dBA',
            unitDisplayHtml: 'dBA',
            isDisplayEnabled: true,
            needsLiveData: false,
            isPrimary: false,
            displayImage: "humidity.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 135
            },
            limits: [
                {
                    max: 40,
                    color: "00B050",
                    description: "Faint"
                },
                {
                    min: 41,
                    max: 80,
                    color: "92D050",
                    description: "Moderate"
                },
                {
                    min: 81,
                    max: 110,
                    color: "FFFF00",
                    description: "Loud"
                },
                {
                    min: 111,
                    max: 140,
                    color: "FF9A00",
                    description: "Pain"
                },
                {
                    min: 140,
                    color: "ff0000",
                    description: "Intolerable"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "rain",
            displayName: "Rain",
            displayNameHtml: "Rain",
            unit: 'mm',
            unitDisplayHtml: 'mm',
            isDisplayEnabled: true,
            needsLiveData: false,
            isPrimary: false,
            displayImage: "raingrey.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 999.8
            },
            limits: [
                {
                    max: 2.5,
                    color: "92D050",
                    description: "Light Rain"
                },
                {
                    min: 2.5,
                    max: 9.99,
                    color: "FFFF00",
                    description: "Moderate Rain"
                },
                {
                    min: 10,
                    max: 50,
                    color: "FF9A00",
                    description: "Heavy Rain"
                },
                {
                    min: 50,
                    color: "ff0000",
                    description: "Violent"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "PM10",
            displayName: "PM10",
            displayNameHtml: "PM<sub>10</sub>",
            unit: 'µg/m3',
            unitDisplayHtml: '&mu;g/m<sup>3</sup>',
            isDisplayEnabled: true,
            needsLiveData: true,
            isPrimary: false,
            displayImage: "param.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 450
            },
            limits: [
                {
                    max: 50,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 51,
                    max: 100,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 101,
                    max: 150,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 151,
                    max: 350,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 351,
                    max: 430,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 430,

                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "PM2p5",
            displayName: "PM2.5",
            displayNameHtml: "PM<sub>2.5</sub>",
            unit: 'µg/m3',
            unitDisplayHtml: '&mu;g/m<sup>3</sup>',
            isDisplayEnabled: true,
            needsLiveData: true,
            isPrimary: false,
            displayImage: "param.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 230
            },
            limits: [
                {
                    max: 30,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 31,
                    max: 60,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 61,
                    max: 90,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 91,
                    max: 120,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 121,
                    max: 250,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 250,

                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "PM1",
            displayName: "PM1",
            displayNameHtml: "PM<sub>1</sub>",
            unit: 'µg/m3',
            unitDisplayHtml: '&mu;g/m<sup>3</sup>',
            isDisplayEnabled: true,
            needsLiveData: true,
            isPrimary: false,
            displayImage: "param.png",
            valuePrecision: 2,
            maxRanges: {
                min: 0,
                max: 100
            },
            limits: [
                {
                    max: 30,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 31,
                    max: 60,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 61,
                    max: 90,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 91,
                    max: 120,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 121,
                    max: 250,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 250,

                    color: "800000",
                    description: "Severe"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "NH3",
            displayName: "NH3",
            displayNameHtml: "NH<sup>3</sup>",
            unit: 'PPM',
            unitDisplayHtml: 'PPM',
            needsLiveData: true,
            displayImage: "param.png",
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 50
            },
            limits: [
                {
                    max: 0.267,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 0.268,
                    max: 0.533,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 0.534,
                    max: 1.07,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 1.08,
                    max: 1.60,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 1.61,
                    max: 2.40,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 2.40,
                    color: "800000",
                    description: "Severe"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "O3",
            displayName: "O3",
            displayNameHtml: "O<sub>3</sub>",
            unit: 'ug/m3',
            unitDisplayHtml: 'ug/m3',
            needsLiveData: true,
            displayImage: "param.png",
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 1
            },
            limits: [
                {
                    max: 0.0237,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 0.0238,
                    max: 0.0473,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 0.0474,
                    max: 0.0795,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 0.0796,
                    max: 0.0984,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 0.0985,
                    max: 0.354,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 0.354,
                    color: "800000",
                    description: "Severe"
                }
            ]

        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "NO2",
            displayName: "NO2",
            displayNameHtml: "NO<sub>2</sub>",
            unit: 'ug/m3',
            unitDisplayHtml: 'ug/m3',
            needsLiveData: true,
            displayImage: "param.png",
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 10
            },
            limits: [
                {
                    max: 0.0212,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 0.0213,
                    max: 0.042,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 0.043,
                    max: 0.095,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 0.096,
                    max: 0.148,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 0.149,
                    max: 0.21,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 0.21,
                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "SO2",
            displayName: "SO2",
            displayNameHtml: "SO<sub>2</sub>",
            unit: 'ug/m3',
            unitDisplayHtml: 'ug/m3',
            displayImage: "param.png",
            needsLiveData: true,
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 10
            },
            limits: [
                {
                    max: 0.0142,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 0.0142,
                    max: 0.0284,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 0.0285,
                    max: 0.135,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 0.136,
                    max: 0.284,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 0.285,
                    max: 0.567,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 0.567,

                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "CO2",
            displayName: "CO2",
            displayNameHtml: "CO<sub>2</sub>",
            unit: 'PPM',
            unitDisplayHtml: 'PPM',
            displayImage: "param.png",
            needsLiveData: true,
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 5000
            },
            limits: [
                {
                    max: 350,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 351,
                    max: 1000,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 1001,
                    max: 2000,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 2001,
                    max: 5000,
                    color: "FF9A00",
                    description: "Poor"
                },
                {

                    max: 5000,
                    color: "FF0000",
                    description: "Very Poor"
                }
            ]
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "CO",
            displayName: "CO",
            displayNameHtml: "CO",
            unit: 'mg/m3',
            unitDisplayHtml: 'mg/m3',
            displayImage: "param.png",
            isFilteringEnabled: false,
            needsLiveData: true,
            isPrimary: false,
            filteringMethod: null,
            isDisplayEnabled: true,
            valuePrecision: 3,
            maxRanges: {
                min: 0,
                max: 500
            },
            limits: [
                {
                    max: 0.811,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 0.812,
                    max: 1.62,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 1.63,
                    max: 8.11,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 8.12,
                    max: 13.8,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 13.9,
                    max: 27.6,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 27.6,
                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        /*       {
                   filteringMethod: null,
                   filteringMethodDef: null,
                   paramName: "noise",
                   displayName: "Noise",
                   displayNameHtml: "Noise",
                   unit: "dB",
                   unitDisplayHtml: "dB",
                   displayImage: "param.png",
                   needsLiveData: false,
                   isDisplayEnabled: true,
                   isPrimary: false,
                   hasLimits: false,
                   maxRanges: {
                       min: 00,
                       max: 60
                   },
               },
      */
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "receivedTime",
            displayName: "receivedTime",
            displayNameHtml: "receivedTime",
            //unit : "hms",
            unit: '',
            unitDisplayHtml: '',

            displayImage: "param.png",
            needsLiveData: false,
            isDisplayEnabled: false,
            isPrimary: false,
            hasLimits: false
        },

        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "time",
            displayName: "Time",
            displayNameHtml: "Time",
            unit: '',
            unitDisplayHtml: '',
            displayImage: "param.png",
            needsLiveData: false,
            isDisplayEnabled: true,
            isPrimary: false,
            hasLimits: false
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "rawAQI",
            displayName: "Raw AQI",
            displayNameHtml: "Raw AQI",
            unit: '',
            unitDisplayHtml: '',
            displayImage: "param.png",
            needsLiveData: false,
            isDisplayEnabled: true,
            isPrimary: false,
            valuePrecision: 0,
            isDerivedParam: true,

            maxRanges: {
                min: 0,
                max: 500
            },
            limits: [
                {
                    max: 50,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 51,
                    max: 100,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 101,
                    max: 200,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 201,
                    max: 301,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 301,
                    max: 400,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 401,
                    //   max:500,
                    color: "800000",
                    description: "Severe"
                }
            ]
        },
        {
            filteringMethod: null,
            filteringMethodDef: null,
            paramName: "AQI",
            displayName: "AQI",
            displayNameHtml: "AQI",
            unit: '',
            unitDisplayHtml: '',
            displayImage: "param.png",
            needsLiveData: false,
            isDisplayEnabled: true,
            isPrimary: true,
            valuePrecision: 0,
            isDerivedParam: true,

            maxRanges: {
                min: 0,
                max: 500
            },
            limits: [
                {
                    max: 50,
                    color: "00B050",
                    description: "Good"
                },
                {
                    min: 51,
                    max: 100,
                    color: "92D050",
                    description: "Satisfactory"
                },
                {
                    min: 101,
                    max: 200,
                    color: "FFFF00",
                    description: "Moderate"
                },
                {
                    min: 201,
                    max: 301,
                    color: "FF9A00",
                    description: "Poor"
                },
                {
                    min: 301,
                    max: 400,
                    color: "FF0000",
                    description: "Very Poor"
                },
                {
                    min: 401,
                    //   max:500,
                    color: "800000",
                    description: "Severe"
                }
            ]
        }
    ]

    return paramDefinitions;
}

// export the class
module.exports =
    {
        AfmSensorDevice
    };
