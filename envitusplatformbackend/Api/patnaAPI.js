
var  responseModule =  require('../HubResponse');
var  requestValidationModule =  require('../RequestValidation.js');
var requestValidation = new  requestValidationModule.RequestValidation();
var DeviceManagerModule = require('../Device/DeviceManager.js');
var deviceManager = new  DeviceManagerModule.DeviceManager();
var thirdpartyrequestValidationModule = require('../ThirdPartyRequestValidation.js')
var thirdpartyrequestValidation = new thirdpartyrequestValidationModule.ThirdPartyRequestValidation();

const rateLimit = new require("express-rate-limit");
const apiLimiter = rateLimit({
    windowMs: 1000 * 60 * 60,
    max: 100,
});
 
 
 
 express.get('/device-list',function(req,res){
	res.send("ok")
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