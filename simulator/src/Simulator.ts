import { Agent } from "./environment/Agent";
import { Layout } from "./environment/Layout";
import Engine from "./rules-engine/Engine";
import DeviceRegistry from "./api/DeviceRegistry";
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
   * Consumes and parses sent to the general channel of communication (topic #)
   * @param {string} topic
   * @param {Buffer} msg
   */
  private parseMessage(topic: string, msg: Buffer) {
    if (msg !== null) {

    }
  }

  /**
   * Initializes the registry and the asynchronous channels of communication
   */
  async init() {
    await this.registry.init();
    this.mainBus = await messageQueueBuilder(vars.MQ_URI);
    this.mainBus.subscribe("#", this.parseMessage.bind(this));
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