var userModule = require('./User.js')
UserFactoryModule = require('./UserFactory.js')
var userFactory = new UserFactoryModule.UserFactory()

var DatabaseHandlerModule = require('../DatabaseHandler.js')
var dbInstance = new DatabaseHandlerModule.DatabaseHandler()

const bcrypt = require('bcryptjs');
const saltRounds = 10;

function UserManager() {

	this.saveUser = function (userDetails, callBack) {

		var user = null;
		user = userFactory.createUserInstance(userDetails);

		user.parse(userDetails);

		var query = {};
		query['userName'] = userDetails.userName;
		dbInstance.IsDocumentExist('users', query, async function (err, result) {

			if (result != 'success') {
				var password = await new Promise(resolve => {
					bcrypt.hash(user.password, saltRounds, (err, hash) => {
						if(err) {
							callBack("failed");
						} else {
							resolve(hash)
						}
					});
				});
				user["password"] = password;
				dbInstance.insertDocument('users', user);
				callBack("success");
			} else {

				callBack("failed");
			}
		});
	}

	this.getUserCount = function (query, callback) {
		var userQuery;
        if (query == null)
            query = "";
        if (query != null)
        {
           
            var regExpNam = new RegExp(".*" + query.name + ".*");
			var regExpRol = new RegExp(".*" + query.role + ".*");
			var activated = (query.activated === 'true') ? 
				{activated: true} : ((query.activated === 'false')) ?
				{activated: false} : {};
			userQuery  =
			{
			    $and: [
						activated,
						{ name: { "$regex": regExpNam, "$options": "-i" } },
						{ role: { "$regex": regExpRol, "$options": "-i" } },
						{ role: { $ne: "Super Admin" } }
				]
			}
            
        }
		dbInstance.getDocumentCountByCriteria('users', userQuery, function (err, count) {
			if (err) {
				callback(1, 0);

			} else {

				callback(null, count);
			}
		});
	};

	this.getUserAt = function (query, index, callBack) {
		var userQuery ={};

		if (query != null && query.hasOwnProperty('substring')) {

			var substring = query.substring;
			var regExp = new RegExp(".*" + substring + ".*");

			userQuery = {};
		}

		dbInstance.GetDocumentByCriteria('users', index, userQuery, function (err, result) {

			if (err) {
				callBack(null);

			}
			else {
				callBack(result);

			}

		});

	};

	this.getAllUsers = function (query, limit, offset, callBack) {
		var userQuery;
		var excludeFields = { '_id': false };
		var regExpNam = new RegExp(".*" + query.name + ".*");
		var regExpRol = new RegExp(".*" + query.role + ".*");
		var activated = (query.activated === 'true') ? 
			{activated: true} : ((query.activated === 'false')) ?
			{activated: false} : {};
		userQuery  =
			{
				$and: [
						activated,
						{ name: { "$regex": regExpNam, "$options": "-i" } },
						{ role: { "$regex": regExpRol, "$options": "-i" } },
						{ role: { $ne: "Super Admin" } }
				]
			}
		dbInstance.GetAllDocumentByCriteria('users', excludeFields, userQuery, limit, offset, function (err, result) {

			if (err) {
				callBack(null);

			}
			else {
				callBack(result);

			}

		});

	};

	this.updateUser = function (userDetails,callBack) {
		var user = null;
		user = userFactory.createUserInstance(userDetails);
		user.parse(userDetails);

	    var query = {};
	    query['userName'] = userDetails.userName;
	    var myInstance = this;

	    dbInstance.GetDocumentByName('users', query, async function (err, oldUser)
	    {
			if(oldUser) {
				if(user.password !== oldUser.password) {
					var password = await new Promise(resolve => {
						bcrypt.hash(user.password, saltRounds, (err, hash) => {
							if(err) {
								callBack(1, "Error occured while updating user");
							} else {
								resolve(hash)
							}
						});
					});
					user["password"] = password;
				}
				dbInstance.updateDocument('users', query, user,function(err1){


	                if (err1) {
	                    callBack(1, "Error occured while updating user");
	                }
	                else
	                {
	                    callBack(null, "user update");
	                }
	            });
			} else {
				callBack(1, "No user found");
			}
	    });
	}

	this.removeUser = function(uName,callBack)
	{
		var query = {};
		query['userName'] = uName;

		dbInstance.GetDocumentByName('users',query,function(err, result)
        {
			if(err)
			{
				 callBack(1);
			}else
			{
				if(result != null)
				{
					dbInstance.removeDocument('users',query,function(err1){
						if(err1){
							callBack(1, "Error occured while deleting")
						}
						else{
							callBack(null,"user delete")
						}
					}
					
					
					)}
                else
				{
					callBack(1);
				}
				
			}
					
        });
	};
	
	this.isUserExist = function(query, callBack){

		dbInstance.IsDocumentExist('users',query,function(err,result){
			
			if (err) {
				callBack(null);
			}
			else {
				callBack(result);
			}
		});
		
	}

    
}

module.exports = {

	UserManager
}