/*
To run this script
node deviceDataEntryScript.js

Update device detail if needed and also can update cron string.
*/

const https = require('http')
var cron = require('node-cron');

function postSensorData() {
    let time = new Date().valueOf();
    const data = JSON.stringify({
        "deviceId": "a001",
        "data": {
            "temperature": getRndInteger(0, 60),
            "pressure": getRndInteger(540, 1110),
            "humidity": getRndInteger(0, 90),
            "PM2p5": getRndInteger(0, 230),
            "PM10": getRndInteger(0, 450),
            "PM1": getRndInteger(0, 100),
            "CO": getRndInteger(0, 1),
            "NO2": getRndInteger(0, 1),
            "SO2": getRndInteger(0, 1),
            "CO2": getRndInteger(0, 1),
            "O3": getRndInteger(0, 1),
            "NH3": getRndInteger(0, 1),
            "noise": getRndInteger(0, 135),
            "rain": getRndInteger(0, 999),
            "time": "" + time.valueOf()
        }
    });

    const options = {
    hostname: 'localhost',
    port: 7001,
    path: '/device/sensor/livedata/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
    }

    const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write(d)
    })
    })

    req.on('error', error => {
    console.error(error)
    })

    req.write(data)
    req.end();
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

cron.schedule('*/6 * * * *', () => {
    console.log("////////////");
    postSensorData();
});