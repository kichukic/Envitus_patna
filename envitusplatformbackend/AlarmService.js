var AlarmProcessorModule = require('./Alarm/AlarmProcessor.js');
var alarmProcessor = new AlarmProcessorModule.AlarmProcessor();

var AlarmManagerModule = require('./Alarm/AlarmManager.js');
var alarmManager = new AlarmManagerModule.AlarmManager();

var thirdPartyRequestValidationModule = require('./ThirdPartyRequestValidation.js')
var ThirdPartyRequestValidationLimit = thirdPartyRequestValidationModule.ThirdPartyRequestValidation()

var ThirdPartyUserJSONModule = require('./ThirdPartyUser/ThirdPartyUserJSON.js')
var thirdPartyUserJSON = new ThirdPartyUserJSONModule.thirdPartyUserJSON()



var interval = setInterval(function () {

    var date = new Date()



    if (date.getHours() == 00 && (date.getMinutes() == 00 || date.getMinutes() == 01)) { // for IST midnight

        thirdPartyUserJSON.resetCounter();
    }


    alarmProcessor.process(function () {


    })

}, 15000);

