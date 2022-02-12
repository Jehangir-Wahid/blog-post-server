const winston = require("winston");

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: "./logs/error.log",
            level: "error",
        }),
        new winston.transports.File({ filename: "./logs/combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    const myFormat = winston.format.printf((info) => {
        if (info.meta && info.meta instanceof Error) {
            return `${info.timestamp} ${info.level} ${info.message} : ${info.meta.stack}`;
        }
        return `${info.timestamp} ${info.level}: ${info.message}`;
    });

    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.prettyPrint(),
                myFormat
            ),
        })
    );
}

module.exports = logger;
