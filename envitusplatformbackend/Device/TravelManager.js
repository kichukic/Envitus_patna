var DatabaseHandlerModule = require('../DatabaseHandler.js');
var dbInstance = new DatabaseHandlerModule.DatabaseHandler();
var solver = require('node-tspsolver');

function TravelManager() {

    this.getDirection = function (slat, slon, isAssigned, callBack) {
        var current = { id: 'starting_location', lat: slat, lon: slon };
        var cords = [];
        var deviceList = {};
        cords.push(current);
        var location = null;

        if (slat != null && slon != null) {
            const query = (isAssigned) ? {"data.assigned_to": isAssigned} : {};
            dbInstance.GetFilteredDocumentSorted('devices_data', query, { "_id": false }, null, 100, 0, async function (err, val) {
                if (!err) {
                    for (var i = 0; i < val.length; i++) {
                        deviceList[val[i].deviceId] = val[i];
                        location = { id: val[i].deviceId, lat: val[i].data.latitude, lon: val[i].data.longitude };
                        cords.push(location);
                    }
                    var distArray = await getDistance(cords);
                    const response = distArray.map((id) => {
                        if(id === 'starting_location') {
                            return {
                                "deviceId": "starting_location",
                                "data": {
                                    "latitude": slat,
                                    "longitude": slon,
                                    "location": "starting_location"
                                }
                            };
                        } else {
                            return deviceList[id];
                        }
                    })
                    callBack(null, response);
                }
                else {
                    console.log(err)
                    callBack(1, null);
                }
            });

        }
        else
            callBack(1, null);
    }

    function getDistance(cords) {

        function toRad(x) {
            return x * Math.PI / 180;
        }
        var finalRes = [];
        var matrix = [];
        var devList = [];
        var R = 6371;
        for (var m = 0; m < cords.length; m++) {
            matrix[m] = [];
            devList.push(cords[m].id);
            for (var n = 0; n < cords.length; n++) {
                var lat1 = cords[m].lat;
                var lon1 = cords[m].lon;
                var lat2 = cords[n].lat;
                var lon2 = cords[n].lon;
                var x1 = lat2 - lat1;
                var dLat = toRad(x1);
                var x2 = lon2 - lon1;
                var dLon = toRad(x2)
                var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;
                matrix[m][n] = d;
            }
        }

        return solver.solveTsp(matrix, true, {})
            .then(function (result) {
                for (var i = 0; i < result.length; i++) {
                    finalRes.push(devList[result[i]]);
                }
                return finalRes;
            });
    }

}

module.exports = {
    TravelManager
};