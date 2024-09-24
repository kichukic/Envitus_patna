var jsonwebtoken = require('jsonwebtoken');

function getJwt(data){
    console.log(">>>>>>>",data)
    return new Promise((resolve, reject) => {
        jsonwebtoken.sign(data, process.env.JWT_SECRET, { expiresIn: '15m' }, (err, token) => {
            err ? reject(err) : resolve(token);
        });
    });
}



function decodeJwt(jwt) {
    return new Promise((res, rej) => {
        jsonwebtoken.verify(jwt, process.env.JWT_SECRET, (err, decoded) => {
            return err ? rej("Not Valid") : res(decoded);
        });
    });
}


function getToken(req) {
    return new Promise((resolve, reject) => {
        let token;
        if (!req.headers.authorization) {
            return reject(false);
        } else {
            token = req.headers.authorization.split(" ");
            return resolve(token[1]);
        }
    });
}

module.exports =
{
    getJwt,
    decodeJwt,
    getToken
};