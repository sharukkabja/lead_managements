var mysql = require('mysql');
var config=require('./config');

var connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB,
    charset: 'utf8mb4'
}, { multipleStatements: true });

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ... \n\n");
    } else {
        console.log(err);
    }
});
module.exports = connection;