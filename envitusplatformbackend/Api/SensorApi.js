
var responseModule = require('../HubResponse.js');

var requestValidationModule = require('../RequestValidation.js');
var requestValidation = new requestValidationModule.RequestValidation();

var SensorManagerModule = require('../Device/SensorManager.js');
var sensorManager = new SensorManagerModule.SensorManager();

var thirdpartyrequestValidationModule = require('../ThirdPartyRequestValidation.js')
var thirdpartyrequestValidation = new thirdpartyrequestValidationModule.ThirdPartyRequestValidation();



const rateLimit = new require("express-rate-limit");

const apiLimiter = rateLimit({

    windowMs: 1000 * 60 * 60,
    max: 100,


});

function SensorApi(express) {

    //express.use(apiLimiter);
    express.get('/device/sensor/livedata/v1/count', function (req, res) {
        // device id will not be logical for this API
        express.use(apiLimiter);
        var hubResponse = new responseModule.HubResponse();

        thirdpartyrequestValidation.checkUser(req.query.apikey, function (result) {
            if (result == 'failure') {
                res.end(hubResponse.getErrorResponse(-1, "Invalid Key"));
            }
        })

        thirdpartyrequestValidation.isValidThirdPartyuser(req.query.apikey, 1, function (result) {
            if (result == "limit") {
                var response = null;
                response = hubResponse.getErrorResponse(-1, "Limit Exceeded");
                res.end(response);

            }
            else {
                // getLiveDataCount(req, res, false);
                if (req.query != null && req.query.deviceIds != null) {


                    var timeStart = req.query.timeStart;
                    var timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');

                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];

                    var i = 0;

                    var funcName = 'getLiveDataCountFromDeviceId';



                    var fetchSensor = function (err, sensorId, value) {
                        if (err == null) {
                            var resultPerDevice = { deviceId: sensorId, count: value };
                            listResult.push(resultPerDevice);

                        }
                        i++;
                        if (lastDevId == sensorId) {
                            hubResponse.data = { liveDataCountPerDeviceId: listResult };
                            response = hubResponse.getOkResponse();

                            res.end(response);
                        }
                        else {
                            sensorManager[funcName](listDevIds[i], timeStart, timeEnd, fetchSensor);
                        }
                    };

                    sensorManager[funcName](listDevIds[i], timeStart, timeEnd, fetchSensor);


                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });
    }
    )

    var getLiveDataCount = function (req, res, isLogicalDeviceId) {

        var hubResponse = new responseModule.HubResponse();
        requestValidation.isValidUser(req, res, function (result) {
            if (result == null) {

                var response = null;
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);

            }
            else {

                if (req.query != null && req.query.deviceIds != null) {

                    var timeStart = null;
                    var timeEnd = null;

                    if (req.query.timeStart != 'null')
                        timeStart = req.query.timeStart;
                    if (req.query.timeEnd != 'null')
                        timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;

                    var funcName = 'getLiveDataCount';

                    if (!isLogicalDeviceId) {
                        funcName = 'getLiveDataCountFromDeviceId';
                    }

                    var fetchSensor = function (err, sensorId, value) {
                        if (err == null) {
                            var resultPerDevice = { deviceId: sensorId, count: value };
                            listResult.push(resultPerDevice);

                        }
                        i++;
                        if (lastDevId == sensorId) {

                            hubResponse.data = { liveDataCountPerDeviceId: listResult };
                            response = hubResponse.getOkResponse();
                            res.end(response);
                        }
                        else {

                            sensorManager[funcName](listDevIds[i], timeStart, timeEnd, fetchSensor);
                        }
                    };

                    sensorManager[funcName](listDevIds[i], timeStart, timeEnd, fetchSensor);
                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });

    }

    express.get('/device/sensor/livedata/count', function (req, res) {

        getLiveDataCount(req, res, true);

    });

    express.get('/device/sensor/livedata/v1', function (req, res) {
        // getLiveData(req, res, false);
        express.use(apiLimiter);
        var hubResponse = new responseModule.HubResponse();

        thirdpartyrequestValidation.checkUser(req.query.apikey, function (result) {
            if (result == 'failure') {
                res.end(hubResponse.getErrorResponse(-1, "Invalid Key"));
            }
        })

        thirdpartyrequestValidation.isValidThirdPartyuser(req.query.apikey, 2, function (result) {
            if (result == "limit") {
                var response = null;
                response = hubResponse.getErrorResponse(-1, "Limit Exceeded");
                res.end(response);
            }
            else {

                if (req.query != null && req.query.deviceIds != null) {

                    var timeStart = req.query.timeStart;
                    var timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 10;
                    var offset = 0;
                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    var fetchSensorLiveData = function () {

                        sensorManager.getLiveDataFromDeviceId(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                    };

                    var fetchSensor = function (err, sensorId, value) {
                        if (err == null) {
                            if (value[0] != null || value[0] != undefined) {

                                delete value[0].data.er_init_sensor;
                                delete value[0].data.er_read_sensor;
                                delete value[0].data.build_ver;
                                delete value[0].data.sig_strength;

                                // for(var m=0; m<1; m++){

                                //     for(z in value[0].data){

                                //         value[0].data[z] = value[0].data[z].toFixed(3);

                                //     }

                                // }
                                var resultPerDevice = { deviceId: listDevIds[i], dataList: value };
                                listResult.push(resultPerDevice);
                            }
                        }
                        i++;
                        if (i >= listDevIds.length) {
                            hubResponse.data = { liveDataPerDeviceId: listResult };
                            response = hubResponse.getOkResponse();

                            res.end(response);
                        }
                        else {
                            fetchSensorLiveData();
                            //sensorManager.getLiveData(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                        }
                    };

                    fetchSensorLiveData();
                    //sensorManager.getLiveData(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });
    });

    var getLiveData = function (req, res, isLogicalDeviceId) {

        var hubResponse = new responseModule.HubResponse();

        requestValidation.isValidUser(req, res, function (result) {
            if (result == null) {
                var response = null;
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);
            }
            else {

                if (req.query != null && req.query.deviceIds != null) {
                    var timeStart = null;
                    var timeEnd = null;

                    if (req.query.timeStart != 'null')
                        timeStart = req.query.timeStart;
                    if (req.query.timeEnd != 'null')
                        timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 10;
                    var offset = 0;
                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    var fetchSensorLiveData = function () {
                        if (isLogicalDeviceId)
                            sensorManager.getLiveData(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                        else
                            sensorManager.getLiveDataFromDeviceId(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                    };

                    var fetchSensor = function (err, sensorId, value) {
                        if (err == null) {
                            var resultPerDevice = { deviceId: listDevIds[i], dataList: value };
                            listResult.push(resultPerDevice);

                        }
                        i++;
                        if (i >= listDevIds.length) {
                            hubResponse.data = { liveDataPerDeviceId: listResult };
                            response = hubResponse.getOkResponse();

                            res.end(response);
                        }
                        else {
                            fetchSensorLiveData();
                            //sensorManager.getLiveData(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);
                        }
                    };

                    fetchSensorLiveData();
                    //sensorManager.getLiveData(listDevIds[i], numberOfRecords, offset, timeStart, timeEnd, fetchSensor);


                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });


    }

    express.get('/device/sensor/livedata', function (req, res) {


        getLiveData(req, res, true);


    });

    express.post('/device/sensor/livedata/update', function (req, res) {
        var hubResponse = new responseModule.HubResponse();
        if (req.body != null || req.body.params.length !== req.body.values.length) {
            sensorManager.updateSpecficRawParam(req.body.deviceId, req.body.params, req.body.values, function (err) {
                if (err == null) {
                    response = hubResponse.getOkResponse();
                }
                else
                    response = hubResponse.getErrorResponse(-2, "Failed to update DB in server");

                res.end(response);
            });
        }
        else {
            res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
        }
    });

    express.post('/device/sensor/livedata', function (req, res) {


        var hubResponse = new responseModule.HubResponse();
	    // console.log('BODY*****',req.body)
        if (req.body != null) {
          //  if (req.body.data.time == undefined) {
                req.body.data.time = new Date()
          //  }
         
         
            var dataOfRequest = ((process.env.PROJECT_TYPE === "AQMS") && (process.env.SINGLET_POST === "false")) ? getHashedConversion(req.body.data) :
                (process.env.PROJECT_TYPE === "AQMS") ? getAqmsConversion(req.body.data) :
                    (process.env.PROJECT_TYPE === "PBMS") ? getPBMSConversion(req.body.data) : req.body.data;
                    // console.log("DATA RECEIVED FROM SENSORS >>> ",req.body)
            sensorManager.updateStatusAQI(req.body.data.time, req.body.deviceId, function (err) {
                if (err == false) {
                    console.log("Couldnt update last rcvdTime in Devices")
                }
            })
            // console.log('DATA OF REQEST======',dataOfRequest)
            sensorManager.pushSensorData(req.body.deviceId, dataOfRequest, function (err) {

                if (err == null) {
                    response = hubResponse.getOkResponse();
                }
                else
                    response = hubResponse.getErrorResponse(-2, "Failed to update DB in server");

                res.end(response);
            });
        }
        else {
            res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
        }
    });

    var getPBMSConversion = function (data) {
        var formattedData;
        const pb1History = data.pb1History.split('#');
        const pb2History = data.pb2History.split('#');
        noOfSamples = pb1History.length - 1;
        return pb1History.map((pbStatus, index) => {
            let sensorData = { ...data }
            sensorData.time = new Date(data.time).valueOf();
            sensorData.pb1Status = parseInt(pbStatus);
            sensorData.pb2Status = parseInt(pb2History[index]);
            sensorData.receivedTime = sensorData.time - ((noOfSamples - index) * data.samplingMin * 60 * 1000);
            return sensorData;
        });
    }

    var getAqmsConversion = function (data) {
        if (data.NO2 != null) {

            data.NO2 = (data.NO2 * 0.0409 * 46.01) * 1000;
        }
        if (data.SO2 != null) {

            data.SO2 = (data.SO2 * 0.0409 * 64.06) * 1000;
        }
        if (data.O3 != null) {

            data.O3 = (data.O3 * 0.0409 * 48) * 1000;
        }
        if (data.CO != null) {

            data.CO = (data.CO * 0.0409 * 28.01);
        }
        if (data.NH3 != null) {

            data.NH3 = (data.NH3 * 0.0409 * 17.031) * 1000;
        }
        var currentdate = new Date();
        data.receivedTime = currentdate.valueOf();
        return [data];
    }

    var getHashedConversion = function (data) {
        const firstParam = data[Object.keys(data)[0]].toString().split("#");
        let returnData = Array(firstParam.length).fill({});
        for (var key of Object.keys(data)) {
            if (key === 'GPS') {
                let paramVals = data[key].toString().split("#");
                paramVals.forEach((val, count) => {
                    returnData[count] = { ...returnData[count], ...{ [key]: String(val) } }
                });
            } else if (key !== 'time' && key !== 'samplingInterval') {
                let paramVals = data[key].toString().split("#");
                paramVals.forEach((val, count) => {
                    val = doParamConversion(key, Number(val));
                    returnData[count] = { ...returnData[count], ...{ [key]: Number(val) } }
                });
            } else if (key === 'time') {
                const latestDate = new Date(data.time).valueOf();
                for (let index = 0; index < firstParam.length; index++) {
                    const datasetTime = latestDate - ((firstParam.length - (index + 1)) * data.samplingInterval * 1000);
                    returnData[index] = { ...returnData[index], ...{ receivedTime: datasetTime } }
                }
            }
        }
        return returnData;
    }

    var doParamConversion = function (param, value) {
        if (param === 'NO2' && value != null) {
            value = (value * 0.0409 * 46.01) * 1000;
        } else if (param === 'SO2' && value != null) {
            value = (value * 0.0409 * 64.06) * 1000;
        } else if (param === 'O3' && value != null) {
            value = (value * 0.0409 * 48) * 1000;
        } else if (param === 'CO' && value != null) {
            value = (value * 0.0409 * 28.01);
        } else if (param === 'NH3' && value != null) {
            value = (value * 0.0409 * 17.031) * 1000;
        }
        return value;
    }

    var convertFromOldToNewFormat = function (oldJsonData) {
        var result = null;

        if (oldJsonData.deviceId != null && oldJsonData.payload != null && oldJsonData.payload.d != null) {
            var newData = oldJsonData.payload.d;
            if (newData.deviceId != null)
                delete newData.deviceId;

            if (newData.deviceType != null)
                delete newData.deviceType;

            if (newData.uptime != null)
                delete newData.uptime;

            result = { deviceId: oldJsonData.deviceId, data: newData };
        }
        return result;
    }
    express.post('/device/sensor/livedata/oldformat', function (req, res) {


        var hubResponse = new responseModule.HubResponse();

        if (req.body != null) {
            var newFormat = convertFromOldToNewFormat(req.body);
            if (newFormat != null) {
                sensorManager.pushSensorData(newFormat.deviceId, newFormat.data, function (err) {
                    if (err != null) {
                        response = hubResponse.getOkResponse();
                        res.end(response);
                    }

                });
            }
            else
                res.end(hubResponse.getErrorResponse(-2, "Invalid Format"));
        }
        else {
            res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
        }



    });

    var includeHourlyStats = function (optionList) {
        return optionList.indexOf('hourly') >= 0;
    };
    var includeDailyStats = function (optionList) {
        return optionList.indexOf('daily') >= 0;
    };
    var includeMonthlyStats = function (optionList) {
        return optionList.indexOf('monthly') >= 0;
    };
    var includeYearlyStats = function (optionList) {
        return optionList.indexOf('yearly') >= 0;
    };



    express.get('/device/sensor/stats/v1', function (req, res) {

        express.use(apiLimiter);

        var hubResponse = new responseModule.HubResponse();

        thirdpartyrequestValidation.checkUser(req.query.apikey, function (result) {
            if (result == 'failure') {
                res.end(hubResponse.getErrorResponse(-1, "Invalid Key"));
            }
        })

        thirdpartyrequestValidation.isValidThirdPartyuser(req.query.apikey, 3, function (result) {
            if (result == "limit") {
                var response = null;
                response = hubResponse.getErrorResponse(-1, "Limit Exceeded");
                res.end(response);

            }
            else {

                if (req.query != null && req.query.deviceIds != null && req.query.timeFrame != null) {
                    var options = req.query.timeFrame.split(',');
                    var timeStart = req.query.timeStart;
                    var timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var paramList = null;//req.query.params.split(',');
                    if (req.query.params != null && req.query.params != 'null')
                        paramList = req.query.params.split(',');

                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 100;
                    var offset = 0;



                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    {
                        var devId = listDevIds[i];

                        var fetchSensor = function (err, value) {
                            if (err == null) {
                                var resultPerDevice = { deviceId: listDevIds[i], stat: value };
                                listResult.push(resultPerDevice);


                            }
                            i++;
                            if (i >= listDevIds.length) {

                                hubResponse.data = { statPerDeviceId: listResult };
                                response = hubResponse.getOkResponse();

                                res.end(response);
                            }
                            else {
                                sensorManager.getSensorStats(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                                    (options), includeYearlyStats(options), numberOfRecords, offset, fetchSensor);
                            }
                        };
                        sensorManager.getSensorStats(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                            (options), includeYearlyStats(options), numberOfRecords, offset, fetchSensor);
                    }

                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });

    });

    express.get('/device/sensor/stats', function (req, res) {


        var hubResponse = new responseModule.HubResponse();

        requestValidation.isValidUser(req, res, function (result) {
            if (result == null) {
                var response = null;
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);
            }
            else {

                if (req.query != null && req.query.deviceIds != null && req.query.timeFrame != null) {
                    var options = req.query.timeFrame.split(',');
                    var timeStart = null;
                    var timeEnd = null;
                    if (req.query.timeStart != 'null')
                        timeStart = req.query.timeStart;
                    if (req.query.timeEnd != 'null')
                        timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var paramList = null;//req.query.params.split(',');
                    if (req.query.params != null && req.query.params != 'null')
                        paramList = req.query.params.split(',');

                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 100;
                    var offset = 0;



                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    {
                        var devId = listDevIds[i];

                        var fetchSensor = function (err, value) {
                            if (err == null) {
                                var resultPerDevice = { deviceId: listDevIds[i], stat: value };
                                listResult.push(resultPerDevice);


                            }
                            i++;
                            if (i >= listDevIds.length) {

                                hubResponse.data = { statPerDeviceId: listResult };
                                response = hubResponse.getOkResponse();

                                res.end(response);
                            }
                            else {
                                sensorManager.getSensorStats(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                                    (options), includeYearlyStats(options), numberOfRecords, offset, fetchSensor);
                            }
                        };
                        sensorManager.getSensorStats(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                            (options), includeYearlyStats(options), numberOfRecords, offset, fetchSensor);
                    }

                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });

    });


    express.get('/device/sensor/stats/v1/count', function (req, res) {
        express.use(apiLimiter);
        var hubResponse = new responseModule.HubResponse();

        thirdpartyrequestValidation.checkUser(req.query.apikey, function (result) {
            if (result == 'failure') {
                res.end(hubResponse.getErrorResponse(-1, "Invalid Key"));
            }
        })

        thirdpartyrequestValidation.isValidThirdPartyuser(req.query.apikey, 4, function (result) {
            if (result == "limit") {
                var response = null;
                response = hubResponse.getErrorResponse(-1, "Limit Exceeded");
                res.end(response);

            }
            else {

                if (req.query.params == null)
                    req.query.params = null;
                if (req.query != null && req.query.deviceIds != null && req.query.timeFrame != null) {
                    var options = req.query.timeFrame.split(',');
                    var timeStart = null;
                    var timeEnd = null;

                    if (req.query.timeStart != 'null')
                        timeStart = req.query.timeStart;
                    if (req.query.timeEnd != 'null')
                        timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var paramList = null;
                    if (req.query.params != null && req.query.params != 'null')
                        paramList = req.query.params.split(',');
                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 10;
                    var offset = 0;

                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    {
                        var devId = listDevIds[i];

                        var fetchSensor = function (err, value) {
                            if (err == null) {
                                var resultPerDevice = { deviceId: listDevIds[i], stat: value };
                                listResult.push(resultPerDevice);


                            }
                            i++;
                            if (i >= listDevIds.length) {

                                hubResponse.data = { statCountPerDeviceId: listResult };
                                response = hubResponse.getOkResponse();

                                res.end(response);
                            }
                            else {
                                sensorManager.getSensorStatsCount(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                                    (options), includeYearlyStats(options), fetchSensor);
                            }
                        };
                        sensorManager.getSensorStatsCount(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                            (options), includeYearlyStats(options), fetchSensor);
                    }

                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });

    });


    express.get('/device/sensor/stats/count', function (req, res) {

        var hubResponse = new responseModule.HubResponse();

        requestValidation.isValidUser(req, res, function (result) {
            if (result == null) {
                var response = null;
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);
            }
            else {

                if (req.query.params == null)
                    req.query.params = null;
                if (req.query != null && req.query.deviceIds != null && req.query.timeFrame != null) {
                    var options = req.query.timeFrame.split(',');
                    var timeStart = null;
                    var timeEnd = null;

                    if (req.query.timeStart != 'null')
                        timeStart = req.query.timeStart;
                    if (req.query.timeEnd != 'null')
                        timeEnd = req.query.timeEnd;
                    var listDevIds = req.query.deviceIds.split(',');
                    var paramList = null;
                    if (req.query.params != null && req.query.params != 'null')
                        paramList = req.query.params.split(',');
                    var listResult = [];
                    var lastDevId = listDevIds[listDevIds.length - 1];
                    var i = 0;
                    var numberOfRecords = 10;
                    var offset = 0;

                    if (req.query.limit != null)
                        numberOfRecords = parseInt(req.query.limit);
                    if (req.query.offset != null)
                        offset = parseInt(req.query.offset);

                    {
                        var devId = listDevIds[i];

                        var fetchSensor = function (err, value) {
                            if (err == null) {
                                var resultPerDevice = { deviceId: listDevIds[i], stat: value };
                                listResult.push(resultPerDevice);
                            }
                            i++;
                            if (i >= listDevIds.length) {

                                hubResponse.data = { statCountPerDeviceId: listResult };
                                response = hubResponse.getOkResponse();

                                res.end(response);
                            }
                            else {
                                sensorManager.getSensorStatsCount(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                                    (options), includeYearlyStats(options), fetchSensor);
                            }
                        };
                        sensorManager.getSensorStatsCount(listDevIds[i], paramList, timeStart, timeEnd, includeHourlyStats(options), includeDailyStats(options), includeMonthlyStats
                            (options), includeYearlyStats(options), fetchSensor);
                    }

                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });

    });

    express.get('/device/sensor/summary', function (req, res) {
        var hubResponse = new responseModule.HubResponse();
        var response = null;
        requestValidation.isValidUser(req, res, function (result) {

            if (result == null) {
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);

            } else {
                response = hubResponse.getOkResponse();
                sensorManager.getSummary(function (err, data) {
                    if (err != null) {
                        response = hubResponse.getErrorResponse(-1, "Invalid request from client");
                        res.end(response);
                    }
                    else {
                        hubResponse = new responseModule.HubResponse();
                        var response = null;

                        hubResponse.data = data;
                        response = hubResponse.getOkResponse();
                        res.end(response);
                    }
                });

            }
        });

    });
    express.get('/device/sensor/testapi',function(req,res){
        res.send('hello')
    })
    express.get('/device/sensor/livedata/all', function (req, res) {
        console.log('LIVE DATA^^^^^^^^^^^^^^^')
        var hubResponse = new responseModule.HubResponse();
        var response = null;
        requestValidation.isValidUser(req, res, function (result) {
            if (result == null) {
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                res.end(response);
            } else {
                response = hubResponse.getOkResponse();
                groupByloc = (req.query.groupByloc == "true") ? 'locId' : null;
                sortByPrcntFilled = (req.query.sortByPrcntFilled == "true") ? true : false;
                skipEmptyBox = (req.query.skipEmptyBox == "true") ? true : false;
                isAssigned = (req.query.isAssignedBox == "true") ? req.query.userId : false;
                sensorManager.getAllSensorFilteredData(groupByloc, sortByPrcntFilled, skipEmptyBox, isAssigned).then(function (data) {
                    hubResponse = new responseModule.HubResponse();
                    var response = null;
                    hubResponse.data = data;
                    response = hubResponse.getOkResponse();
                    res.end(response);
                }, function (err) {
                    response = hubResponse.getErrorResponse(-1, "Invalid request from client");
                    res.end(response);
                });
            }
        });
    });

    express.get('/device/sensor/dashboardData', function (req, res) {
        // device id will not be logical for this API
        express.use(apiLimiter);
        var hubResponse = new responseModule.HubResponse();
        thirdpartyrequestValidation.isValidThirdPartyuser(req.query.apikey, 1, function (result) {
            if (result == "limit") {
                var response = null;
                response = hubResponse.getErrorResponse(-1, "Limit Exceeded");
                res.end(response);
            } else {
                if (req.query != null && req.query.deviceIds != null) {

                    var listDevIds = req.query.deviceIds.split(',');
                    
                    
                    var listResult = [];
                    var i = 0;
                    let deviceId = listDevIds[0]
                    var funcName = 'getDasboardDisplayData';
                    let isDeviceOnline
                    let testResult = []

                    var fetchSensor = function (err, sensorId, value) {
                        sensorManager.getDeviceOnlineStatus('devices',sensorId,(err,result)=>{
                            let testPerDevice = {
                              deviceId: sensorId,
                              status: result.isOnline,
                              longitude : result.longitude,
                              latitude : result.latitude,
                              landMark : result.landMark,
                              dataList: value,
                            };
                            testResult.push(testPerDevice)
                            
                            if (i>=listDevIds.length){
                                hubResponse.data = {
                                  liveDataPerDeviceId: testResult,
                                };
                                response = hubResponse.getOkResponse();
                                res.end(response)
                            }else {
                                sensorManager[funcName](listDevIds[i], fetchSensor);
                            }
                        })
                        i++;
                    };

                    sensorManager[funcName](listDevIds[i], fetchSensor);
                    
                }
                else {
                    res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
                }
            }
        });
    });

}

// export the class
module.exports =
{
    SensorApi
};
