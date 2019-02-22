import mongo from "./config/mongo";
import cors from "cors";
import express, { Router } from "express";
// import manager from "./api/manager";
import { vars } from "./util/vars";
import { DeviceRegistry } from "./api/DeviceRegistry";
import { messageQueueBuilder } from "./api/MessageQueue";

async function startRegistry() {
  const messageQueue = await messageQueueBuilder(vars.AMQP_URI);
  await messageQueue.init();

  const deviceRegistry = new DeviceRegistry(messageQueue);
  await deviceRegistry.init();
  return deviceRegistry;
}

const app = express();
const port = vars.PORT;
const env = vars.ENVIRONMENT;
const router = Router();

(async () => {
  mongo();
  // manager();
  const registry = await startRegistry();

  app.use(cors({ origin: "*" }));

  router.get("/", (req, res) => {
    res.send(registry.things);
  });

  app.use("/things", router);

  app.listen(port, (err: any) => {
    if (err) {
      return console.log(`Error while starting server: ${err}`);
    }

    console.log("App is running at http://localhost:%d in %s mode", port, env);
    console.log("Press CTRL-C to stop\n");
  });
})();
