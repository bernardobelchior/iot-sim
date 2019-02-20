import logger from "./util/logger";
import http from "http";
import mongo from "./config/mongo";
import manager from "./api/manager";
import { vars } from "./util/vars";

mongo();
manager();

/**
 * Start Node server.
 */
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
