import logger from "./util/logger";
import mongo from "./config/mongo";
import { vars } from "./util/vars";

mongo();

/**
 * Start Node server.
 */
const http = require("http");
const server = http.createServer();
const port = vars.PORT;
const env = vars.ENVIRONMENT;

server.listen(port, (err: any) => {
  if (err) {
    return console.log(`Error while starting server: ${err}`);
  }

  console.log("App is running at http://localhost:%d in %s mode", port, env);
  console.log("Press CTRL-C to stop\n");
});

export default server;
 