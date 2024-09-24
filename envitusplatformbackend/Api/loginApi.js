var responseModule = require('../HubResponse.js')
var requestValidationModule = require('../RequestValidation.js');
var requestValidation = new requestValidationModule.RequestValidation();

var DatabaseHandlerModule = require('../DatabaseHandler.js');
var dbInstance = new DatabaseHandlerModule.DatabaseHandler();
const Saml2js = require('saml2js');
const passport = require('passport')
const passportSaml = require('passport-saml');


const loginAttempts = new Map();
function LoginApi(express) {

    var path;
    express.post('/login', function (req, res) {
        console.log("call received inside lolgin api > > > > > > > > > > > > > >")
        var hubResponse = new responseModule.HubResponse();
        var response = null;

        const userName = req.query.userName;
        const password = req.query.password;

        // Check if the user is already blocked.
        if (isUserBlocked(userName)) {
            response = hubResponse.getUserBlockedResponse();
            console.log("what handled in data >> >>> > ",response)
           return  res.end(response);
        } else {
            // Check if there have been more than 5 failed login attempts.
            if (incrementLoginAttempts(userName) > 5) {
                // Block the user for 10 minutes.
                blockUser(userName, 10 * 60 * 1000); // 10 minutes in milliseconds
                response = hubResponse.getErrorResponse(-1, "blocked . . . . .. . .");
                res.end(response);
            } else {
                // Attempt to validate the user's credentials here.
                requestValidation.checkUser(userName, password, function (result) {
                    if (result == null) {
                        response = hubResponse.getErrorResponse(-1, "Invalid username or password.");
                        res.end(response);
                    } else {
                        // Reset login attempts on successful login.
                        resetLoginAttempts(userName);
                        hubResponse.data = result;
                        response = hubResponse.getOkResponse();
                        res.end(response);
                    }
                });
            }
        }
    });

    // Helper function to increment login attempts.
    function incrementLoginAttempts(userName) {
        const attempts = loginAttempts.get(userName) || 0;
        loginAttempts.set(userName, attempts + 1);
        return attempts + 1;
    }

    // Helper function to reset login attempts.
    function resetLoginAttempts(userName) {
        loginAttempts.delete(userName);
    }

    // Helper function to check if a user is blocked.
    function isUserBlocked(userName) {
        return loginAttempts.has(userName) && loginAttempts.get(userName) >= 5;
    }

    // Helper function to block a user for a specified duration.
    function blockUser(userName, duration) {
        setTimeout(() => {
            resetLoginAttempts(userName);
        }, duration);
    }






    /**
     * This Route Authenticates req with IDP
     * If Session is active it returns saml response
     * If Session is not active it redirects to IDP's login form
     */
    express.get('/login/sso',
      passport.authenticate('saml', {
        successRedirect: '/',
        failureRedirect: '/login',
      })
    )

    /**
     * This is the callback URL
     * Once Identity Provider validated the Credentials it will be called with base64 SAML req body
     * Here we used Saml2js to extract user Information from SAML assertion attributes
     * If every thing validated we validates if user email present into user DB.
     * Then creates a session for the user set in cookies and do a redirect to Application
     */
    express.post('/login/sso/callback',
      requestValidation.userAgentHandler,
      passport
        .authenticate('saml', { failureRedirect: '/', failureFlash: true }), (req, res, next) => {
        const xmlResponse = req.body.SAMLResponse;
        const parser = new Saml2js(xmlResponse);
        req.samlUserObject = parser.toObject();
        next();
      },
      (req, res) => requestValidation.authOneLogin(res, function (result) {
          var hubResponse = new responseModule.HubResponse();
          var response = null;
          if (result == null) {
              response = hubResponse.getErrorResponse(-1, "Invalid request from client");
              res.end(response);

          } else {
              hubResponse.data = result;
              response = hubResponse.getOkResponse();
              res.end(response)

          }
      })
    )

    express.post('/loginprivilegehide', function (req, res) {
        var hubResponse = new responseModule.HubResponse();

        var response = null;
        var response1 = null
        var arr = []
        var loggedname = { 'userName': req.query['0'] }

        dbInstance.GetDocumentByName('users', loggedname, function (err, result) {

            if (result == null) {
                response = hubResponse.getErrorResponse(-1, "Invalid request from client");
                res.end(response);
            }
            else {
                result = result['role']
                if (result == 'Super Admin') {
                    //response= 12345
                    arr = [true, true, true, true, true]
                    response = arr
                    //1 = alarm manage
                    //2 = active alarm
                    //3 = device admin
                    //4 = third party user
                    //5 = user managementw
                }
                else if (result == 'Administrator') {

                    //response= 1235
                    arr = [true, true, true, false, true]
                    response = arr

                }
                else if (result == 'Supervisor') {

                    //response= 3
                    arr = [false, true, true, false, false]
                    response = arr
                }
                else if (result == 'Operator') {

                    //response= 2
                    arr = [false, true, false, false, false]
                    response = arr
                }
                else {
                    arr = [false, false, false, false, false]
                    response = arr
                }
                hubResponse.data = response;

                response1 = hubResponse.getOkResponse();
                res.end(response1)

            }
        })
    })

    express.post('/loginprivilege', function (req, res) {

        var hubResponse = new responseModule.HubResponse();
        var response = null;
        var path1 = ''
        var response1 = null

        //loggedname={'userName':loggedname}
        dbInstance.GetDocumentByName('users', { 'userName': req.query['1'] }, function (err, result) {
            if (result == null) {
                response = hubResponse.getErrorResponse(-1, "Invalid request from client");
                res.end(response);
            }
            else {
                result = result['role']
                path = req.query['0']
                for (x in path) {
                    path1 = path1 + path[x]
                }

                if (result == null) {
                    response = hubResponse.getErrorResponse(-1, "Invalid request from client");
                    res.end(response);
                } else {

                    if (result == 'Super Admin') {
                        response = true
                    }
                    else if (result == 'Administrator') {

                        if (path1 != '/thirdpartyuser') {
                            response = true
                        }
                        else
                            response = false
                    }
                    else if (result == 'Supervisor') {

                        if (path1 != '/alarm_manage' && path1 != '/active_alarms' && path1 != '/thirdpartyuser' && path1 != '/user_management') {

                            response = true
                        }
                        else {

                            response = false
                        }
                    }
                    else if (result == 'Operator') {

                        if (path1 != '/alarm_manage' || path1 != '/thirdpartyuser' || path1 != '/user_management' || path1 != '/device_admin') {
                            response = true
                        }
                        else
                            response = false
                    }
                    else {
                        response = false
                    }
                    hubResponse.data = response;
                    response1 = hubResponse.getOkResponse();
                    res.end(response1)
                }
            }
        })
    })
}


module.exports = {
    LoginApi
}
