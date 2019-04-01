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
  PAUSED
}

/**
 * Main class responsible for the management of all entities involved in the simulation
 */
export class Simulator {
  private agents: Agent[] = [];
  private layout: Layout;
  private rulesEngine: Engine;
  private registry: DeviceRegistry;
  private mainBus: MessageQueue;
  static simulator?: Simulator;

  state: SimulationState;

  static async getInstance(): Promise<Simulator> {
    if (this.simulator === undefined) {
      const mq = await messageQueueBuilder(vars.READ_MQ_URI, vars.WRITE_MQ_URI);

      this.simulator = new Simulator(mq);
      await this.simulator.init();
    }

    return this.simulator;
  }

  /**
   * Initializes the simulation data
   */
  constructor(mq: MessageQueue) {
    this.layout = new Layout();
    this.state = SimulationState.INITIALIZED;
    this.rulesEngine = new Engine(mq);
    this.registry = new DeviceRegistry(mq);
    this.mainBus = mq;
  }

  /**
   * Returns the registry
   * @returns {DeviceRegistry}
   */
  public getRegistry(): DeviceRegistry {
    return this.registry;
  }

  public setRegistry(registry: DeviceRegistry) {
    this.registry = registry;
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
    await this.mainBus.subscribe("#", this.parseMessage.bind(this));
    await this.registry.init();
    await this.rulesEngine.init();
  }

  async finalize() {
    await this.mainBus.end();
    await this.rulesEngine.finalize();
    await this.registry.finalize();
  }

  /**
   * Starts the simulation
   */
  async startSimulation() {
    await this.init();
  }
}
