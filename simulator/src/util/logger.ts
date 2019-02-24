import { createLogger, Logger, transports } from "winston";

const ENVIRONMENT = process.env.ENVIRONMENT;

const logger: Logger = createLogger({
  transports: [
    new transports.Console({
      level: ENVIRONMENT === "production" ? "error" : "debug"
    }),
    new transports.File({ filename: "debug.log", level: "debug" })
  ]
});

if (ENVIRONMENT !== "production") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
