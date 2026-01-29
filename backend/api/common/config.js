module.exports = (function () {
    console.log("Env: ", process.env.NODE_ENV);

    switch (process.env.NODE_ENV) {
        case "development":
            return {
                DB_HOST: 'us-east1-mysql-instance1.cgu9juasfm8j.us-east-1.rds.amazonaws.com',
                DB_USER: 'gts_aws',
                DB_PASSWORD: 'GTSAWS2017',
                DB: 'shirley',
                PORT:3002,
                BASR_URL: '',
                WEB_BASE_URL: '',
                JWT_SECRET: "D1hF75GYRVSFBCS9DE",
                SEND_BIRD_KEY: "",
                AWS_ACCESS_KEY: "",
                AWS_SECRET_ACCESS_KEY: "",
                AWS_REGION: "",
                FIREBASE_CONFIG:"",
                FIREBASE_DB:"",
            };
            break;
        
        default:
            return {
                DB_HOST: '',
                DB_USER: '',
                DB_PASSWORD: '',
                DB: '',
                PORT:3001,
                BASR_URL: '',
                WEB_BASE_URL: '',
                JWT_SECRET: "",
                SEND_BIRD_KEY: "",
                AWS_ACCESS_KEY: "",
                AWS_SECRET_ACCESS_KEY: "",
                AWS_REGION: "",
                FIREBASE_CONFIG:"",
                FIREBASE_DB:""
            };
    }
})();