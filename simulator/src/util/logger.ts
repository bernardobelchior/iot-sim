import { createLogger, Logger, transports } from "winston";

const ENVIRONMENT = process.env.ENVIRONMENT || "development";

function getLogLevel(env: string): string {
  const levels: { [key: string]: string } = {
    production: "error",
    development: "debug",
    test: "warning"
  };

  return levels[env] || "debug";
}

const logger: Logger = createLogger({
  transports: [
    new transports.Console({
      level: getLogLevel(ENVIRONMENT)
    }),
    new transports.File({ filename: "debug.log", level: "debug" })
  ]
});

if (ENVIRONMENT === "development") {
  logger.debug("Logging initialized at debug level");
}

export default logger;
