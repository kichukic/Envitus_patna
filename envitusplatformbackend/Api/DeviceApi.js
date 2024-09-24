
var  responseModule =  require('../HubResponse');

var  requestValidationModule =  require('../RequestValidation.js');
var requestValidation = new  requestValidationModule.RequestValidation();

var DeviceManagerModule = require('../Device/DeviceManager.js');
var deviceManager = new  DeviceManagerModule.DeviceManager();
//deviceManager.getDeviceFromId("f3e22c7fcf5c",function(res){
//    if (res!=null)
//    {

//    }

//});

var thirdpartyrequestValidationModule = require('../ThirdPartyRequestValidation.js')
var thirdpartyrequestValidation = new thirdpartyrequestValidationModule.ThirdPartyRequestValidation();

const rateLimit = new require("express-rate-limit");

const apiLimiter = rateLimit({

    windowMs: 1000 * 60 * 60,
    max: 100,


});

function DeviceApi(express)
{

    express.get('/device/deployment', function (req, resHttp) {


        var hubResponse = new responseModule.HubResponse();
        var response = null;
        requestValidation.isValidUser(req, res, function (result) {

            if (result == null) {
                response = hubResponse.getErrorResponse(-10, "Invalid request from client");
                resHttp.end(response);

            } else {

                var depolymentInfo = [];
                var city = req.query.city;
                var zone = req.query.zone;

                if (city == null && zone!=null) {
                    response = hubResponse.getErrorResponse(-2, "Invalid request from client,Not enough parameters");
                    resHttp.end(response);

                }
                else {

                    
                    var depolymentInfo_Find = function (city, zone) {
                        var indexFound = -1;
                        for (var j = 0; j < depolymentInfo.length; j++) {
                            if (depolymentInfo[j].city == city && depolymentInfo[j].zone == zone) {
                                indexFound = j;
                                break;

                            }
                        }
                        return indexFound;
                    }

                    deviceManager.getDeviceCountMatchWithCityZone(city, zone, function (err, count)
                    {

                        var i = 0;

                        var fetchDeviceInfo = function () {

                            deviceManager.getDeviceAtMatchWithCityZone(city, zone,i, function (err, res) {

                                
                                if (!err) {
                                    
                                    var tcity = null;
                                    var tzone = null;
                                    if (res.location != null) {
                                        tcity = res.location.city == null ? "" : res.location.city;
                                        tzone = res.location.zone == null ? "" : res.location.zone;
                                    }

                                    var fd = depolymentInfo_Find(tcity, tzone);
                                    if (fd == -1) {
                                        depolymentInfo.push({
                                            "city": tcity,
                                            "zone": tzone,
                                            "devices": [{ "deviceId": res.deviceId, "devFamily": res.devFamily,"subType":res.subType }]
                                        });
                                       

                                    }
                                    else
                                    {
                                        var devList = depolymentInfo[fd].devices;
                                        devList.push({ "deviceId": res.deviceId, "devFamily": res.devFamily, "subType": res.subType });
                                       
                                    }
                                }

                                i++;
                                if (i < count)
                                    fetchDeviceInfo();
                                else {
                                    
                                    hubResponse = new responseModule.HubResponse();
                                    hubResponse.data = { "deploymentInfo": depolymentInfo };
                                    var response = hubResponse.getOkResponse();
                                    resHttp.end(response);
                                }

                            });

                            
                        }

                        if (i < count)
                            fetchDeviceInfo();
                    });

                    
                }
            }
        });




    });

    express.get('/device/count', function (req, res) 
	{
		

		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res,function(result)
		{
			
			if(result == null)
			{
				response  = hubResponse.getErrorResponse(-10,"Invalid request from client");
				res.end(response);
				
			}else
			{
				response = hubResponse.getOkResponse();
				var query = {};
				query.activated = req.query.activated;
				query.deviceId = (req.query.deviceId === 'null') ? '' : req.query.deviceId;
				query.city = (req.query.city === 'null') ? '' : req.query.city;
				query.zone = (req.query.zone === 'null') ? '' : req.query.zone;
				query.subType = (req.query.subType === 'null') ? '' : req.query.subType;		
				deviceManager.getDeviceCount(query , function (err, count)
				{
				    if (err!=null)
				    {
				        response  = hubResponse.getErrorResponse(-1,"Invalid request from client");
				        res.end(response);
				    }
				    else
				    {
				        hubResponse = new responseModule.HubResponse();
				        var response = null;
				       
				        hubResponse.data = { deviceCount: count };
				        response = hubResponse.getOkResponse();
				        res.end(response);
				    }
				});
				
			}
		});
	
  });
  
   
  express.get('/device/:index/', function (req, res)
  {
	
		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function (result)
		{
			if(result == null)
			{
				response  = hubResponse.getErrorResponse(-10,"Invalid request from client");
				res.end(response);
				
			}else
			{
				deviceManager.getDeviceAt(req.query,req.params.index,function(result)
				{
					var hubResponse = new responseModule.HubResponse();
					var response = null;
					if (result!=null)
					{
						hubResponse.data = result;
						response  = hubResponse.getOkResponse();
					}
					else
					{
						response  = hubResponse.getErrorResponse(-1,"Not found");
					}
					res.end(response);
				});
			}
		});

  });


 
  express.get('/device-list',function(req,res){
	var hubResponse = new responseModule.HubResponse();
	var response = null;
	requestValidation.isValidUser(req, res, function(result) {
		if(result == null){
			response = hubResponse.getErrorResponse(-10, "Invalid request from client");
			res.end(response);
		} else{
			deviceManager.getDeviceIds('devices',(err,result)=>{
				if(err){
					return null
				}else{
					hubResponse.data = {"devices":result}
					response = hubResponse.getOkResponse();
					res.send(response)
					console.log(response)
				}
			})
		}
	});
})

  express.get('/device/v1/:index/', function (req, res) {
	express.use(apiLimiter);
	var hubResponse = new responseModule.HubResponse();

	thirdpartyrequestValidation.checkUser(req.query.apikey, function (result) {
		if (result == 'failure'){
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
			deviceManager.getDeviceDetails(req.params.index, function(result) {
					var hubResponse = new responseModule.HubResponse();
					var response = null;
					if (result!=null) {
						hubResponse.data = result;
						response  = hubResponse.getOkResponse();
					} else {
						response  = hubResponse.getErrorResponse(-1,"Not found");
					}
					res.end(response);
			});
		}
	});
});

  

  express.get('/device', function (req, res) {
	var hubResponse = new responseModule.HubResponse();
	var response = null;
	requestValidation.isValidUser(req, res, function(result) {
		if(result == null){
			response = hubResponse.getErrorResponse(-10, "Invalid request from client");
			res.end(response);
		} else{
			var numberOfRecords = 10;
			var offset = 0;
			var query = {}
			if (req.query.limit != null)
				numberOfRecords = parseInt(req.query.limit);
			if (req.query.offset != null)
				offset = parseInt(req.query.offset);
			query.activated = req.query.activated;
			query.deviceId = (req.query.deviceId === 'null') ? '' : req.query.deviceId;
			query.city = (req.query.city === 'null') ? '' : req.query.city;
			query.zone = (req.query.zone === 'null') ? '' : req.query.zone;
			query.subType = (req.query.subType === 'null') ? '' : req.query.subType;
				deviceManager.getAlldevices(query, numberOfRecords, offset, function (result) {
				var hubResponse = new responseModule.HubResponse();
				var response = null;
				if(result != null) {
					hubResponse.data = result;
					response = hubResponse.getOkResponse();
				} else {
					response = hubResponse.getErrorResponse(-1, "Not found");
				}
				res.end(response);
			});
		}
	});
  })
  

  express.post('/device', function (req, res)
  {

		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isSuperUser(req, res, function (result)
		{
			if(result == null)
			{
				response  = hubResponse.getErrorResponse(-10,"Invalid request from client");
				res.end(response);
				
			}else
			{
				if (req.body!= null)
				{
					
					deviceManager.registerDevice(req.body, function (result)
					{
						var hubResponse = new responseModule.HubResponse();
						var response = null;
						
						if (result == 'success')
						{

							res.end(hubResponse.getOkResponse());
						}
						else
						{

							res.end(hubResponse.getErrorResponse(-1,"A project with same id already exist"));
							
						}
					});
				}else
				{
					res.end(hubResponse.getErrorResponse(-1,"Invalid request"));
				}
			}
		});
     
  });

  
  express.put('/device', function (req, res)
  {

		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isSuperUser(req, res, function (result)
		{
			if(result == null)
			{
			    response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);
				
			}
			else
			{
			    {
			        deviceManager.updateDevice(req.body, function (err, msg) {

			            if (!err){
			                res.end(hubResponse.getOkResponse());

			            }
			            else {

			                response = hubResponse.getErrorResponse(-1, msg);
			                res.end(response);

			            }

			        });
			    }
			}
		});
		
      
  });


  express.delete('/device', function (req, res)
  {
		
		var slpResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isSuperUser(req, res, function (result)
		{
			if(result == null)
			{
				response  = slpResponse.getErrorResponse(-10,"Invalid request from client");
				res.end(response);
				
			}
			else
			{
			    deviceManager.removeDevice(req.query.deviceId, function (err) {
			        var slpResponse = new responseModule.HubResponse();
			        var response = null;
			        if (err) {
			            response = slpResponse.getErrorResponse(-1, "Error occured in deleting device");
			        }
			        else
			        {
			            response = slpResponse.getOkResponse();
			        }
			        res.end(response);
			    })
			}
		});
	
  });

  

}

// export the class
module.exports =
 {
    DeviceApi
 };
