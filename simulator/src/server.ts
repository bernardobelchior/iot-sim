import logger from "./util/logger";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { MONGODB_URI } from "./util/secrets";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.connect(mongoUrl);

/**
 * Start Node server.
 */
const http = require("http");
const server = http.createServer();
const port = process.env.PORT;
const env = process.env.NODE_ENV;

server.listen(port, (err: any) => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log("App is running at http://localhost:%d in %s mode", port, env);
  console.log("Press CTRL-C to stop\n");
});

export default server;
