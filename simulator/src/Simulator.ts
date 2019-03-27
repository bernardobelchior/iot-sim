import { Agent } from "./environment/Agent";
import { Layout } from "./environment/Layout";
import Engine from "./rules-engine/Engine";
import { DeviceRegistry } from "./api/DeviceRegistry";
import Message from "./db/Message";
import { MessageQueue, messageQueueBuilder } from "./api/MessageQueue";
import { vars } from "./util/vars";

enum SimulationState {
  INITIALIZED,
  RUNNING,
  FINISHED,
  PAUSED,
}

/**
 * Main class responsible for the management of all entities involved in the simulation
 */
export class Simulator {
  private agents: Agent[] = [];
  private layout: Layout;
  private rulesEngine: Engine;
  private registry: DeviceRegistry;
  private mainBus?: MessageQueue;

  state: SimulationState;

  /**
   * Initializes the simulation data
   */
  constructor() {
    this.layout = new Layout();
    this.state = SimulationState.INITIALIZED;
    this.rulesEngine = new Engine();
    this.registry = new DeviceRegistry();
  }

  /**
   * Returns the registry
   * @returns {DeviceRegistry}
   */
  public getRegistry(): DeviceRegistry {
    return this.registry;
  }

  /**
   * Returns the rules engine
   * @returns {Engine}
   */
  public getRulesEngine(): Engine {
    return this.rulesEngine;
  }

  /**
   * Returns the simulation agents
   * @returns {Agent[]}
   */
  public getAgents(): Agent[] {
    return this.agents;
  }

  /**
   * Returns the simulation layout
   * @returns {Layout}
   */
  public getLayout(): Layout {
    return this.layout;
  }

  /**
   * Consumes and parses all messages (topic #)
   * @param {string} topic
   * @param {Buffer} msg
   */
  private async parseMessage(topic: string, msg: Buffer | string) {
    if (msg !== null) {
      let obj: any = undefined;
      if (Buffer.isBuffer(msg)) {
        obj = JSON.parse(msg.toString());
      } else {
        obj = JSON.parse(msg);
      }
      const levels = topic.split("/");
      if (levels[0] === "things" && obj.hasOwnProperty("messageType")) {
        const { messageType, ...data } = obj;
        if (process.env.NODE_ENV !== "test")
          await Message.create({ thing: levels[1], messageType, data: data });
      }
    }
  }

  /**
   * Initializes the registry and the asynchronous channels of communication
   */
  async init() {
    this.mainBus = await messageQueueBuilder(vars.MQ_URI);
    this.mainBus.subscribe("#", this.parseMessage.bind(this));
    await this.registry.init();
    await this.rulesEngine.init();
  }

  async finalize() {
    if (this.mainBus) {
      this.mainBus.end();
    }
    await this.rulesEngine.finalize();
    await this.registry.finalize();
  }

  /**
   * Starts the simulation
   */
  async startSimulation() {
    if (!this.mainBus) {
      await this.init();
    }
  }
}

export const SimulatorSingleton = new Simulator();