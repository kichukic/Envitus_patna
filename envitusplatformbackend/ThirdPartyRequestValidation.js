var DatabaseHandlerModule = require('./DatabaseHandler.js');
var dbInstance = new  DatabaseHandlerModule.DatabaseHandler();

var ThirdPartyUserJSONModule=require('./ThirdPartyUser/ThirdPartyUserJSON.js')
var thirdPartyUserJSON=new ThirdPartyUserJSONModule.thirdPartyUserJSON()

function ThirdPartyRequestValidation()
{	
	
	var myInstance=this

	this.isValidThirdPartyuser=function(apikey,num,callBack)
	{
		var query = {};
		var i,scounter,val;
		thirdPartyUserJSON.initArray();
			query['apikey'] = apikey;
			
				dbInstance.GetDocumentByName('ThirdPartyUsers',query,function(err,result){
					if(result) //== 'success')
					{
					
					result.counter[num-1]= result.counter[num-1]+1;
					 dbInstance.updateDocument('ThirdPartyUsers',query,{"counter":result.counter},function(err,r){

					 })
					
					if (result.counter[num-1]>result.limit){
						callBack("limit")
					}
				
					callBack("success");
				}
				else
				{
					callBack(null);
				}

				})
				
	}

	
	this.checkUser = function(apikey, callBack) {
		var query = {
			apikey: apikey,
			activated: true
		};
		dbInstance.IsDocumentExist('ThirdPartyUsers', query, function(err, result) {
			if(result == 'success') {
				callBack("success");
			} else {
				callBack("failure");
			}
		})
	}

	// this.isValidThirdPartyuser2=function(apikey,callBack)
	// {
	// 	var query = {};
	// 	// var counter=0;	
	// 	myInstance.counter2=myInstance.counter2 +1;
	// 		query['apikey'] = apikey;
			
	// 			dbInstance.GetDocumentByName('ThirdPartyUsers',query,function(err,result1){

	// 				if (myInstance.counter2>result1.limit){
	// 					callBack("limit")
	// 				}
	// 				if(result1) //== 'success')
	// 			{
	// 				callBack("success");
	// 			}else
	// 			{
	// 				callBack(null);
	// 			}

	// 			})
				
	// }

	// this.isValidThirdPartyuser3=function(apikey,callBack)
	// {
	// 	var query = {};
	// 	// var counter=0;	
	// 	myInstance.counter3=myInstance.counter3 +1;
	// 		query['apikey'] = apikey;
			
	// 			dbInstance.GetDocumentByName('ThirdPartyUsers',query,function(err,result1){

	// 				if (myInstance.counter3>result1.limit){
	// 					callBack("limit")
	// 				}
	// 				if(result1) //== 'success')
	// 			{
	// 				callBack("success");
	// 			}else
	// 			{
	// 				callBack(null);
	// 			}

	// 			})
				
	// }

	// this.isValidThirdPartyuser4=function(apikey,callBack)
	// {
	// 	var query = {};
	// 	// var counter=0;	
	// 	myInstance.counter4=myInstance.counter4 +1;
	// 		query['apikey'] = apikey;
			
	// 			dbInstance.GetDocumentByName('ThirdPartyUsers',query,function(err,result1){

	// 				if (myInstance.counter4>result1.limit){
	// 					callBack("limit")
	// 				}
	// 				if(result1) //== 'success')
	// 			{
	// 				callBack("success");
	// 			}else
	// 			{
	// 				callBack(null);
	// 			}

	// 			})
				
	// }
}

module.exports={
    ThirdPartyRequestValidation
}
