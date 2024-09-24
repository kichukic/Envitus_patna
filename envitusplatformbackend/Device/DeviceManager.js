var deviceModule = require('./Device.js');

var DeviceFactoryModule = require('./DeviceFactory.js');
var devFactory = new DeviceFactoryModule.DeviceFactory();

var DatabaseHandlerModule = require('../DatabaseHandler.js');
var dbInstance = new  DatabaseHandlerModule.DatabaseHandler();

function DeviceManager()
{

    // returns the number of devices matching with city and zone informations
    this.getDeviceCountMatchWithCityZone = function (city,zone, callBack) {

        var deviceQuery = {};
        if (city != null) deviceQuery["location.city"] = city;

        dbInstance.getDocumentCountByCriteria('devices', deviceQuery, function (err, count) {
            if (err) {
                callBack(1, 0);
            }
            else {
                callBack(null, count);
            }
        });
    };

    this.getDeviceAtMatchWithCityZone = function (city, zone, index, callBack) {
        var deviceQuery = {};

        if (city != null ) deviceQuery["location.city"] = city;
        
        dbInstance.GetDocumentByCriteria('devices', index, deviceQuery, function (err, result) {

            if (err) {
                callBack(err,null);
            }
            else {
                callBack(null,result);
            }

        });

	};

	

	this.getDeviceIds = function(collectionName,callback){
		dbInstance.getDocumentId(collectionName,function(err,result){
			if(err){
				console.log('Err : ',err)
			}else{
				callback(null,result)
			}
		})
	}
	
	this.getDeviceAtMatchWithFamily = function (devfamily, index, callBack) {
        var deviceQuery = {};

        if (devfamily != null ) deviceQuery["devFamily"] = devfamily;
        
        dbInstance.GetDocumentByCriteria('devices', index, deviceQuery, function (err, result) {

            if (err) {
                callBack(err,null);
            }
            else {
                callBack(null,result);
            }

        });

    };



    this.getDeviceCount = function (query, callBack)
    {

        
		var deviceQuery;
		if (query === null) {
			deviceQuery = {};
		} else if (query != null) {
           
            var regExpDev = new RegExp(".*" + query.deviceId + ".*");
			var regExpZon = new RegExp(".*" + query.zone + ".*");
			var regExpCity = new RegExp(".*" + query.city + ".*");
			var regExpStype = new RegExp(".*" + query.subType + ".*");
			var activated = (query.activated === 'true') ? 
				{activated: true} : ((query.activated === 'false')) ?
				{activated: false} : {};
            deviceQuery  =
			{
			    $and: [
						activated,
						{ deviceId: { "$regex": regExpDev, "$options": "-i" } },
						{ "location.zone": { "$regex": regExpZon, "$options": "-i" } },
						{ "location.city": { "$regex": regExpCity, "$options": "-i" } },
						{ subType: { "$regex": regExpStype, "$options": "-i" } }
				]
			}
            
        }

        // use searchCriteria to filter the project from DB
        dbInstance.getDocumentCountByCriteria('devices', deviceQuery, function (err, count)
        {
            if (err)
            {
                callBack(1,0);
            }
            else
            {
                
                callBack(null,count);
            }
        });
    };
  

    this.getDeviceAt = function (query, index, callBack) {
        var deviceQuery;
        if (query != null && query.hasOwnProperty('substring')) 
		{
            
            var substring = query.substring;
            var regExp = new RegExp(".*" + substring + ".*");
           
            deviceQuery =
			{
			    $or: [
						{ devFamily: { "$regex": regExp, "$options": "-i" } }
			    ]
			}
        } 

        dbInstance.GetDocumentByCriteria('devices', index, deviceQuery, function (err, result) {

            if (err) {
                callBack(null);
            }
            else {
                callBack(result);
            }

        });

	};
	
	this.getDeviceDetails = function (index, callBack) {
		var excludeFields = { '_id': false };
		var devQuery  = {
			$and: [
				{ deviceId: index }
			]
		}

		dbInstance.GetAllDocumentByCriteria('devices', excludeFields, devQuery, 1, 0, function (err, result) {
			if (result.length === 0) {
				callBack(null);
			} else {
				callBack(result);

			}
		});
    };

    this.getAlldevices = function (query, limit, offset, callBack) {
		var excludeFields = { '_id': false };
		var regExpDev = new RegExp(".*" + query.deviceId + ".*");
		var regExpZon = new RegExp(".*" + query.zone + ".*");
		var regExpCity = new RegExp(".*" + query.city + ".*");
		var regExpStype = new RegExp(".*" + query.subType + ".*");
		var activated = (query.activated === 'true') ? 
			{activated: true} : ((query.activated === 'false')) ?
			{activated: false} : {};
		deviceQuery  =
			{
				$and: [
						activated,
						{ deviceId: { "$regex": regExpDev, "$options": "-i" } },
						{ "location.zone": { "$regex": regExpZon, "$options": "-i" } },
						{ "location.city": { "$regex": regExpCity, "$options": "-i" } },
						{ subType: { "$regex": regExpStype, "$options": "-i" } }
				]
			}
		dbInstance.GetAllDocumentByCriteria('devices', excludeFields, deviceQuery, limit, offset, function (err, result) {

			if (err) {
				callBack(null);

			}
			else {
				callBack(result);

			}

		});

	};
   

    this.getDeviceFromId = function (id, callBack)
    {
        var query = { "deviceId": id };
        var myInstance = this;
        dbInstance.GetDocumentByName('devices', query, function (err, result)
        {
            if (err)
            {
                callBack(null);
            }
            else
            {
               callBack(result);
            }

        });
    }
	
	this.registerDevice = function(deviceDetails,callBack)
	{

	    var device = null;//new deviceModule.Device();
	    device = devFactory.createDeviceInstanceFromSubType(deviceDetails.subType);
      device.parse(deviceDetails);
	 
	  var query = {};
	  query['deviceId'] = deviceDetails.deviceId;
	  dbInstance.IsDocumentExist('devices',query, function(err, result)
	  {
			
			if(result != 'success')
			{
				  dbInstance.insertDocument('devices',device);
				  callBack("success");
			}else
			{

				callBack("failed");
			}
	  });     
    }
	
	
	this.updateDevice = function (deviceDetails,callBack) {

	    var device = null;//new deviceModule.Device();
	    device = devFactory.createDeviceInstanceFromSubType(deviceDetails.subType);
	    device.parse(deviceDetails);

	    var query = {};
	    query['logicalDeviceId'] = device.logicalDeviceId;
	    var myInstance = this;

	    dbInstance.GetDocumentByName('devices', query, function (err, oldDevice)
	    {

	        if (err)
	        {
	            callBack(1, "No device found");
	        }
	        else
	        {
	            dbInstance.updateDocument('devices', query, device,function(err1){


	                if (err1) {
	                    callBack(1, "Error occured while updating device");
	                }
	                else
	                {
	                    callBack(null, "Device update");
	                }
	            });
	        }
	    });
	}
	
	this.removeDevice = function(deviceId,callBack)
	{
		var query = {};
		query['deviceId'] = deviceId;

		dbInstance.GetDocumentByName('devices',query,function(err, result)
        {
			if(err)
			{
				 callBack(1);
			}else
			{
				if(result != null)
				{
					dbInstance.removeDocument('devices',query,function(errFrmDevices){
						var docsToRemove = [result.logicalDeviceId, result.logicalDeviceId + "_stat_hourly", result.logicalDeviceId + "_stat_daily", result.logicalDeviceId + "_stat_monthly",
                            result.logicalDeviceId + "_stat_yearly", result.logicalDeviceId+"_raw"
						];
						var allDeviceDocRemoved = errFrmDevices ? false : true;
						docsToRemove.forEach(docName => {
							dbInstance.removeCollection(docName, function (err1) {
								if(err1){
									allDeviceDocRemoved = false;
								}
							})
						});

						if(allDeviceDocRemoved){
							callBack(null,"user delete")
						}
						else{
							callBack(1, "Error occured while deleting")
						}
					})
				}
                else
				{
					callBack(1);
				}
				
			}
					
        });
    };
}


// export the class
module.exports =
 {
    DeviceManager
 };
