var storeProcedure = require('../common/mySqlStoreProcedure');
var appConstants = require('../common/appConstants');
var crypto = require("crypto");
var jwt = require('jsonwebtoken');
var storeProcedure = require('../common/mySqlStoreProcedure');
var database = require('../common/database');


var https = require("https");
const { resolve } = require('path');


var commonService = {
    generatejwtTokenWithData(data) {
        let token = jwt.sign(data, appConstants.jwtSecret, {
            expiresIn: "365days" 
        });
        return token;
    },
    encryptPassword(recievedPassword) {
        let cipher = crypto.createCipher('aes-256-cbc', appConstants.jwtSecret);
        let crypted = cipher.update(recievedPassword, 'utf-8', 'hex');
        crypted += cipher.final('hex');
        return crypted
    },
    decryptPassword(recievedPassword) {
        let decipher = crypto.createDecipher('aes-256-cbc', appConstants.jwtSecret);
        let decrypted = decipher.update(recievedPassword, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted
    },
    validateToken(req, res) {
        if(req.decoded.userType == appConstants.USER_TYPE.USER) {
            return new Promise((resolve, reject) => {
                database.executeQuery(
                    storeProcedure.GetUserByToken,
                    [
                        req.decoded.id
                    ],
                    res, function (rows) {
                        if (rows[0].length > 0) {
                            resolve({
                                executed: 1, data: {
                                    isValidate: true
                                }
                            });
                        }
                        else {
                            resolve({
                                executed: 0, data: {
                                    isValidate: false
                                }
                            });
                        }
                    });
            });
        }else{
            resolve({
                executed: 0, data: {
                    isValidate: false
                }
            });
        }
    },
    validateRequestUrlPath(req, res) {
        if (req.decoded.userType == appConstants.SHIRLEY_USER_TYPE.ADMIN) {
            if (req.path.indexOf('/admin/') > -1 || req.path.indexOf('/common/') > -1) {
                return true;
            } else {
                return false;
            }
        }else if(req.decoded.userType == appConstants.SHIRLEY_USER_TYPE.USER){  
            if (req.path.indexOf('/account/') > -1 || req.path.indexOf('/common/') || req.path.indexOf('/child/') > -1) {
                return true;
            } else {
                return false;
            }
        }else if(req.decoded.isGuestUser == 1){
            if (req.path.indexOf('/account/') > -1 || req.path.indexOf('/common/') || req.path.indexOf('/child/') > -1) {
                return true;
            } else {
                return false;
            }
        }else{

        }
    },
    
};

module.exports = commonService;