
var responseModule = require('../HubResponse');

var requestValidationModule = require('../RequestValidation.js');
var requestValidation = new requestValidationModule.RequestValidation();

var ESPATNAOTDRSpecModule = require('../DeviceSpec/ESPATNAOTDRSpec.js');

function DeviceSpecApi(express) {
	express.get('/device/spec', function (req, res) {


		var hubResponse = new responseModule.HubResponse();
		var response = null;
		requestValidation.isSuperUser(req, res, function (result) {

			if (result == null) {
				response = hubResponse.getErrorResponse(-10, "Invalid request from client");
				res.end(response);

			}
			else {
				let deviceType = req.query.type || process.env.DEFAULT_DEVICE_TYPE;
				var devSpec = new ESPATNAOTDRSpecModule.ESPATNAOTDRSpec();
				hubResponse.data = devSpec;
				response = hubResponse.getOkResponse();
				res.end(response);
			}
		});

	});
}

// export the class
module.exports =
{
	DeviceSpecApi
};
