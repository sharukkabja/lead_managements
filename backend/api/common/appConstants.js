
var config = require('./config');

var appConstants = {
    jwtSecret: config.JWT_SECRET,

    AWS_ACCESS_KEY_ID: config.AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: config.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: config.AWS_REGION,
    AWS_BUCKET_NAME: "projectName",

    ANDROID_PACKAGE_NAME: "com.projectName",
    IOS_BUNDLE_ID: "com.projectName.app",
    IOS_APP_STORE_ID: "",
    FIREBASE_WEB_API_KEY: "",

    USER_TYPE : {
        USER : 1
    }
};

module.exports = appConstants;