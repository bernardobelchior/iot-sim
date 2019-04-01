import Rule from "./Rule";
import { MessageQueue, messageQueueBuilder, QoS } from "../api/MessageQueue";
import { vars } from "../util/vars";
import { timestamp } from "../util";

type RuleMap = { [id: string]: Rule };
type RuleSubscription = { ruleId: string; topic: string };
type RuleRecord = { ruleId: string; state: boolean; time: string };

/**
 * An engine for running and managing list of rules
 */
export default class Engine {
  rules: RuleMap = {};
  records: RuleRecord[] = [];
  subscriptions: RuleSubscription[] = [];
  private messageQueue?: MessageQueue;

  /**
   * Subscribes to the message queue.
   */
  public init = async () => {
    if (!this.messageQueue)
      this.messageQueue = await messageQueueBuilder(
        vars.READ_MQ_URI,
        vars.WRITE_MQ_URI
      );
  };

  public finalize = async () => {
    if (this.messageQueue) this.messageQueue.end();
  };

  /**
   * Get a list of all current rules
   */
  getRules(): RuleMap {
    return this.rules;
  }

  /**
   * Get a rule by id
   * @param {string} id
   * @return {Rule}
   */
  getRule(id: string): Rule {
    try {
      const rule = this.rules[id];
      if (!rule) {
        throw new Error(`Rule ${id} does not exist`);
      } else return rule;
    } catch (error) {
      throw new Error(`Rule ${id} does not exist`);
    }
  }

  /**
   * Add a new rule to the engine's list
   * @param {Rule} rule
   * @return {Promise<string>} rule id
   */
  async addRule(rule: Rule): Promise<string> {
    try {
      this.rules[rule.id] = rule;

      await this.subscribeTopics(rule.id, rule.getSubscriptions());
      await this.rules[rule.id].start();

      this.records.push({
        ruleId: rule.id,
        state: rule.enabled,
        time: timestamp()
      });
      return rule.id;
    } catch (error) {
      throw new Error(`Error creating rule.`);
    }
  }

  /**
   * Update an existing rule
   * @param {string} rule id
   * @param {Rule} rule
   * @return {Promise<string>}
   */
  async updateRule(ruleId: string, updatedRule: Rule): Promise<string> {
    try {
      const rule = this.rules[ruleId];
      if (!rule) {
        return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
      }
      const oldRule = this.rules[ruleId];
      oldRule.stop();
      this.rules[ruleId] = updatedRule;

      const oldSubs = oldRule.getSubscriptions();
      const newSubs = rule.getSubscriptions().filter(s => !oldSubs.includes(s));
      await this.subscribeTopics(ruleId, newSubs);

      const delSubs = oldSubs.filter(s => !newSubs.includes(s));
      if (this.messageQueue && delSubs && Array.isArray(delSubs)) {
        await this.messageQueue.unsubscribe(delSubs);
      }

      if (rule.enabled !== updatedRule.enabled) {
        this.records.push({
          ruleId: rule.id,
          state: updatedRule.enabled,
          time: timestamp()
        });
      }

      await this.rules[ruleId].start();
      return ruleId;
    } catch (error) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
  }

  private async subscribeTopics(ruleId: string, topics: string[]) {
    if (!this.messageQueue) {
      return Promise.resolve();
    }
    for (const t of topics) {
      this.subscriptions.push({ ruleId, topic: t });
      await this.messageQueue.subscribe(
        t,
        this.parseMessage.bind(this),
        QoS.AtMostOnce
      );
    }
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {string}
   */
  async deleteRule(ruleId: string): Promise<string> {
    try {
      const rule = this.rules[ruleId];
      if (!rule) {
        return Promise.reject(`Rule ${ruleId} does not exist`);
      }
      const delRule = this.rules[ruleId];
      delRule.stop();
      delete this.rules[ruleId];

      const topics: string[] = this.subscriptions.reduce(
        (acc: string[], currValue) => {
          if (currValue.ruleId === ruleId) {
            acc.push(currValue.topic);
          }
          return acc;
        },
        []
      );
      this.subscriptions = this.subscriptions.filter(s => s.ruleId !== ruleId);

      this.subscriptions.forEach(sub => {
        const idx = topics.findIndex(t => t === sub.topic);
        if (idx !== -1) {
          topics.splice(idx, 1);
        }
      });

      if (this.messageQueue) {
        await this.messageQueue.unsubscribe(topics);
      }

      this.records = this.records.filter(record => record.ruleId !== ruleId);

      return ruleId;
    } catch (error) {
      return Promise.reject(`Rule ${ruleId} does not exist`);
    }
  }

  async parseMessage(topic: string, msg: Buffer | string) {
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

        const subs = this.subscriptions.filter(sub => sub.topic === topic);
        subs.forEach(sub => {
          const rule = this.getRule(sub.ruleId);
          rule.trigger.update(topic, data);
        });
      }
    }
  }
}
