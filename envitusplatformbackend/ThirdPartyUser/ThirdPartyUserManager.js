var ThirdPartyUserModule = require('./ThirdPartyUser.js')
ThirdPartyUserFactoryModule = require('./ThirdPartyUserFactory.js')
var ThirdPartyUserFactory = new ThirdPartyUserFactoryModule.ThirdPartyUserFactory()

var DatabaseHandlerModule = require('../DatabaseHandler.js')
var dbInstance = new DatabaseHandlerModule.DatabaseHandler()

var ThirdPartyUserJSONModule=require('./ThirdPartyUserJSON.js')
var thirdPartyUserJSON=new ThirdPartyUserJSONModule.thirdPartyUserJSON()

function ThirdPartyUserManager() {
	
	this.saveThirdPartyUser = function (ThirdPartyUserDetails, callBack) {

		var ThirdPartyUser = null;
		ThirdPartyUser = ThirdPartyUserFactory.createThirdPartyUserInstance(ThirdPartyUserDetails);
		ThirdPartyUser.parse(ThirdPartyUserDetails);
		// thirdPartyUserJSON.dataJSON(ThirdPartyUser)

		var query = {};
		query['name'] = ThirdPartyUserDetails.name;
		dbInstance.IsDocumentExist('ThirdPartyUsers', query, function (err, result) {

			if (result != 'success') {
				dbInstance.insertDocument('ThirdPartyUsers', ThirdPartyUser);
				thirdPartyUserJSON.initArray()
				callBack("success");
			} else {

				callBack("failed");
			}
		});
	}

	this.getThirdPartyUserCount = function (query, callBack) {
		var ThirdPartyUserQuery;
		if (query == null)
            query = "";
        if (query != null)
        {
           
            var regExpNam = new RegExp(".*" + query.name + ".*");
			var activated = (query.activated === 'true') ? 
				{activated: true} : ((query.activated === 'false')) ?
				{activated: false} : {};
			ThirdPartyUserQuery  =
			{
			    $and: [
						activated,
						{ name: { "$regex": regExpNam, "$options": "-i" } }
				]
			}
            
        }
		dbInstance.getDocumentCountByCriteria('ThirdPartyUsers', ThirdPartyUserQuery, function (err, count) {
			if (err) {
				callBack(1, 0);
			} else {

				callBack(null, count);
			}
		});
	};

	this.getThirdPartyUserAt = function (query, index, callBack) {
		var ThirdPartyUserQuery ={};
		if (query != null && query.hasOwnProperty('substring')) {

			var substring = query.substring;
			var regExp = new RegExp(".*" + substring + ".*");

			ThirdPartyUserQuery = {};
		}

		dbInstance.GetDocumentByCriteria('ThirdPartyUsers', index, ThirdPartyUserQuery, function (err, result) {

			if (err) {
				callBack(null);
			}
			else {
				callBack(result);

			}

		});

	};

	this.getAllThirdPartyUsers = function (query, limit, offset, callBack) {
		var ThirdPartyUserQuery;
		var excludeFields = { '_id': false };
		var regExpNam = new RegExp(".*" + query.name + ".*");
		var activated = (query.activated === 'true') ? 
			{activated: true} : ((query.activated === 'false')) ?
			{activated: false} : {};
		ThirdPartyUserQuery  = {
			$and: [
					activated,
					{ name: { "$regex": regExpNam, "$options": "-i" } }
			]
		}
		dbInstance.GetAllDocumentByCriteria('ThirdPartyUsers', excludeFields, ThirdPartyUserQuery, limit, offset, function (err, result) {

			if (err) {
				callBack(null);

			}
			else {
				callBack(result);

			}

		});

	};

	this.updateThirdPartyUser = function (ThirdPartyUserDetails,callBack) {
		var ThirdPartyUser = null;
		ThirdPartyUser = ThirdPartyUserFactory.createThirdPartyUserInstance(ThirdPartyUserDetails);
		ThirdPartyUser.parse(ThirdPartyUserDetails);

	    var query = {};
	    query['name'] = ThirdPartyUserDetails.name;
	    var myInstance = this;

	    dbInstance.GetDocumentByName('ThirdPartyUsers', query, function (err, oldUser)
	    {

	        if (err)
	        {
	            callBack(1, "No user found");
	        }
	        else
	        {
	            dbInstance.updateDocument('ThirdPartyUsers', query, ThirdPartyUser,function(err1){
	                if (err1) {
	                    callBack(1, "Error occured while updating key");
	                }
	                else
	                {
	                    callBack(null, "Key update");
	                }
	            });
	        }
	    });
	}
	
	this.removeThirdPartyUser = function(uName,callBack)
	{
		var query = {};
		query['name'] = uName;

		dbInstance.GetDocumentByName('ThirdPartyUsers',query,function(err, result)
        {
			if(err)
			{
				 callBack(1);
			}else
			{
				if(result != null)
				{
				    
			
					dbInstance.removeDocument('ThirdPartyUsers',query,function(err1){
						if(err1){
							callBack(1, "Error occured while deleting")
						}
						else{
							callBack(null,"ThirdPartyUser delete")
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
	
	this.isThirdPartyUserExist = function(query, callBack){

		dbInstance.IsDocumentExist('ThirdPartyUsers',query,function(err,result){
			
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

	ThirdPartyUserManager
}