import winston, { LoggerInstance, Logger } from "winston";
import { ENVIRONMENT } from "./secrets";

const logger: LoggerInstance = new Logger({
    transports: [
        new (winston.transports.Console)({ level: ENVIRONMENT === "production" ? "error" : "debug" }),
        new (winston.transports.File)({ filename: "debug.log", level: "debug"})
    ]
});

if (ENVIRONMENT !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;

