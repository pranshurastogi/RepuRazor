const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'debug', 
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'repurazor.log' })
  ]
});

module.exports = logger;
