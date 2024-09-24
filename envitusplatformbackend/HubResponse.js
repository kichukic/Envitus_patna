function HubResponse()
{
    this.status = 'ok';
    this.errorCode = 0;
    this.message = 'na';
    this.data     = null;

    this.getOkResponse = function()
    {
      this.status = 'ok';
      this.errorCode = 0;
      this.message = null;

      return this.toJsonString();
    }
    this.getErrorResponse = function(errorCode,errMsg)
    {
      this.status = 'error';
      this.errorCode = errorCode;
      this.message =  errMsg;
      this.data = null;

      return this.toJsonString();
    }

    this.getUserBlockedResponse = function () {
      this.status = 'error';
      this.errorCode = -1; // You can choose an appropriate error code for a blocked user.
      this.message = 'User is blocked. Try again later.';
      this.data = null;
      return this.toJsonString();
  }

    this.toJsonString = function(){

        return JSON.stringify(this);

    }

}


// export the class
module.exports =
 {
    HubResponse
 };
