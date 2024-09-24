var deviceModule = require('./Device.js');
var sensorModule = require('./AfmSensorDevice.js') // New Code

var DatabaseHandlerModule = require('../DatabaseHandler.js');
var dbInstance = new DatabaseHandlerModule.DatabaseHandler();

var DeviceManagerModule = require('../Device/DeviceManager.js');
var deviceManager = new DeviceManagerModule.DeviceManager();

var StatisticsManagerModule = require('../Calc/StatisticsManager.js');
var statManager = new StatisticsManagerModule.StatisticsManager();

var DateUtilsModule = require('../Utils/DateUtils.js');
var dateUtils = new DateUtilsModule.DateUtils();

var DeviceFactoryModule = require('./DeviceFactory.js');
var devFactory = new DeviceFactoryModule.DeviceFactory();
var fs = require("fs")

var UnitConverterModule = require('../Utils/UnitConverter.js');
var unitConverter = new UnitConverterModule.UnitConverter();

var trinity = require('../Utils/TrinityPush.js');

var SensorLiveDataHandlerModule = require('../Device/SensorLiveDataHandler.js')
var sensorLiveDataHandler = new SensorLiveDataHandlerModule.SensorLiveDataHandler();
var request = require('request');
var _ = require('lodash');
const moment = require('moment');
const { resolve } = require('path');

