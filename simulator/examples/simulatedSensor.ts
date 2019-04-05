import { messageQueueBuilder } from "../src/api/MessageQueue";
import { SimulatedThermometer } from "./models/SimulatedThermometer";
import { vars } from "../src/util/vars";

messageQueueBuilder(vars.READ_MQ_URI, vars.WRITE_MQ_URI).then(
  async messageQueue => {
    const simulatedSensor = new SimulatedThermometer(messageQueue);

    await simulatedSensor.register();

    simulatedSensor.measure();
  }
);
