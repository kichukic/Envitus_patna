const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const cron = require('node-cron');
const AqiCalculation = require('./Device/AqiCalculation.js');
const SensorManagerModule = require('./Device/SensorManager.js');
const sensorManager = new SensorManagerModule.SensorManager();
const bodyParser = require('body-parser');
const session = require('express-session');
const request = require('request');
const cookieParser = require('cookie-parser');

const passport = require('passport')
const passportSaml = require('passport-saml');

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// SAML strategy for passport -- Single IPD
// const strategy = new passportSaml.Strategy(
//     {
//         entryPoint: process.env.OL_ENTRY_POINT,
//         issuer: process.env.OL_ISSUER,
//         callbackUrl: process.env.OL_CALLBACK,
//         cert: fs.readFileSync('./cert/onelogin.pem', 'utf8')
//     },
//     (profile, done) => done(null, profile),
// );

const strategy = new passportSaml.Strategy(
    {
        entryPoint: "https://idp.sso.tools/envitus/saml/login/request",
        issuer: "envitus",
        callbackUrl: "http://68.183.86.143:4001/login/sso/callback",
        cert: fs.readFileSync('./cert/onelogin.pem', 'utf8')
        
    },
    (profile, done) => done(null, profile),
);
console.log(strategy,">>>>>>>>>>>  >> > > >>> > >>> > > > >> > > > ")


passport.use(strategy);

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());

// Passport requires session to persist the authentication
// so were using express-session for this example
app.use(session({
    secret: 'secret squirrel',
    resave: false,
    saveUninitialized: true
}))

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// routing registration.
app.use('/app/', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/build')));


var deviceSpecApi = new require('./Api/DeviceSpecApi').DeviceSpecApi(app);
var sensorApi = new require('./Api/SensorApi').SensorApi(app);
var deviceApi = new require('./Api/DeviceApi').DeviceApi(app);
var reportApi = new require('./Api/ReportApi').ReportApi(app);
var alarmApi = new require('./Api/AlarmApi').AlarmApi(app);
var userApi = new require('./Api/UserApi').UserApi(app);
var thirdPartyUserApi = new require('./Api/ThirdPartyUserApi').ThirdPartyUserApi(app);
var loginApi = new require('./Api/loginApi').LoginApi(app);

// Commenting now - docker creation issue Error: /lib64/libc.so.6: version `GLIBC_2.29' not found
// var travelApi = new require('./Api/TravelApi').TravelApi(app);

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/build', 'index.html'));
});

// listen server
const port = Number(process.env.PORT || 3000);
if (process.env.HTTPS == 'true') {
    const cert = fs.readFileSync('./cert/cert.pem');
    const key = fs.readFileSync('./cert/key.pem');
    https.createServer({
        key: key,
        cert: cert
    }, app).listen(port, () => {
        console.log("Clean Air India server listening at port:" + port)
    });

} else {
    app.listen(port, function () {
        console.log("Clean Air India server listening at port:" + port)
    });
}

    const cert = fs.readFileSync('./cert/patna.crt');
    const key = fs.readFileSync('./cert/patna.key');
    https.createServer({
        key: key,
        cert: cert
    }, app).listen(7002, () => {
        console.log("Clean Air India server listening at port: 4001")
    });

cron.schedule('30 * * * *', () => {
    if (process.env.NEED_AQI === "true") {
        console.log('AQI Calculated at: ', new Date().toUTCString())
        AqiCalculation.intilaizeAqiCalculation();
    }
});
sensorManager.processIncomingData();
