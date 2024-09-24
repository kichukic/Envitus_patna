
var DatabaseHandlerModule = require('./DatabaseHandler.js');
var dbInstance = new  DatabaseHandlerModule.DatabaseHandler();

var jwtService = require('./jwtService.js');
const bcrypt = require('bcryptjs');
const useragent = require('useragent');
useragent(true);

function RequestValidation()
{

	this.isValidUser = async function(req, res, callBack)
    {
		try {
			let token;
			if (!req.headers.authorization) {
				callBack(null);
			}
			token = req.headers.authorization.split(" ");
			const isValid = await jwtService.decodeJwt(token[1]);
			console.log("the decode done iks  >>> > > > ",isValid)

			if (isValid == 'Not Valid')
			{
				callBack(null);
			} else {
				callBack("success");
			}
		} catch (err) {
            callBack(null);
        }

	}

	this.checkUser = function(ssoId,password,callBack)
    {
		var query = {
			userName: ssoId,
			activated: true
		};
		dbInstance.GetDocumentByName('users', query, function(err, result)
		{
			if(result) {
				//console.log(".the user is  > >> > >",result.role)
				bcrypt.compare(password, result.password, async function(err, res) {
					if(res === true) {
						const token = await jwtService.getJwt({
							user_id: ssoId,
							role: result.role
						});
						callBack({"token": token});
					} else {
						callBack(null);
					}
				});
			} else {
				callBack(null);
			}
		});
    }

	this.isSuperUser = async function(req, res, callBack) {
		try {
			let token;
			if (!req.headers.authorization) {
				callBack(null);
			}
			token = req.headers.authorization.split(" ");
			const decodedToken = await jwtService.decodeJwt(token[1]);
	
			if (decodedToken && decodedToken.role === 'Super Admin') {
				// If the user is a superuser, allow access
				callBack("success");
			} else {
				// If the user is not a superuser, deny access
				callBack(null);
			}
		} catch (err) {
			callBack(null);
		}
	}
	





	this.userAgentHandler = function(req, res, next) {
			const agent = useragent.parse(req.headers['user-agent']);
			const deviceInfo = Object.assign({}, {
				device: agent.device,
				os: agent.os,
			});
			req.device = deviceInfo;
			next();
	}

	this.authOneLogin = async function(data, callback) {
		console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>",data.req.user.nameID)
		if(data.req.user.nameID) {
			const token = await jwtService.getJwt({
					user_id: data.req.user.nameID
			});
				callback({"token": token, "userId": data.req.user.nameID});
		} else {
				callback(null);
		}
	}

}
// export the class
module.exports =
 {
    RequestValidation
 };