function SensorManager() {
    var myInstance = this;

    this.incomingDataQueue = [];


    this.getReceivedTimeQueryJson = function (timeStart, timeEnd) {
        var res = null;
        if (timeStart != null && timeEnd != null) {
            res = [
                { "data.receivedTime": { $gte: parseInt(timeStart) } },
                { "data.receivedTime": { $lte: parseInt(timeEnd) } }
            ]
        }
        else if (timeStart != null) {
            res = [
                { "data.receivedTime": { $gte: parseInt(timeStart) } }
            ]
        }
        else if (timeEnd != null) {
            res = [
                { "data.receivedTime": { $lte: parseInt(timeEnd) } }
            ]
        }

        return res;

    }


    this.getLiveDataFromDeviceId = function (sensorId, limit, offset, timeStart, timeEnd, callBack) {

        deviceManager.getDeviceFromId(sensorId, function (device) {

            if (device != null) {
                sensorLiveDataHandler.getLiveData(device.logicalDeviceId, limit, offset, timeStart, timeEnd, function (err, sensorIdLogical, value) {
                    callBack(err, sensorId, value);
                });

            }
            else
                callBack(1, sensorId, null);
        });



    };


    // timeStart and timeEnd are nunmbers (for epoch values).
    this.getLiveData = function (sensorIdLogical, limit, offset, timeStart, timeEnd, callBack) {
        //deviceManager.getDeviceFromId(sensorId, function (device) {

        // if (device!= null)
        {
            sensorLiveDataHandler.getLiveData(sensorIdLogical, limit, offset, timeStart, timeEnd, callBack);

        }

    };


    this.getLiveDataCountFromDeviceId = function (deviceId, timeStart, timeEnd, callBack) {

        var myInstance = this;

        deviceManager.getDeviceFromId(deviceId, function (device) {
            if (device != null) {
                var logicalSensorId = device.logicalDeviceId;
                var collectionName = logicalSensorId;
                var timeCond = myInstance.getReceivedTimeQueryJson(timeStart, timeEnd);

                var deviceQuery =
                {
                    logicalDeviceId: logicalSensorId,
                    $and: myInstance.getReceivedTimeQueryJson(timeStart, timeEnd)
                };
                if (timeCond == null) {
                    delete deviceQuery.$and;
                }


                var excludeFields = { '_id': false, 'deviceId': false };

                dbInstance.getDocumentCountByCriteria(collectionName, deviceQuery, function (err, result) {

                    if (err) {
                        callBack(1, deviceId, null);
                    }
                    else {
                        callBack(null, deviceId, result);
                    }

                });

                return;

            }
            else
                callBack(1, deviceId, null);
        });

    };


    this.getLiveDataCount = function (logicalSensorId, timeStart, timeEnd, callBack) {


        var deviceId = logicalSensorId;
        var myInstance = this;
        // deviceManager.getDeviceFromId(deviceId, function (device) {
        // if (device != null)
        {
            //   if (device != null && device.devFamily) 
            {
                var collectionName = logicalSensorId;

                var timeCond = myInstance.getReceivedTimeQueryJson(timeStart, timeEnd);

                var deviceQuery =
                {
                    logicalDeviceId: logicalSensorId,
                    $and: myInstance.getReceivedTimeQueryJson(timeStart, timeEnd)
                };
                if (timeCond == null) {
                    delete deviceQuery.$and;
                }


                var excludeFields = { '_id': false, 'deviceId': false };

                dbInstance.getDocumentCountByCriteria(collectionName, deviceQuery, function (err, result) {

                    if (err) {
                        callBack(1, logicalSensorId, null);
                    }
                    else {
                        callBack(null, logicalSensorId, result);
                    }

                });

                return;
            }
        }
        callBack(1, logicalSensorId, null);
        //});

    };

    this.updateStatistics = function (date, collectionNamePrefix, dataObj, device, cb) {
        var paramNameList = [];
        for (var propFieldItem in dataObj) {
            if (propFieldItem !== 'GPS') { paramNameList.push(propFieldItem) }
        }

        var k = 0;
        var updateStatItem = function () {


            var propField = paramNameList[k];
            statManager.updateHourlyStats(collectionNamePrefix + "_hourly", propField, dataObj[propField], date, dataObj, function (err) {
                statManager.updateDailyStats(collectionNamePrefix + "_daily", propField, dataObj[propField], date, device.timeZone, dataObj, function (err) {
                    // ignore error.
                    statManager.updateMonthlyStats(collectionNamePrefix + "_monthly", propField, dataObj[propField], date, device.timeZone, dataObj, function (err) {
                        // ignore error.
                        statManager.updateYearlyStats(collectionNamePrefix + "_yearly", propField, dataObj[propField], date, device.timeZone, dataObj, function (err) {
                            // ignore error.
                            k++;
                            if (k < paramNameList.length) {

                                updateStatItem();
                            }
                            else {
                                cb();
                            }
                        });


                    });
                });
            });
        }

        if (k < paramNameList.length)
            updateStatItem();
        else
            cb();

    }


    this.updateDerivedParams = function (date, collectionNamePrefix, dataObj, device) {

        var specificDevice = devFactory.createDeviceInstanceFromSubType(device.subType);
        specificDevice.parse(device);

        if (device.subType == "AFMEthernet") {
            // AQI calculation is needed and is baed on daily statistics.

            var currentDate = dateUtils.convertDateToTimeZone(date, device.timeZone);

            this.getSensorStats(device.deviceId, null, currentDate.valueOf(), currentDate.valueOf(), false, true, false, false, 100, 0, function (err, res) {
                if (!err && res.dailyStat != null) {

                    specificDevice.updateDerivedStats(res.dailyStat, collectionNamePrefix, date);
                }
            });
        }
    }


    this.getSensorStats = function (deviceId, paramList, timeFrom, timeTo, includeHourly, includeDaily, includeMonthly, includeYearly, numberOfRecords, offset, callBack) {


        var result = {};

        var funcs = [];
        var funcsStatTimePeriodArg = [];
        if (includeHourly) {
            funcs.push(this.getSensorStatsInfo);
            funcsStatTimePeriodArg.push("_hourly")
        }
        if (includeDaily) {
            funcs.push(this.getSensorStatsInfo);
            funcsStatTimePeriodArg.push("_daily")
        }
        if (includeMonthly) {
            funcs.push(this.getSensorStatsInfo);
            funcsStatTimePeriodArg.push("_monthly")
        }
        if (includeYearly) {
            funcs.push(this.getSensorStatsInfo);
            funcsStatTimePeriodArg.push("_yearly")

        }
        var i = 0;
        if (funcs.length > 0) {
            var resCallBack = function (err, res) {

                if (!err) {
                    if (funcsStatTimePeriodArg[i] == "_hourly")
                        result.hourlyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_daily")
                        result.dailyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_monthly")
                        result.monthlyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_yearly")
                        result.yearlyStat = res;
                }

                i++;
                if (i < funcs.length) {

                    funcs[i](deviceId, paramList, timeFrom, timeTo, numberOfRecords, offset, funcsStatTimePeriodArg[i], resCallBack);
                }
                else {


                    callBack(null, result);
                }
            }

            funcs[i](deviceId, paramList, timeFrom, timeTo, numberOfRecords, offset, funcsStatTimePeriodArg[i], resCallBack);
        }

    }



    this.getSensorStatsCount = function (deviceId, paramList, timeFrom, timeTo, includeHourly, includeDaily, includeMonthly, includeYearly, callBack) {


        var result = {};

        var funcs = [];
        var funcsStatTimePeriodArg = [];
        if (includeHourly) {
            funcs.push(this.getSensorStatsInfoCount);
            funcsStatTimePeriodArg.push("_hourly")
        }
        if (includeDaily) {
            funcs.push(this.getSensorStatsInfoCount);
            funcsStatTimePeriodArg.push("_daily")
        }
        if (includeMonthly) {
            funcs.push(this.getSensorStatsInfoCount);
            funcsStatTimePeriodArg.push("_monthly")
        }
        if (includeYearly) {
            funcs.push(this.getSensorStatsInfoCount);
            funcsStatTimePeriodArg.push("_yearly")

        }
        var i = 0;
        if (funcs.length > 0) {
            var resCallBack = function (err, res) {

                if (!err) {
                    if (funcsStatTimePeriodArg[i] == "_hourly")
                        result.hourlyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_daily")
                        result.dailyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_monthly")
                        result.monthlyStat = res;
                    if (funcsStatTimePeriodArg[i] == "_yearly")
                        result.yearlyStat = res;
                }

                i++;
                if (i < funcs.length) {

                    funcs[i](deviceId, paramList, timeFrom, timeTo, funcsStatTimePeriodArg[i], resCallBack);
                }
                else {


                    callBack(null, result);
                }
            }

            funcs[i](deviceId, paramList, timeFrom, timeTo, funcsStatTimePeriodArg[i], resCallBack);
        }

    }
   
	this.getDeviceOnlineStatus = function(collectionName,deviceId,callback){
        dbInstance.getOnlineDevice(collectionName,deviceId,(err,result)=>{
            if(err){
                return err
            }else{
                callback(null,result)
            }
        })
	}


    this.getSensorStatsInfo = function (deviceId, paramList, timeFrom, timeTo, limit, offset, dbSuffix, callBack) {

        deviceManager.getDeviceFromId(deviceId, function (device) {

            if (device != null) {
                var collectionName = myInstance.getStatCollectionPrefixFromDeviceLogicalId(device.logicalDeviceId) + dbSuffix;
                statManager.getStatParam(collectionName, paramList, timeFrom, timeTo, limit, offset, function (err, res) {

                    if (err) {
                        callBack(1, null);
                    }
                    else {
                        callBack(null, res);
                    }

                });
            }
            else
                callBack(1, null);
        });
    }


    this.getSensorStatsInfoCount = function (deviceId, paramList, timeFrom, timeTo, dbSuffix, callBack) {

        deviceManager.getDeviceFromId(deviceId, function (device) {

            if (device != null) {
                var collectionName = myInstance.getStatCollectionPrefixFromDeviceLogicalId(device.logicalDeviceId) + dbSuffix;

                statManager.getStatParamCount(collectionName, paramList, timeFrom, timeTo, function (err, res) {

                    if (err) {
                        callBack(1, null);
                    }
                    else {
                        callBack(null, res);
                    }

                });
            }
            else
                callBack(1, null);
        });
    }

    this.getDasboardDisplayData = function (sensorId, callBackData) {
        var myInstance = this;
        var collectionName = sensorId + "_L";
        deviceManager.getDeviceFromId(sensorId, function (device) {
            if (device != null) {
                var statParams = [];
                var aqiParams = [];
                var specificDevice = devFactory.createDeviceInstanceFromSubType(device.subType);
                specificDevice.parse(device);
                var paramDef = specificDevice.getDefaultParamDefinitions();
                paramDef.forEach(param => {
                    (param.signageDisplayStat) ? statParams.push(param.paramName) : '';
                    (param.signageDisplayAqiParam) ? aqiParams.push(param.paramName) : '';
                });
                sensorLiveDataHandler.getLiveDataHelper(collectionName, collectionName, 1, 0, null, null, function (liveDataErr, deviceId, liveData) {
                    myInstance.getSensorStats(sensorId, statParams, null, null, true, false, false, false, statParams.length * 2, 0, function (statDataErr, statData) {
                        myInstance.getSensorStats(sensorId, aqiParams, null, null, true, false, false, false, statParams.length * 2, 0, function (aqiDataErr, aqiData) {
                            if (liveDataErr || statDataErr || aqiDataErr) {
                                callBackData(1, sensorId, null);
                            } else {
                                var data = paramDef.reduce((data, param) => {
                                    if (param.signageDisplayLive) {
                                        data[param.paramName] = (param.paramName != 'receivedTime') ? Number(liveData[0].data[param.paramName]).toFixed(2) : liveData[0].data[param.paramName];
                                    } else if (param.signageDisplayStat || param.signageDisplayAqiParam) {
                                        let typeData = (param.signageDisplayStat) ? statData.hourlyStat : aqiData.hourlyStat;
                                        let paramStatData = typeData.find(function (item) {
                                            if (item.paramName === param.paramName) {
                                                return true;
                                            }
                                        });
                                        data[param.paramName] = (paramStatData) ? (param.valueType === 'string') ? paramStatData.statParams.latestValue :
                                            (paramStatData.statParams.sum / paramStatData.statParams.count).toFixed(2) : null;
                                    }
                                    return data;
                                }, {});
                                callBackData(null, sensorId, [{ logicalDeviceId: deviceId, data: data }]);
                            }
                        });
                    });
                });
            } else {
                callBackData(1, sensorId, null);
            }
        });
    }

    this.getStatCollectionPrefixFromDeviceLogicalId = function (logicalId) {

        return logicalId + "_stat";

    }

    this.getRawDataCollectionName = function (logicalDeviceID) {

        return logicalDeviceID + "_raw";
    }

    this.getAllSensorFilteredData = function (groupByField, sortByPrcntFilled, skipEmptyBox, isAssigned) {
        const sortOption = (sortByPrcntFilled) ? { "data.data_1": -1, "data.data_2": -1 } : {};
        const query = (skipEmptyBox && isAssigned) ?
            { $and: [{ $or: [{ "data.letter_no_1": { $ne: 0 } }, { "data.letter_no_2": { $ne: 0 } }] }, { "data.assigned_to": isAssigned }] } : {};
        return new Promise(function (resolve, reject) {
            if (groupByField) {
                return dbInstance.GetDocumentsGroupBy('devices_data', groupByField, function (err, result) {
                    (result) ? resolve(result) : reject(err);
                });
            } else {
                return dbInstance.GetFilteredDocumentSorted('devices_data', query, { "_id": false }, sortOption, 100, 0, function (err, result) {
                    (result) ? resolve(result) : reject(err);
                });
            }
        });
    }

    this.updateSummary = async function (device) {

        if (device.subType == "SPB001") {
            var date = new Date();
            var summary = { updatedTime: date.valueOf() };
            var specificDevice = devFactory.createDeviceInstanceFromSubType(device.subType);
            var summaryDef = specificDevice.getSummaryDefinitions();
            _.forEach(summaryDef, (sumParamdef) => {
                summary[sumParamdef.paramName] = 0;
            });
            var filteredDeviceData = await this.getAllSensorFilteredData();
            _.forEach(filteredDeviceData, (filteredData) => {
                if (filteredData) {
                    _.forEach(summaryDef, (sumParamdef) => {
                        let perctOfOneDevice = (1 / (filteredDeviceData.length * sumParamdef.calculationParam.length)) * 100;
                        _.forEach(sumParamdef.calculationParam, (param) => {
                            if (filteredData.data[param] !== undefined && eval(filteredData.data[param] + sumParamdef.calculationCond)) {
                                if (summary[sumParamdef.paramName]) {
                                    summary[sumParamdef.paramName] += perctOfOneDevice;
                                } else {
                                    summary[sumParamdef.paramName] = perctOfOneDevice;
                                }
                            }
                        });
                    });
                }
            });

            dbInstance.insertDocument("summary", summary, function (err) {
                (err) ? console.error("Unable to update summary collection") : '';
            });
        }
    }

    this.updateDeviceLatestEntry = function (device, data, callBack) {
        if (device.subType == "SPB001") {
            var collectionName = "devices_data"
            var deviceQuery =
            {
                "deviceId": device.deviceId
            }
            delete data._id;
            data.locId = device.location.locId;
            dbInstance.createUniqueIndex(collectionName, { deviceId: 1 }, function () {
                dbInstance.insertOrUpdateDocument(collectionName, deviceQuery, data, function (err) {
                    (err) ? console.error("Unable to update deivce latest entry collection") : callBack();
                });
            });

        }
    }

    this.getSummary = function (callBack) {

        dbInstance.GetFilteredDocumentSorted("summary", null, { "_id": false }, { "updatedTime": -1 }, 1, 0, function (err, result) {

            if (err) {
                callBack(1, null);
            }
            else {
                callBack(null, result);
            }

        });

        return;

    };

    this.updateSpecficRawParam = function (sensorId, params, values, callBack) {
        var myInstance = this;
        dbInstance.GetFilteredDocumentSorted('device_raw_data', { "deviceId": sensorId }, { "_id": false }, { "data.receivedTime": -1 }, 1, 0, function (err, result) {
            if (err) {
                callBack(1, null);
            }
            else {
                params.forEach((param, index) => {
                    result[0].data[param] = values[index];
                });
                myInstance.pushSensorData(sensorId, [result[0].data], callBack)
            }
        });
    }

    this.updateRawDataStatus = function (status, _id) {

        dbInstance.updateDocument('device_raw_data', { "_id": _id }, { "status": status }, function (err) {
            if (err) {
                console.error("Error occured while updating device raw data status");
            }
        });

        return;

    };

    this.pushSensorData = function (sensorId, data1, callBack) {
        deviceManager.getDeviceFromId(sensorId, function (device) {
            if (device != null) {
                data1.forEach(sample => {
                    if (device.location != null) {
                        if ((sample["latitude"] == null || sample["latitude"] == "") || (sample["longitude"] == null || sample["longitude"] == "")) {
                            sample["latitude"] = device.location.latitude;
                            sample["longitude"] = device.location.longitude;
                        }
                        sample["location"] = device.location.city;
                    }
                    // New Code
                    
                    
                    // End new code
                    var insetRowRaw = {
                        deviceId: sensorId,
                        logicalDeviceId: device.logicalDeviceId,
                        status: "ready",
                        data: sample
                    };

                    // console.log('DEVICE DATA==============', insetRowRaw)
                    dbInstance.insertDocument("device_raw_data", insetRowRaw);// Old code
                    // dbInstance.insertDocument(sensorId + "_L", insetRowRaw);
                });
                callBack(null);
            } else {
                callBack(1);
            }
        });
    }

    this.updateStatusAQI = function (time, id, callback) {
        deviceManager.getDeviceFromId(id, async function (device) {
            if (device != null) {
                let aqiUpdate = { "latestAQI": "" }
                if (process.env.NEED_AQI === 'true') {
                    var currentAQI = await new Promise(resolve => {
                        statManager.getStatParamHourly(device.logicalDeviceId + '_stat_daily', ["AQI"], null, null, 1, 0, function (err, res) {
                            if (err || (res.length === 0)) {
                                console.error("Error occured while updating device lastRecvd AQI");
                                resolve(false)
                            } else {
                                resolve(res[0])
                            }
                        });
                    });
                    if (currentAQI !== false) {
                        aqiUpdate = { "latestAQI": currentAQI }
                    }
                }
		console.log(time)
                const updates = {
                    ...aqiUpdate, ...{
                        "lastDataReceiveTime": new Date(time).valueOf(),
                        "nearTimeStatus": device.lastDataReceiveTime
                    }
                }
		// console.log(updates)
                dbInstance.updateDocument('devices', { "deviceId": id }, updates, function (err) {
                    if (err) {
                        console.error("Error occured while updating device lastRecvd Time");
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            } else {
                console.error("Error occured while updating device lastRecvd Time");
                callback(false);
            }
        });

        dbInstance.updateDocument('devices', { "deviceId": id }, { "lastDataReceiveTime": new Date(time).valueOf() }, function (err) {
            if (err) {
                console.error("Error occured while updating device lastRecvd Time"); 0
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    this.processIncomingData = function () {
        var myInstance = this;
        var processFunc = function () {

            dbInstance.findOneAndUpdate("device_raw_data", { "status": "ready" }, { "status": "processing" }, { "data.receivedTime": 1 }, function (err, result) {
                if (err) {
                    console.error("Unable procees device raw data")
                    return setTimeout(processFunc, 2000);
                } else if (result && result.lastErrorObject && result.lastErrorObject.updatedExisting === false) {
                    return setTimeout(processFunc, 2000);
                }
                if (result.value) {
                    var pushItem = result.value;
                    var sensorId = pushItem.deviceId;
                    var deviceId = pushItem.deviceId;
                    var data = pushItem.data;
                    deviceManager.getDeviceFromId(deviceId, function (device) {
                        if (device != null) {
                            var specificDevice = devFactory.createDeviceInstanceFromSubType(device.subType);
                            specificDevice.parse(device);
                            if (device != null && device.logicalDeviceId != null) {
                                var collectionName = device.logicalDeviceId;
                                specificDevice.ProcessSensorData(data, async function (ferr, filteredData) {
                                    if (filteredData != null) {
                                        var insetRowFiltered = {
                                            deviceId: sensorId,
                                            logicalDeviceId: device.logicalDeviceId,
                                            data: filteredData
                                        };
                                        const currentdate = new Date(data.receivedTime);
                                        dbInstance.insertDocument(collectionName, insetRowFiltered);

                                        if (process.env.PUSH_TRINITY === "true") {
                                            const trinityData = {
                                                "ENVIRONMENT": {
                                                    //"UV": filteredData["UV"],
                                                    "AQI": filteredData.rawAQI,
                                                    "TEMP": filteredData.temperature,
                                                    "HUM": filteredData.humidity,
                                                    "PM10": filteredData.PM10,
                                                    "PM2.5": filteredData.PM2p5,
                                                    //"LIGHT": filteredData.lux,
                                                    "RAIN": filteredData.rain,
                                                    "CO": filteredData["CO"],
                                                    "CO2": filteredData["CO2"],
                                                    "NO2": filteredData["NO2"],
                                                    "SO2": filteredData["SO2"],
                                                    "O3": filteredData["O3"],
                                                    "NOISE": filteredData["noise"],
                                                    "PRESSURE": filteredData['pressure'],
                                                    "DATE_TIME": moment(filteredData.receivedTime).format("YYYY-MM-DD HH:m:ss"),
                                                    "DATE": moment(filteredData.receivedTime).format("DDMMYY"),
                                                    "TIME": moment(filteredData.receivedTime).format("HHMMSS"),
                                                    "MAC": sensorId
                                                }
                                            }

                                            if (trinity.accessToken == '' || trinity.accessToken == undefined) {
                                                token = await trinity.auth();
                                            }
                                            const authHeader = 'Bearer ' + trinity.accessToken;
                                            const options = {
                                                'method': 'POST',
                                                'url': process.env.PUSH_TRINITY_URL + '/HTTPProtAdaptorService/rest/telemetry/pushData',
                                                'headers': {
                                                    'Content-Type': 'application/json',
                                                    'deviceId': sensorId,
                                                    'Authorization': authHeader
                                                },
                                                body: JSON.stringify(trinityData)
                                            };
                                            var resp = await new Promise(resolve => {
                                                request(options, function (error, response) {
                                                    // console.log(response.body)
                                                    if (error) { resolve(false) }
                                                    else { resolve(JSON.parse(response.body)) }
                                                });
                                            });
                                        }

                                        var collectionNamePrefix = myInstance.getStatCollectionPrefixFromDeviceLogicalId(device.logicalDeviceId);
                                        myInstance.updateStatistics(currentdate, collectionNamePrefix, filteredData, device, function () {

                                            myInstance.updateDerivedParams(currentdate, collectionNamePrefix, filteredData, device);

                                            myInstance.updateDeviceLatestEntry(device, insetRowFiltered, function () {
                                                myInstance.updateSummary(device);
                                            });
                                        });
                                    } else {
                                        myInstance.updateRawDataStatus("error", pushItem._id);
                                    }
                                    var insetRowRaw = {
                                        deviceId: sensorId,
                                        logicalDeviceId: device.logicalDeviceId,
                                        data: data
                                    };
                                    dbInstance.insertDocument(myInstance.getRawDataCollectionName(device.logicalDeviceId), insetRowRaw);
                                });
                                myInstance.updateRawDataStatus("completed", pushItem._id);
                                return setTimeout(processFunc, 2000);
                            }
                        } else {
                            myInstance.updateRawDataStatus("error", pushItem._id);
                        }
                    });
                }
            });
        }
        setTimeout(processFunc, 2000);
    }
}


// export the class
module.exports =
{
    SensorManager
};

