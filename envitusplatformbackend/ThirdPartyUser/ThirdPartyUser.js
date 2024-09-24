var uuidv1=require('uuid/v1')
function ThirdPartyUser() {

    this.name = null;
    this.limit=null;
    this.apikey = null;
    this.counter=null;
    this.activated = null;
    this.creationLog = null;
    this.deactLog = null;

    this.toJson = function () {
        return JSON.stringify(this)
    }
}

ThirdPartyUser.prototype.toJson = function () {
    return JSON.stringify(this);
}

ThirdPartyUser.prototype.parse = function (ThirdPartyUserDetails) {
   
    this.name = ThirdPartyUserDetails.name;
    this.limit=ThirdPartyUserDetails.limit;
    this.apikey = uuidv1();
    this.counter=[0,0,0,0]   
    this.activated = ThirdPartyUserDetails.activated;
    this.creationLog = ThirdPartyUserDetails.creationLog;
    this.deactLog = ThirdPartyUserDetails.deactLog;
}
    
module.exports = {
    ThirdPartyUser
}