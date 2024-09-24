var responseModule = require('../HubResponse.js')
var requestValidationModule = require('../RequestValidation.js');
var requestValidation = new requestValidationModule.RequestValidation();

var ThirdPartyUserManagerModule = require('../ThirdPartyUser/ThirdPartyUserManager.js')
var ThirdPartyUserManager = new ThirdPartyUserManagerModule.ThirdPartyUserManager()



function ThirdPartyUserApi(express) {
	express.post('/thirdpartyuser', function (req, res) {

		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function (result) {
			if (result == null) {
				response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);

			} else {
				if (req.body != null) {

					ThirdPartyUserManager.saveThirdPartyUser(req.body, function (result) {
						var hubResponse = new responseModule.HubResponse();
						var response = null;
						
						if (result == 'success') {

							res.end(hubResponse.getOkResponse());
						}
						else {

							res.end(hubResponse.getErrorResponse(-1, "A project with same id already exist"));

						}
					});
				} else {
					res.end(hubResponse.getErrorResponse(-1, "Invalid request"));
				}
			}
		});

	});

	express.get('/thirdpartyuser/count', function (req, res) {

		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function (result) {
			if (result == null) {
				response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);
			} else {
				response = hubResponse.getOkResponse();
				var query = {};
				query.activated = req.query.activated;
				query.name = (req.query.name === 'null') ? '' : req.query.name;
				ThirdPartyUserManager.getThirdPartyUserCount(query, function (err, count) {
					if (err != null) {
						response = hubResponse.getErrorResponse(-1, "Invalid request from client");
						res.end(response);
					} else {
						hubResponse = new responseModule.HubResponse();
						var response = null;
						
						hubResponse.data = { ThirdPartyUserCount: count };
						response = hubResponse.getOkResponse();
						res.end(response);
					}
				});
			}
		});
	});

	express.get('/thirdpartyuser/:index/', function (req, res) {
		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function(result) {
			if(result == 'failed'){
				response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);
			} else{
				ThirdPartyUserManager.getThirdPartyUserAt(req.query, req.params.index, function (result) {
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
	});

	express.get('/thirdpartyuser', function (req, res) {
		
		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function(result) {
			if(result == 'failed'){
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
				query.name = (req.query.name === 'null') ? '' : req.query.name;
				ThirdPartyUserManager.getAllThirdPartyUsers(query, numberOfRecords, offset, function (result) {
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
	});

	express.put('/thirdpartyuser', function (req, res) {
		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isValidUser(req, res, function (result) {
			if (result == null) {
				response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);

			}
			else {
				{
					ThirdPartyUserManager.updateThirdPartyUser(req.body, function (err, msg) {

						if (!err) {
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

	express.delete('/thirdpartyuser', function (req, res) {

		var slpResponse = new responseModule.HubResponse();
		var response = null
		requestValidation.isValidUser(req, res, function (result) {
			if (result == null) {
				response = slpResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);

			}
			else {
				ThirdPartyUserManager.removeThirdPartyUser(req.query.uName, function (err) {
					var slpResponse = new responseModule.HubResponse();
					var response = null;
					if (err) {
						response = slpResponse.getErrorResponse(-1, "Error occured in deleting ThirdPartyUser");
					}
					else {
						response = slpResponse.getOkResponse();
					}
					res.end(response);
				})
			}
		});

	});
}

module.exports = {
	ThirdPartyUserApi
}