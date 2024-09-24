var DatabaseHandlerModule = require('../DatabaseHandler.js');
var dbInstance = new  DatabaseHandlerModule.DatabaseHandler();
var moment = require('moment');

function StatisticsManager()
{
    this.convertDateToTimeZone= function(dateObj,timeZoneName)
    {
        var res = dateObj;
        if (timeZoneName != null)
        {
            var mtz = moment.tz(timeZoneName);//
            //mtz.utcOffset() * 60000
            var zoneChanged = moment.tz(dateObj.valueOf() , timeZoneName);//

            var date = zoneChanged.date();
            var year = zoneChanged.year();
            var month = zoneChanged.month();
            var hour = zoneChanged.hour();
            var minute = zoneChanged.minute();
            var millisecond = zoneChanged.millisecond();

            res = new Date(year, month, date, hour, minute, millisecond);
        }
        return res;
    }
    this.dateToDailyUsageKey = function(dateObj,timeZoneName)
    {

        var date = dateObj.getDate();
        var year = dateObj.getFullYear();
        var month = dateObj.getMonth() + 1;

        if (timeZoneName != null) {
            var zoneChanged = moment.tz(dateObj.valueOf(), timeZoneName);//

            date = zoneChanged.date();
            year = zoneChanged.year();
            month = zoneChanged.month()+1;
        }

        var result = date + "." + month + "." + year;
        return result;
    }

    this.dateToHourlyUsageKey = function(dateObj,timeZoneName)
    {
        var utcTime = new Date(dateObj.valueOf())
        var hour = utcTime.getHours();
        var key = utcTime.setHours(hour, 0, 0, 0);

        if (timeZoneName != null) {
            var zoneChanged = moment.tz(dateObj.valueOf(), timeZoneName);;
            key = zoneChanged.setHours(zoneChanged.getHours(), 0, 0, 0);
        }
        return key;
    }

    this.dateToMonthlyUsageKey = function (dateObj, timeZoneName) {

        var year = dateObj.getFullYear();
        var month = dateObj.getMonth() + 1;

        if (timeZoneName != null) {
            var zoneChanged = moment.tz(dateObj.valueOf(), timeZoneName);//

            year = zoneChanged.year();
            month = zoneChanged.month()+1;
        }

        var result =  month + "." + year;
        return result;
    }

    this.dateToYearlyUsageKey = function (dateObj, timeZoneName) {
        var year = dateObj.getFullYear();

        if (timeZoneName != null) {

            var zoneChanged = moment.tz(dateObj.valueOf(), timeZoneName);//
            year = zoneChanged.year();
        }


        var result =  year;
        return result;
    }
    this.getStatItemFromList = function (list, key)
    {
        var result = null;

        for (var i = 0; i < list.length; i++) {
            if (list[i].key == key) {
                result = list[i];
                break;
            }
        }

        return result;
    }

    

    this.getSpeednDir = function(windDirection, windSpeed) {
        let direction = ''; let speed = ''
        if(windDirection >= 0 && windDirection < 11.25) {
            direction = 'N';
        } else if(windDirection >= 11.25 && windDirection < 33.75) {
            direction = 'NNE';
        } else if(windDirection >= 33.75 && windDirection < 56.25) {
            direction = 'NE';
        } else if(windDirection >= 56.25 && windDirection < 78.75) {
            direction = 'ENE';
        } else if(windDirection >= 78.75 && windDirection < 101.25) {
            direction = 'E';
        } else if(windDirection >= 101.25 && windDirection < 123.75) {
            direction = 'ESE';
        } else if(windDirection >= 123.75 && windDirection < 146.25) {
            direction = 'SE';
        } else if(windDirection >= 146.25 && windDirection < 168.75) {
            direction = 'SSE';
        } else if(windDirection >= 168.75 && windDirection < 191.25) {
            direction = 'S';
        } else if(windDirection >= 191.25 && windDirection < 213.75) {
            direction = 'SSW';
        } else if(windDirection >= 213.75 && windDirection < 236.25) {
            direction = 'SW';
        } else if(windDirection >= 236.25 && windDirection < 258.75) {
            direction = 'WSW';
        } else if(windDirection >= 258.75 && windDirection < 281.25) {
            direction = 'W';
        } else if(windDirection >= 281.25 && windDirection < 303.75) {
            direction = 'WNW';
        } else if(windDirection >= 303.75 && windDirection < 326.25) {
            direction = 'NW';
        } else if(windDirection >= 326.25 && windDirection < 348.75) {
            direction = 'NNW';
        } else if(windDirection >= 348.75 && windDirection < 360) {
            direction = 'N';
        }

        if(windSpeed >= 0 && windSpeed < 0.28) {
            speed = 'Calm';
        } else if(windSpeed >= 0.28 && windSpeed < 1.39) {
            speed = 'Light Air';
        } else if(windSpeed >= 1.39 && windSpeed < 3.06) {
            speed = 'Light Breeze';
        } else if(windSpeed >= 3.06 && windSpeed < 5.28) {
            speed = 'Gentle Breeze';
        } else if(windSpeed >= 5.28 && windSpeed < 7.78) {
            speed = 'Moderate Breeze';
        } else if(windSpeed >= 7.78 && windSpeed < 10.56) {
            speed = 'Fresh Breeze';
        } else if(windSpeed >= 10.56 && windSpeed < 13.62) {
            speed = 'Strong Breeze';
        } else if(windSpeed >= 13.62 && windSpeed < 16.95) {
            speed = 'Near Gale';
        } else if(windSpeed >= 16.95 && windSpeed < 20.56) {
            speed = 'Gale';
        } else if(windSpeed >= 20.56 && windSpeed < 24.45) {
            speed = 'Strong Gale';
        } else if(windSpeed >= 24.45 && windSpeed < 28.35) {
            speed = 'Storm';
        } else if(windSpeed >= 28.34 && windSpeed < 32.50) {
            speed = 'Violent Storm';
        } else if(windSpeed >= 32.50) {
            speed = 'Hurricane';
        }

        return { direction: direction, speed: speed };
    }

    this.createNewWindStatCollection = function (paramName, value,currentDate, key, windDirection) {
        const wind = this.getSpeednDir(windDirection, value)

        const speeds = {
            'Calm': '',
            'Light Air': '',
            'Light Breeze': '',
            'Gentle Breeze': '',
            'Moderate Breeze': '',
            'Fresh Breeze': '',
            'Strong Breeze': '',
            'Near Gale': '',
            'Gale': '',
            'Strong Gale': '',
            'Storm': '',
            'Violent Storm': '',
            'Hurricane': ''
        }

        var newDoc = {
            "paramName": paramName,
            "epoch" : currentDate.valueOf(),
            "key": key,
            "statParams": {
                "sum": '',
                "count": '',
                "min": '',
                "max": '',
                "latestValue": ''
            },
            "detailedStat": {
                "sum": { N: {...speeds}, NNE: {...speeds}, NE: {...speeds}, ENE: {...speeds}, E: {...speeds}, ESE: {...speeds}, SE: {...speeds}, SSE: {...speeds}, S: {...speeds}, SSW: {...speeds}, SW: {...speeds}, WSW: {...speeds}, W: {...speeds}, WNW: {...speeds}, NW: {...speeds}, NNW: {...speeds} },
                "count": '',
                "min": { N: {...speeds}, NNE: {...speeds}, NE: {...speeds}, ENE: {...speeds}, E: {...speeds}, ESE: {...speeds}, SE: {...speeds}, SSE: {...speeds}, S: {...speeds}, SSW: {...speeds}, SW: {...speeds}, WSW: {...speeds}, W: {...speeds}, WNW: {...speeds}, NW: {...speeds}, NNW: {...speeds} },
                "max": { N: {...speeds}, NNE: {...speeds}, NE: {...speeds}, ENE: {...speeds}, E: {...speeds}, ESE: {...speeds}, SE: {...speeds}, SSE: {...speeds}, S: {...speeds}, SSW: {...speeds}, SW: {...speeds}, WSW: {...speeds}, W: {...speeds}, WNW: {...speeds}, NW: {...speeds}, NNW: {...speeds} },
                "latestValue": { N: {...speeds}, NNE: {...speeds}, NE: {...speeds}, ENE: {...speeds}, E: {...speeds}, ESE: {...speeds}, SE: {...speeds}, SSE: {...speeds}, S: {...speeds}, SSW: {...speeds}, SW: {...speeds}, WSW: {...speeds}, W: {...speeds}, WNW: {...speeds}, NW: {...speeds}, NNW: {...speeds} },
                "allValue": { N: {...speeds}, NNE: {...speeds}, NE: {...speeds}, ENE: {...speeds}, E: {...speeds}, ESE: {...speeds}, SE: {...speeds}, SSE: {...speeds}, S: {...speeds}, SSW: {...speeds}, SW: {...speeds}, WSW: {...speeds}, W: {...speeds}, WNW: {...speeds}, NW: {...speeds}, NNW: {...speeds} }
            }
        };

        if(value !== undefined){
          newDoc.statParams.sum = parseFloat(value);
          newDoc.statParams.count = 1;
          newDoc.statParams.min = Number(value);
          newDoc.statParams.max = Number(value);
          newDoc.statParams.latestValue = Number(value);

          newDoc.detailedStat.sum[wind.direction][wind.speed] = parseFloat(value)
          newDoc.detailedStat.count = 1
          newDoc.detailedStat.min[wind.direction][wind.speed] = Number(value)
          newDoc.detailedStat.max[wind.direction][wind.speed] = Number(value)
          newDoc.detailedStat.latestValue[wind.direction][wind.speed] = Number(value)
          newDoc.detailedStat.allValue[wind.direction][wind.speed] = [Number(value)]
        }
        return newDoc;

    }

    this.createNewStatCollection = function (paramName, value,currentDate, key) {
        var newDoc = {
            "paramName": paramName,
            "epoch" : currentDate.valueOf(),
            "key": key,
            "statParams": {
                "sum": '',
                "count": '',
                "min": '',
                "max": '',
                "latestValue": ''
            }
        };

        if(value !== undefined){
            newDoc.statParams.sum = (paramName === 'prominentPollutant') ? value : parseFloat(value);
            newDoc.statParams.count = 1;
            newDoc.statParams.min = (paramName === 'prominentPollutant') ? value : Number(value);
            newDoc.statParams.max = (paramName === 'prominentPollutant') ? value : Number(value);
            newDoc.statParams.latestValue = (paramName === 'prominentPollutant') ? value : Number(value);
        }

        return newDoc;
    }


    this.updateYearlyStats = function (collectionName, paramName, value, currentDate, timeZoneName, dataob, callBack) {
        if (collectionName != null && currentDate != null && paramName != null)
        {
            let key = this.dateToYearlyUsageKey(currentDate, timeZoneName)
		    var myInstance = this;
            var deviceQuery =
            {
                "paramName": { $in: [paramName] },
                "key": key
            }

			dbInstance.createUniqueIndex( collectionName,{ paramName: 1, key: 1 },function(errIndex,nameIndex){

				var newCollectionItem = (paramName === 'windSpeedAvg') ?
                    myInstance.createNewWindStatCollection(paramName, value, currentDate, key, dataob.windDirection) :
                    myInstance.createNewStatCollection(paramName, value, currentDate, key);
				dbInstance.insertDocument(collectionName, newCollectionItem, function (addErr) {
					if(addErr){

						dbInstance.GetDocumentByCriteria(collectionName, 0, deviceQuery, function (err, result)
						{
							if (err) {
								callBack(err);

							}
							else
							{
								if (result != null && value !== undefined) {
                  const newDataset = (result.statParams.count === '') ? true : false;
									result.epoch = currentDate.valueOf();
                  result.statParams.count = (newDataset) ? 1 : (result.statParams.count + 1);
                  result.statParams.sum = (paramName === 'prominentPollutant') ? value : ((newDataset) ? parseFloat(value) : (result.statParams.sum + parseFloat(value)));
                  result.statParams.min = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.min(result.statParams.min, Number(value)));
                  result.statParams.max = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.max(result.statParams.max, Number(value)));
                  result.statParams.latestValue = (paramName === 'prominentPollutant') ? value : Number(value);

                  if(paramName === 'windSpeedAvg') {
                      const wind = myInstance.getSpeednDir(dataob.windDirection, value);
                      const newWindset = (result.detailedStat.sum[wind.direction][wind.speed] === '') ? true : false;
                      result.detailedStat.count = (newDataset) ? 1 : (result.detailedStat.count + 1);
                      result.detailedStat.sum[wind.direction][wind.speed] = (newWindset) ? parseFloat(value) : (result.detailedStat.sum[wind.direction][wind.speed] + parseFloat(value));
                      result.detailedStat.min[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.min(result.detailedStat.min[wind.direction][wind.speed], Number(value)));
                      result.detailedStat.max[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.max(result.detailedStat.max[wind.direction][wind.speed], Number(value)));
                      result.detailedStat.latestValue[wind.direction][wind.speed] = Number(value);
                      result.detailedStat.allValue[wind.direction][wind.speed] = (newWindset) ? [Number(value)] : [...result.detailedStat.allValue[wind.direction][wind.speed], ...[Number(value)]];
                  }

                  dbInstance.updateDocument(collectionName, deviceQuery, result, function (errUpdate)
  								{
  									callBack(errUpdate);
  								});
								} else {
                  callBack(false);
                }

							}

						});

					}
					else
					{
						callBack(addErr);
					}
				});

			});



        }
        else {

            // error
            callBack(1)
        }

    }


    this.updateMonthlyStats = function (collectionName, paramName, value, currentDate, timeZoneName, dataob, callBack) {
        if (collectionName != null && currentDate != null && paramName != null)
        {
            let key = this.dateToMonthlyUsageKey(currentDate, timeZoneName)
		    var myInstance = this;
            var deviceQuery =
            {
                "paramName": { $in: [paramName] },
                "key": key
            }

			dbInstance.createUniqueIndex( collectionName,{ paramName: 1, key: 1 },function(errIndex,nameIndex){

				var newCollectionItem = (paramName === 'windSpeedAvg') ?
                    myInstance.createNewWindStatCollection(paramName, value, currentDate, key, dataob.windDirection) :
                    myInstance.createNewStatCollection(paramName, value, currentDate, key);
				dbInstance.insertDocument(collectionName, newCollectionItem, function (addErr) {
					if(addErr){

						dbInstance.GetDocumentByCriteria(collectionName, 0, deviceQuery, function (err, result)
						{
							if (err) {
								callBack(err);

							}
							else
							{

								if (result != null && value !== undefined) {
                  const newDataset = (result.statParams.count === '') ? true : false;
									result.epoch = currentDate.valueOf();
                  result.statParams.count = (newDataset) ? 1 : (result.statParams.count + 1);
                  result.statParams.sum = (paramName === 'prominentPollutant') ? value : ((newDataset) ? parseFloat(value) : (result.statParams.sum + parseFloat(value)));
                  result.statParams.min = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.min(result.statParams.min, Number(value)));
                  result.statParams.max = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.max(result.statParams.max, Number(value)));
                  result.statParams.latestValue = (paramName === 'prominentPollutant') ? value : Number(value);

                  if(paramName === 'windSpeedAvg') {
                    const wind = myInstance.getSpeednDir(dataob.windDirection, value);
                    const newWindset = (result.detailedStat.sum[wind.direction][wind.speed] === '') ? true : false;
                    result.detailedStat.count = (newDataset) ? 1 : (result.detailedStat.count + 1);
                    result.detailedStat.sum[wind.direction][wind.speed] = (newWindset) ? parseFloat(value) : (result.detailedStat.sum[wind.direction][wind.speed] + parseFloat(value));
                    result.detailedStat.min[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.min(result.detailedStat.min[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.max[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.max(result.detailedStat.max[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.latestValue[wind.direction][wind.speed] = Number(value);
                    result.detailedStat.allValue[wind.direction][wind.speed] = (newWindset) ? [Number(value)] : [...result.detailedStat.allValue[wind.direction][wind.speed], ...[Number(value)]];
                  }

                  dbInstance.updateDocument(collectionName, deviceQuery, result, function (errUpdate)
  								{
  									callBack(errUpdate);
  								});
								} else {
                  callBack(false);
                }

							}

						});

					}
					else
					{
						callBack(addErr);
					}
				});

			});



        }
        else {

            // error
            callBack(1)
        }

    }

    this.updateDailyStats = function (collectionName, paramName, value, currentDate, timeZoneName, dataob, callBack)
    {
        if (collectionName != null && currentDate != null && paramName != null)
        {
            let key = this.dateToDailyUsageKey(currentDate, timeZoneName)
		    var myInstance = this;
            var deviceQuery =
            {
                "paramName": { $in: [paramName] },
                "key": key
            }

			dbInstance.createUniqueIndex( collectionName,{ paramName: 1, key: 1 },function(errIndex,nameIndex){

                var newCollectionItem = (paramName === 'windSpeedAvg') ?
                    myInstance.createNewWindStatCollection(paramName, value, currentDate, key, dataob.windDirection) :
                    myInstance.createNewStatCollection(paramName, value, currentDate, key);
				dbInstance.insertDocument(collectionName, newCollectionItem, function (addErr) {
					if(addErr){

						dbInstance.GetDocumentByCriteria(collectionName, 0, deviceQuery, function (err, result)
						{
							if (err) {
								callBack(err);

							}
							else
							{

								if (result != null && value !== undefined) {
                  const newDataset = (result.statParams.count === '') ? true : false;
									result.epoch = currentDate.valueOf();
                  result.statParams.count = (newDataset) ? 1 : (result.statParams.count + 1);
                  result.statParams.sum = (paramName === 'prominentPollutant') ? value : ((newDataset) ? parseFloat(value) : (result.statParams.sum + parseFloat(value)));
                  result.statParams.min = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.min(result.statParams.min, Number(value)));
                  result.statParams.max = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.max(result.statParams.max, Number(value)));
                  result.statParams.latestValue = (paramName === 'prominentPollutant') ? value : Number(value);

                  if(paramName === 'windSpeedAvg') {
                    const wind = myInstance.getSpeednDir(dataob.windDirection, value);
                    const newWindset = (result.detailedStat.sum[wind.direction][wind.speed] === '') ? true : false;
                    result.detailedStat.count = (newDataset) ? 1 : (result.detailedStat.count + 1);
                    result.detailedStat.sum[wind.direction][wind.speed] = (newWindset) ? parseFloat(value) : (result.detailedStat.sum[wind.direction][wind.speed] + parseFloat(value));
                    result.detailedStat.min[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.min(result.detailedStat.min[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.max[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.max(result.detailedStat.max[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.latestValue[wind.direction][wind.speed] = Number(value);
                    result.detailedStat.allValue[wind.direction][wind.speed] = (newWindset) ? [Number(value)] : [...result.detailedStat.allValue[wind.direction][wind.speed], ...[Number(value)]];
                  }

                  dbInstance.updateDocument(collectionName, deviceQuery, result, function (errUpdate)
  								{
  									callBack(errUpdate);
  								});
								} else {
                  callBack(false);
                }

							}

						});

					}
					else
					{
						callBack(addErr);
					}
				});

			});



        }
        else {

            // error
            callBack(1)
        }

    }

    this.updateHourlyStats = function (collectionName, paramName, value, currentDate, dataob, callBack)
    {
        if (collectionName != null && currentDate != null && paramName != null)
        {
            var myInstance = this;
            var deviceQuery =
            {
                "paramName": { $in: [paramName] },
                "key": this.dateToHourlyUsageKey(currentDate)
            }
			dbInstance.createUniqueIndex( collectionName,{ paramName: 1, key: 1 },function(errIndex,nameIndex){
                var newCollectionItem = (paramName === 'windSpeedAvg') ?
                    myInstance.createNewWindStatCollection(paramName, value, currentDate, myInstance.dateToHourlyUsageKey(currentDate), dataob.windDirection) :
                    myInstance.createNewStatCollection(paramName, value, currentDate, myInstance.dateToHourlyUsageKey(currentDate));

				dbInstance.insertDocument(collectionName, newCollectionItem, function (addErr) {
					if(addErr){

						dbInstance.GetDocumentByCriteria(collectionName, 0, deviceQuery, function (err, result)
						{
							if (err) {
								callBack(err);

							}
							else
							{

								if (result != null && value !== undefined) {
                  const newDataset = (result.statParams.count === '') ? true : false;
									result.epoch = currentDate.valueOf();
                  result.statParams.count = (newDataset) ? 1 : (result.statParams.count + 1);
                  result.statParams.sum = (paramName === 'prominentPollutant') ? value : ((newDataset) ? parseFloat(value) : (result.statParams.sum + parseFloat(value)));
                  result.statParams.min = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.min(result.statParams.min, Number(value)));
                  result.statParams.max = (paramName === 'prominentPollutant') ? value : ((newDataset) ? Number(value) : Math.max(result.statParams.max, Number(value)));
                  result.statParams.latestValue = (paramName === 'prominentPollutant') ? value : Number(value);

                  if(paramName === 'windSpeedAvg') {
                    const wind = myInstance.getSpeednDir(dataob.windDirection, value);
                    const newWindset = (result.detailedStat.sum[wind.direction][wind.speed] === '') ? true : false;
                    result.detailedStat.count = (newDataset) ? 1 : (result.detailedStat.count + 1);
                    result.detailedStat.sum[wind.direction][wind.speed] = (newWindset) ? parseFloat(value) : (result.detailedStat.sum[wind.direction][wind.speed] + parseFloat(value));
                    result.detailedStat.min[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.min(result.detailedStat.min[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.max[wind.direction][wind.speed] = (newWindset) ? Number(value) : (Math.max(result.detailedStat.max[wind.direction][wind.speed], Number(value)));
                    result.detailedStat.latestValue[wind.direction][wind.speed] = Number(value);
                    result.detailedStat.allValue[wind.direction][wind.speed] = (newWindset) ? [Number(value)] : [...result.detailedStat.allValue[wind.direction][wind.speed], ...[Number(value)]];
                  }

                  dbInstance.updateDocument(collectionName, deviceQuery, result, function (errUpdate)
  								{
  									callBack(errUpdate);
  								});
								} else {
                    callBack(false);
                }

							}

						});

					}
					else
					{
						callBack(addErr);
					}
				});

			});



        }
        else {

            // error
            callBack(1)
        }

    }

    this.getReceivedTimeQueryJson = function (timeStart, timeEnd) {
        var res = null;
        if (timeStart != null && timeEnd != null) {
            res = [
                { "epoch": { $gte: parseInt(timeStart) } },
                { "epoch": { $lte: parseInt(timeEnd) } }
            ]
        }
        else if (timeStart != null) {
            res = [
                { "epoch": { $gte: parseInt(timeStart) } }
            ]
        }
        else if (timeEnd != null) {
            res = [
                { "epoch": { $lte: parseInt(timeEnd) } }
            ]
        }

        return res;

    }

    //this.getDailyStatParam = function (collectionName, paramNameList, timeFrom,timeTo,callBack) {

    //    var deviceQuery =
    //    {
    //        "paramName": { $in: paramNameList },
    //        $and: getReceivedTimeQueryJson(timeFrom, timeTo)
    //    }

    //    dbInstance.GetFilteredDocumentSorted(collectionName, deviceQuery, {}, { "epoch": -1 }, function (err, result)
    //    {

    //        if (err)
    //        {

    //            callBack(1, null)
    //        }
    //        else {
    //            callBack(null, result)
    //        }

    //    });
    //}

    this.getStatParam = function(collectionName,paramNameList,timeFrom,timeTo,limit,offset,callBack)
    {
        var timemax
        var timemin
        if(limit <20 && limit >14) limit =20
        //if(limit <10) limit =10
        var  statQuery =
        {
            "paramName": { $in: paramNameList },
            "epoch":{$gte:parseInt(timeFrom),$lte:parseInt(timeTo)}
        }
        if(timeFrom == null && timeTo == null){
            var statQuery=
            {
                "paramName":{$in: paramNameList}
            }
        }
        dbInstance.timeWindow(collectionName,{"epoch":-1},function(err,result){
            if(!err){
                timemax = parseInt(result)+parseInt(86400000)
            }
        })
        dbInstance.timeWindow(collectionName,{"epoch":1},function(err,result){
            if(!err){
                timemin = parseInt(result)
            }
        })

        if ( paramNameList == null || paramNameList.length <= 0)
            delete statQuery.paramName;
        if (statQuery.$and == null)
            delete statQuery.$and;

        dbInstance.GetFilteredDocumentSorted(collectionName, statQuery, { "_id": false, "epoch": false }, { "epoch": -1 }, limit, offset, function (err, result)
        {
	    if(timeTo >timemax || timeFrom <timemin){
		    callBack(1,null)
	    }
            if (err)
            {

                callBack(1,null)
            }
            else
            {

                callBack(null, result)
            }

        });
    }


    this.getStatParamCount = function (collectionName, paramNameList, timeFrom, timeTo, callBack) {

        var statQuery =
        {
            "paramName": { $in: paramNameList },
            $and: this.getReceivedTimeQueryJson(timeFrom, timeTo)

        }
        if ( paramNameList == null || paramNameList.length <= 0)
            delete statQuery.paramName;
        if (statQuery.$and == null)
            delete statQuery.$and;

        dbInstance.getDocumentCountByCriteria(collectionName, statQuery, function (err, result) {

            if (err) {

                callBack(1, null)
            }
            else {
                callBack(null, result)
            }

        });
    }

    this.getStatParamHourly = function(collectionName, paramNameList, timeFrom, timeTo, limit, offset, callBack)
    {
        var  statQuery = {
            "paramName": { $in: paramNameList },
            "key": {$gte:parseInt(timeFrom), $lt:parseInt(timeTo)}
        };

        if(timeFrom == null && timeTo == null){
            var statQuery= {
                "paramName":{$in: paramNameList}
            }
        }

        if ( paramNameList == null || paramNameList.length <= 0) {
            delete statQuery.paramName;
        }
        dbInstance.GetFilteredDocumentSorted(collectionName, statQuery, { "_id": false, "epoch": false }, { "epoch": -1 }, limit, offset, function (err, result)
        {
            if (err) {
                callBack(1,null)
            }
            else {
                callBack(null, result)
            }
        });
    }

}





// export the class
module.exports = {
    StatisticsManager
};
