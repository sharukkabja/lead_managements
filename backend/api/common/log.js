var winston = require('winston');
require('winston-daily-rotate-file');

var logger = winston.createLogger({
  transports: [
    new (winston.transports.DailyRotateFile)({
      filename: './log/%DATE%_info.log',
      datePattern: 'DD-MM-YYYY',
      prepend: true,
      level: 'info'
    }),
    new (winston.transports.DailyRotateFile)({
      filename: './log/%DATE%_error.log',
      datePattern: 'DD-MM-YYYY',
      prepend: true,
      level: 'error'
    })
  ]
});

module.exports = logger;