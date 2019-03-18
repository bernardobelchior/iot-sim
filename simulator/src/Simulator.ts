import { Agent } from "./environment/Agent";
import { Layout } from "./environment/Layout";
import { Engine, EngineSingleton } from "./rules-engine/Engine";
import { DeviceRegistry, DeviceRegistrySingleton } from "./api/DeviceRegistry";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
import { vars } from "./util/vars";

enum SimulationState {
  INITIALIZED,
  RUNNING,
  COMPLETED,
  PAUSED,
}

export class Simulator {
  agents: Agent[] = [];
  layout: Layout;
  rulesEngine: Engine;
  registry: DeviceRegistry;
  mainBus?: MessageQueue;

  state: SimulationState;

  constructor() {
    this.layout = new Layout();
    this.state = SimulationState.INITIALIZED;
    this.rulesEngine = EngineSingleton;
    this.registry = DeviceRegistrySingleton;
  }

  private parseMessage(_topic: string, msg: Buffer) {
    if (msg !== null) {

    }
  }

  async setMainBus() {
    this.mainBus = await messageQueueBuilder(vars.MQ_URI);
    this.mainBus.subscribe("#", this.parseMessage.bind(this));
  }

  async initSimulation() {
    if (!this.mainBus) {
      await this.setMainBus();
    }
  }
}