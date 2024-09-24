function User() {

    this.name = null;
    this.email = null;
    this.contact = null;
    this.role = null;
    this.userName = null;
    this.password = null;
    this.activated = null;
    this.creationLog = null;
    this.deactLog = null;
    this.devices = null;

    this.toJson = function () {
        return JSON.stringify(this)
    }


}

User.prototype.toJson = function () {
    return JSON.stringify(this);
}

User.prototype.parse = function (userDetails) {
   
    this.name = userDetails.name;
    this.email = userDetails.email;
    this.contact = userDetails.contact;
    this.role = userDetails.role;
    this.userName = userDetails.userName;
    this.password = userDetails.password;
    this.activated = userDetails.activated;
    this.creationLog = userDetails.creationLog;
    this.deactLog = userDetails.deactLog;
    this.devices = userDetails.devices;


}



module.exports = {
    User
}