import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

interface VarsDefinition {
  ENVIRONMENT: string;
  MONGODB_URI: string;
  WRITE_MQ_URI: string;
  READ_MQ_URI: string;
  PORT: number;
}

// Load environment variables from .env file, where API keys and passwords are configured
if (fs.existsSync(".env")) {
  logger.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  logger.debug(
    "Using .env.example file to supply config environment variables"
  );
  dotenv.config({ path: ".env.example" });
}

const ENVIRONMENT: string = process.env.NODE_ENV || "development";

const MONGODB_URI = process.env["MONGODB_URI"];

if (MONGODB_URI === undefined) {
  logger.error("No mongo client string. Set MONGODB_URI environment variable.");
  throw new Error(
    "No mongo client string. Set MONGODB_URI environment variable."
  );
}

const PORT = parseInt(process.env.PORT || "8080");

const READ_MQ_URI = process.env["READ_MQ_URI"];
if (!READ_MQ_URI) {
  logger.error(
    "Invalid message config specified. Set READ_MQ_URI environment variable."
  );
  throw new Error(
    "Invalid message queue config specified. Set READ_MQ_URI environment variable."
  );
}

const WRITE_MQ_URI = process.env["WRITE_MQ_URI"];
if (!WRITE_MQ_URI) {
  logger.error(
    "Invalid message config specified. Set WRITE_MQ_URI environment variable."
  );
  throw new Error(
    "Invalid message queue config specified. Set WRITE_MQ_URI environment variable."
  );
}

export const vars: VarsDefinition = {
  ENVIRONMENT,
  MONGODB_URI,
  PORT,
  READ_MQ_URI,
  WRITE_MQ_URI
};
