import Rule from "./Rule";

/**
 * An engine for running and managing list of rules
 */
export default class Engine {
  rules: Rule[] = [];

  /**
   * Get a list of all current rules
   * @return {Promise<Array<Rule>>} rules
   */
  getRules() {
    let rulesPromise = Promise.resolve(this.rules);

    if (!this.rules) {
      rulesPromise = Database.getRules().then(async ruleDescs => {
        this.rules = {};
        for (const ruleId in ruleDescs) {
          ruleDescs[ruleId].id = parseInt(ruleId);
          this.rules[ruleId] = Rule.fromDescription(ruleDescs[ruleId]);
          await this.rules[ruleId].start();
        }
        return this.rules;
      });
    }

    return rulesPromise.then(rules => {
      return Object.keys(rules).map(ruleId => {
        return rules[ruleId];
      });
    });
  }

  /**
   * Get a rule by id
   * @param {number} id
   * @return {Promise<Rule>}
   */
  getRule(id: string) {
    const rule = this.rules[id];
    if (!rule) {
      return Promise.reject(new Error(`Rule ${id} does not exist`));
    }
    return Promise.resolve(rule);
  }

  /**
   * Add a new rule to the engine's list
   * @param {Rule} rule
   * @return {Promise<number>} rule id
   */
  async addRule(rule) {
    const id = await Database.createRule(rule.toDescription());
    rule.id = id;
    this.rules[id] = rule;
    await rule.start();
    return id;
  }

  /**
   * Update an existing rule
   * @param {number} rule id
   * @param {Rule} rule
   * @return {Promise}
   */
  async updateRule(ruleId, rule) {
    if (!this.rules[ruleId]) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
    rule.id = ruleId;
    await Database.updateRule(ruleId, rule.toDescription());

    this.rules[ruleId].stop();
    this.rules[ruleId] = rule;
    await rule.start();
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {Promise}
   */
  deleteRule(ruleId: string): Promise<any> {
    if (!this.rules[ruleId]) {
      return Promise.reject(new Error(`Rule ${ruleId} already does not exist`));
    }
    return Database.deleteRule(ruleId).then(() => {
      this.rules[ruleId].stop();
      delete this.rules[ruleId];
    });
  }

  static setThingProperty(thingId: string, id: string, value: any): any {
    throw new Error('Method not implemented.');
  }
  static getThingProperty(thingId: string, id: string): any {
    throw new Error('Method not implemented.');
  }
  static getThing(thingId: string): any {
    throw new Error("Method not implemented.");
  }
}
