var jwt = require('jsonwebtoken');
var staticKeywords = require('../common/staticKeywords');
var logger = require('../common/log');
var date = require('../common/date');
var noLoginNeeded = require('../common/apiConfig');
var appConstants = require('../common/appConstants');
var commonService = require('../services/commonService');

module.exports = {
    allowAccess: function (req, res, next) {
        // console.log("In Middleware");
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    },
    handleError: function (req, res, next) {
        var err = new Error('Not Found: ' + req.method + ":" + req.originalUrl);
        logger.log({ level: 'error', message: err });
        err.status = 404;
        next();
    },
    verifyToken: function (req, res, next) {
        var islogin = true;
        if(!req.headers['lanuguage'] && req.headers['language']){
            req.headers['lanuguage']=req.headers['language'];
        }
        
        for (var i = 0; i < noLoginNeeded.length; i++) {
            if (req.path.indexOf(noLoginNeeded[i]) > -1) {
                islogin = false;
                break;
            }
        }

        if (!islogin) {
            next();
        } else {
            var token = req.headers['authorization'];
            if (token) {
                try {
                    jwt.verify(token, appConstants.jwtSecret, async function (err, decoded) {
                        if (err) {
                            // console.log(err);
                            // logger.error(err);
                            return res.status(401).send({ status: 401, message: 'You are forcefully logged out, please try to login again or contact administrator.' });
                            
                        } else {
                            req.decoded = decoded;
                            let userData = await commonService.validateToken(req, res);
                            if (userData) {
                                if (userData.executed == 1 && userData.data && userData.data.isValidate==1 && commonService.validateRequestUrlPath(req, res)) {
                                    next();
                                } else {
                                    // console.log(userData);
                                    return res.status(401).send({ status: 401, message: 'You are forcefully logged out, please try to login again or contact administrator.' });
                                    
                                }
                            } else {
                                // console.log("data",userData);
                                return res.status(401).send({ status: 401, message: 'You are forcefully logged out, please try to login again or contact administrator.' });
                                
                            }
                        }
                    })
                } catch(err){
                    // console.log(err);
                    return res.status(401).send({ status: 401, message: 'You are forcefully logged out, please try to login again or contact administrator.' });
                    
                }
            }
            else {
                return res.status(401).send({
                    status: 401,
                    message: 'No token provided.'
                });
            }
        }
    },
    printLogs: function (req, res, next) {
        // console.log(commonService.decryptPassword("69f392cd3ed97e5eb5f68015c7ec8386"))
        logger.log({
            level: 'info', message: {
                Time: date, url: req.protocol + '://' + req.get('host') + req.originalUrl, body:
                    req.body, header: req.headers, clientInfo: ''
            }
        });

        // console.log("API URL =>>"+ req.protocol + '://' + req.get('host') + req.originalUrl)
        next();
    },
    logAllRequests: function (req, res, next) {
        var token = req.headers['authorization'];
        var userId = "";
        // console.log("token",token)
        if (token) {
            // console.log("token",token)
            jwt.verify(token, appConstants.jwtSecret, function (err, decoded) {
                // console.log("err",err)
                if (!err) {
                    req.decoded = decoded;
                    var reqLog = { url: req.protocol + '://' + req.get('host') + req.originalUrl, body: req.body, header: req.headers };
                    var oldWrite = res.write,
                        oldEnd = res.end;
                    var chunks = [];

                    res.write = function (chunk) {
                        chunks.push(chunk);
                        oldWrite.apply(res, arguments);
                    };

                    res.end = function (chunk) {
                        if (chunk)
                            chunks.push(chunk);

                        try {
                            var body = Buffer.concat(chunks).toString('utf8');
                            //console.log(req.path, body);

                            commonService.saveLog(
                                JSON.stringify(reqLog),
                                body, req.decoded ? req.decoded.uniqueId : ""
                            )
                        } catch (err) {

                        }
                        oldEnd.apply(res, arguments);
                    };
                }
                next();
            })
        } else {
            next();
        }
    }
};