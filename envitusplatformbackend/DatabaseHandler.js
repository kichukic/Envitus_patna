//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = process.env.DB_URL;
const bcrypt = require('bcryptjs');
const saltRounds = 10;

var dbInst = null;
function DatabaseHandler() {

    /** The function used to connect the mongo db database. */
    this.connectDatabase = function (callBack) {

        if (dbInst == null) {
            // Use connect method to connect to the Server
            MongoClient.connect(url, function (err, db) {
                console.log('URL===============',url)
                if (err) {

                    callBack(err, null);

                } else {
                    //HURRAY!! We are connected. :)
                    console.log('URL=============',url)
                    dbInst = db;

                    var collection = db.collection('users');
                    collection.findOne({ email: process.env.ROOT_USER_EMAIL }, async function (err, item) {
                        if (err) {

                        } else {
                            const password = await new Promise(resolve => {
                                bcrypt.hash(process.env.ROOT_USER_PASSWORD, saltRounds, (err, hash) => {
                                    if (err) {
                                        resolve(false)
                                    } else {
                                        resolve(hash)
                                    }
                                });
                            });
                            if (password) {
                                const user = {
                                    password: password,
                                    email: process.env.ROOT_USER_EMAIL,
                                    name: 'Envitus',
                                    contact: '9072393733',
                                    role: 'Super Admin',
                                    activated: true,
                                    userName: 'envitus'
                                }
                                var collection = db.collection('users');
                                try {
                                    collection.insert(user, function (errData, result) {

                                        if (errData) {
                                            console.log(e)
                                        }
                                    });
                                }
                                catch (e) {
                                    console.log(e)
                                }
                            }
                        }

                    });
                    db.on("close", function (error) {
                        dbInst = null;
                        db = null;

                    });
                    callBack(null, dbInst);
                }
            });
        }
        else {
            callBack(null, dbInst);
        }
    }


    this.dropDataBase = function () {
        this.connectDatabase(function (err, db) {
            if (err) {

                return false;
            } else {
                //HURRAY!! We are connected. :)

                db.dropDatabase();
                return true;
            }
        });
    }

    this.timeWindow = function (collectionName, sortOptions, callback) {
        this.connectDatabase(function (err, db) {
            if (err) {
                callback(1, null)
            }
            else {
                var collection = db.collection(collectionName)
                collection.find({}, { 'id': 0, "epoch": 1 }).limit(1).sort(sortOptions).toArray(function (err, result) {
                    if (err) {
                        callback(1, null)
                    }
                    else {
                        var result1 = {}
                        if (result[0]) {
                            result1 = result[0]["epoch"]
                            callback(null, result1)
                        }
                        else {
                            callback(null, null)
                        }
                    }
                })
            }
        })
    }
    this.autoIncrementFieldValue = function (collectionName, query, incValue, setData) {
        this.connectDatabase.connect(function (err, db) {
            if (err) {
                return false;
            } else {
                var collection = db.collection(collectionName);
                collection.update(query, { $inc: incValue, $set: setData }, { upsert: true });

            }
        });
    }

    this.updateUniqueDataInList = function (collectionName, query, listData) {
        this.connectDatabase(function (err, db) {
            if (err) {
                return false;
            } else {
                var collection = db.collection(collectionName);
                collection.update(query, { $addToSet: listData }, { upsert: true });

            }
        });
    }

    this.removeDataInList = function (collectionName, query, listData) {
        this.connectDatabase(function (err, db) {
            if (err) {
                return false;
            } else {
                var collection = db.collection(collectionName);
                collection.update(query, { $pull: listData }, { upsert: false });

            }
        });
    }

    this.getDistinctDataList = function (collectionName, field, callback) {
        this.connectDatabase(function (err, db) {
            if (err) {

                callback(null);
            }
            var collection = db.collection(collectionName);
            // not sure where the dom value comes from ?
            collection.distinct(field, function (err, result) {
                if (err) {

                    callback(null);
                } else {

                    // call the callback here (err as the first parameter, and the value as the second)
                    callback(result);

                }


            });
        });
    };



    this.insertDocument = function (collectionName, JsonData, callBack) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                callBack(1);
            } else {

                var collection = db.collection(collectionName);
                try {
                    collection.insert(JsonData, function (errData, result) {

                        if (callBack == null)
                            return;

                        if (errData) {
                            if (errData.message.indexOf("11000") != -1) {

                                return callBack(2);
                            }

                            return callBack(1);
                        } else {
                            callBack(null);

                        }

                    });
                }
                catch (e) {
                    if (e.message.indexOf("11000") != -1 || callBack != null) {
                        callBack(2);
                    }
                }



            }
        });
    }

    this.insertOneDocument = function (collectionName, JsonData, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return false;
            } else {



                var collection = db.collection(collectionName);
                JsonData['_id'] = mongodb.ObjectID();

                collection.insert(JsonData, function (err, result) {
                    if (err) {

                        callback(null, null);
                    } else {


                    }

                    callback(null, result);
                });



            }
        });
    }

    this.removeOneDocument = function (collectionName, query) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return false;
            } else {


                var collection = db.collection(collectionName);

                collection.remove(query, { justOne: true });
            }
        });
    };

    this.removeCollection = function (collectionName, callback) {

        this.connectDatabase(function (err, db) {

            if (err) {

                callback(1);
            }
            else {

                db.dropCollection(collectionName, function (err, result) {
                    callback(err);
                });
            }
        });
    };

    this.removeDocument = function (collectionName, query, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return false;
            } else {


                var collection = db.collection(collectionName);

                collection.remove(query, function (err, result) {
                    if (err) {

                    } else {


                    }


                    callback(null, result);
                });

            }
        });
    };

    this.updateDocument = function (collectionName, query, JsonData, callBack) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                callBack(1);
            } else {
                var collection = db.collection(collectionName);
                collection.update(query, { $set: JsonData }, function (err, result) {
                    if (err) {
                        callBack(1);
                    }
                    else {
                        callBack(null);
                    }

                    //callback(null, result);
                });

            }
        });
    }

    this.insertOrUpdateDocument = function (collectionName, query, JsonData, callBack) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                callBack(1);
            } else {
                var collection = db.collection(collectionName);
                collection.update(query, { $set: JsonData }, { upsert: true }, function (err, result) {
                    if (err) {
                        callBack(1);
                    } else {
                        callBack(null);
                    }

                    //callback(null, result);
                });

            }
        });
    }

    this.findOneAndUpdate = function (collectionName, query, JsonData, sortOption, callBack) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                callBack(1);
            } else {
                var collection = db.collection(collectionName);
                collection.findOneAndUpdate(query, { $set: JsonData }, { sort: sortOption }, function (err, result) {
                    if (err) {
                        callBack(1, null);
                    } else {
                        callBack(null, result);
                    }
                });

            }
        });
    }

    this.updateDocumentField = function (collectionName, query, field) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return false;
            } else {

                var collection = db.collection(collectionName);

                collection.update(query, { $set: field }, function (err, result) {
                    if (err) {

                    } else {


                        return true;
                    }

                    //callback(null, result);
                });

            }
        });
    }

    this.getDocumentCountByCriteria = function (collectionName, query, callback) {
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            }
            var collection = db.collection(collectionName);
            // not sure where the dom value comes from ?
            collection.count(query, function (err, count) {
                if (err) {

                }
                // call the callback here (err as the first parameter, and the value as the second)
                callback(null, count);
            });
        });
    };

    this.GetAllDocumentByCriteria = function (collectionName, excludeFields, query, limit, offset, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {

                var collection = db.collection(collectionName);

                collection.find(query, excludeFields, { sort: { _id: -1 }, limit: limit, skip: offset }).toArray(function (err, result) {
                    if (err) {

                    } else if (result.length > 0) {
                        callback(null, result);
                    } else {
                        callback(null, []);
                    }

                });
            }
        });
    }


    this.GetDocumentByCriteria = function (collectionName, index, query, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {

                var collection = db.collection(collectionName);

                collection.find(query, { sort: { _id: -1 } }).toArray(function (err, result) {
                    if (err) {

                    } else if (result.length && result[index] != null) {


                        callback(null, result[index]);
                    } else {

                        callback(1, null);
                    }

                });
            }
        });
    }


    this.getDocumentCount = function (collectionName, callback) {
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            }
            var collection = db.collection(collectionName);
            // not sure where the dom value comes from ?
            collection.count({}, function (err, count) {
                if (err) {

                }

                // call the callback here (err as the first parameter, and the value as the second)
                callback(null, count);
            });
        });
    };


    this.GetFilteredDocumentSorted = function (collectionName, query, excludFields, sortOptions, limitRecords, skipRecords, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {
                callback(1, null);
            }
            else {
                var doc = null;


                var collection = db.collection(collectionName);
                var options = {};
                if (sortOptions != null)
                    options.sort = sortOptions;
                else
                    options.sort = { _id: -1 };

                collection.find(query, excludFields).limit(limitRecords).skip(skipRecords).sort(sortOptions).toArray(function (err, result) {

                    if (err) {
                        callback(1, null);
                    }
                    else {
                        callback(null, result);
                    }
                });
            }
        });
    }


    this.GetFilteredDocument = function (collectionName, query, fields, callback) {

        this.GetFilteredDocumentSorted(collectionName, query, fields, null, callback);
        // Use connect method to connect to the Server
        //this.connectDatabase( function (err, db)
        //{
        //    if (err)
        //    {
        //        callback(1,null);
        //    }
        //    else
        //    {
        //        var doc = null;




        //        var collection = db.collection(collectionName);
        //        collection.find(query, fields, { sort: { _id: -1 } }).toArray(function (err, result)
        //        {
        //            if (err)
        //            {
        //                callback(1,null);
        //            }
        //            else if (result.length)
        //            {
        //                callback(null, result);
        //            } 
        //        });
        //    }
        //});
    }


    this.GetSelectedFields = function (collectionName, query, fields, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {
                var doc = null;


                var collection = db.collection(collectionName);
                collection.find(query, fields, { sort: { _id: -1 } }).toArray(function (err, result) {
                    if (err) {

                    } else if (result.length) {

                        callback(null, result);
                    } else {
                        callback(new Error("No Data found"), null);
                    }


                });


            }
        });
    }

    this.GetDocument = function (collectionName, index, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {
                var doc = null;


                var collection = db.collection(collectionName);
                collection.find().toArray(function (err, result) {
                    if (err) {

                    } else if (result.length && result[index] != null) {

                        callback(null, result[index]);
                    } else {
                        callback(new Error("No Data found"), null);
                    }



                });


            }
        });
    }


    this.GetDocuments = function (collectionName, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {
                var doc = null;

                var collection = db.collection(collectionName);
                collection.find().toArray(function (err, result) {
                    if (err) {

                    } else if (result.length && result != null) {
                        callback(null, result);
                    } else {
                        callback(new Error("No Data found"), null);
                    }


                });


            }
        });
    }

    this.GetAllDocument = function (collectionName, query, fields, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                callback(null);
            } else {
                var doc = null;

                var collection = db.collection(collectionName);
                collection.find(query, { fields: [fields] }).toArray(function (err, result) {
                    if (err) {

                        callback(null);

                    } else if (result.length && result != null) {

                        callback(result);
                    } else {
                        callback(null);
                    }



                });


            }
        });
    }

    this.GetDocumentByName = function (collectionName, query, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {

                var collection = db.collection(collectionName);

                collection.findOne(query, function (err, item) {
                    if (err) {

                    } else {

                        callback(null, JSON.parse(JSON.stringify(item)));
                    }

                });
            }
        });
    }


    this.createUniqueIndex = function (collectionName, indexesClass, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {

                var collection = db.collection(collectionName);
                collection.createIndex(indexesClass, { unique: true }, function (err, nameIndex) {
                    if (err) {
                        callback(1, null);
                    }
                    else {
                        callback(null, nameIndex);
                    }

                });
            }
        });
    }

    this.GetDocumentsGroupBy = function (collectionName, groupByField, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {
                var doc = null;

                var collection = db.collection(collectionName);
                collection.aggregate([
                    { $match: {} },
                    {
                        $group:
                            { _id: '$' + groupByField, records: { $push: "$$ROOT" }, "count": { $sum: 1 } }
                    }
                ]).toArray(function (err, result) {
                    if (err) {

                    } else if (result.length && result != null) {
                        callback(null, result);
                    } else {
                        callback(new Error("No Data found"), null);
                    }


                });
            }
        });
    }

    this.getOnlineDevice = function(collectionName,deviceId,callback){
        
        this.connectDatabase(function(err,db){
            if(err){
                return err
            }
            
            var collection = db.collection(collectionName);

            // test 
            // let testData = db
            // .collection(collectionName)
            // .aggregate([
            //   { $match: { deviceId: deviceId } },
            //   {
            //     $lookup: {
            //       from: "device_raw_data",
            //       localField: "deviceId",
            //       foreignField: "deviceId",
            //       as: "devices",
            //     },
            //   },
            //   { "$limit": 10 }
            // ]).toArray((err,result)=>{
            //     if (err){
            //         console.log('ERROR --------------------', err)
            //     }else{
            //         console.log('RESULT---------------------', result)
            //     }
            // })
            // end
            
            let newData = db
            .collection(collectionName)
            .aggregate([
              { $match: { deviceId: deviceId } },
              {
                $lookup: {
                  from: "device_raw_data",
                  localField: "deviceId",
                  foreignField: "deviceId",
                  as: "devices",
                },
              },
              { $project: { deviceId: 1, lastDataReceiveTime: 1, location : 1} },
            //   { "$limit": 10 }
            ]).toArray(function(err,data){
                if(err){
                    console.log('Err : ',err)
                }else{
                    let deviceData = data.find((x)=>{
                        x.deviceId = deviceId
                        return x
                    })
                    let resultObj = {}
                    if (
                        new Date().valueOf() - deviceData.lastDataReceiveTime <
                        15 * 60 * 1000
                    ){
                        resultObj.isOnline = 'online'
                        resultObj.latitude = deviceData.location.latitude
                        resultObj.longitude = deviceData.location.longitude
                        resultObj.landMark = deviceData.location.landMark
                        callback(null, resultObj);
                    }else{
                        resultObj.isOnline = 'offline'
                        resultObj.latitude = deviceData.location.latitude
                        resultObj.longitude = deviceData.location.longitude
                        resultObj.landMark = deviceData.location.landMark
                        callback(null, resultObj);
                    }
                }
            })
        })
    }

    this.getDocumentId = function (collectionName, callback) {
        this.connectDatabase(function (err, db) {
          if (err) {
            return null;
          }
          var collection = db.collection(collectionName);
          let dataArr = [];
          let dataObj = {};
          // New code
          let newData = db
            .collection(collectionName)
            .aggregate([
              {
                $lookup: {
                  from: "device_raw_data",
                  localField: "deviceId",
                  foreignField: "deviceId",
                  as: "devices",
                },
              },
            ])
            .toArray(function (err, data) {
              if (err) {
                console.log("Err : ", err);
              } else {
                for (let i = 0; i < data.length; i++) {
                  let e = data[i];
                  if (
                    new Date().valueOf() - e.lastDataReceiveTime <
                    15 * 60 * 1000
                  ) {
                    dataObj.deviceId = e.deviceId;
                    dataObj.deviceName = e.customerName;
                    dataObj.location = e.location ? e.location.city : null;
                    dataObj.latitude = e.location ? e.location.latitude : null;
                    dataObj.longitude = e.location ? e.location.longitude : null;
                    dataObj.status = 'online';

                    dataArr.push({ ...dataObj });
                  } else {
                    dataObj.deviceId = e.deviceId;
                    dataObj.deviceName = e.customerName;
                    dataObj.location = e.location ? e.location.city : null;
                    dataObj.latitude = e.location ? e.location.latitude : null;
                    dataObj.longitude = e.location ? e.location.longitude : null;
                    dataObj.status = 'offline';
                    dataArr.push({ ...dataObj });
                  }
                }
              }
              callback(null, dataArr);
            });
        });
      };


    this.IsDocumentExist = function (collectionName, query, callback) {
        // Use connect method to connect to the Server
        this.connectDatabase(function (err, db) {
            if (err) {

                return null;
            } else {



                var collection = db.collection(collectionName);
                collection.findOne(query, function (err, item) {
                    if (err) {

                        callback(null, "database error");
                    } else {

                        var response = "success";
                        if (item == null) {
                            response = "failure"
                        }
                        callback(null, response);
                    }

                });
            }
        });
    }



}


// export the class
module.exports =
{
    DatabaseHandler
};
