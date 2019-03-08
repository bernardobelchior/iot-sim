import RuleSchema from "../db/Rule";
import Rule from "./Rule";

/**
 * An engine for running and managing list of rules
 */
export default class Engine {
  rules: Map<string, Rule> = new Map<string, Rule>();

  /**
   * Get a list of all current rules
   */
  async getRules() {
    try {
      const rulesDb = await RuleSchema.find({});
      rulesDb.map(async (rDesc: any) => {
        const rule = Rule.fromDescription(rDesc);
        await rule.start();
        this.rules.set(rDesc.id, rule);
      });
    } catch (error) {
      throw new Error("Error obtaining rules");
    }
    return this.rules;
  }

  /**
   * Get a rule by id
   * @param {number} id
   * @return {Promise<Rule>}
   */
  async getRule(id: string) {
    const rule = this.rules.get(id);
    if (!rule) {
      return Promise.reject(new Error(`Rule ${id} does not exist`));
    }
    return Promise.resolve(rule);
  }

  /**
   * Add a new rule to the engine's list
   * @param {Rule} rule
   * @return {Promise<string>} rule id
   */
  async addRule(rule: Rule) {
    const r = await RuleSchema.create(rule.toDescription());
    rule.id = r.id;
    this.rules.set(r.id, rule);
    await rule.start();
    return rule.id;
  }

  /**
   * Update an existing rule
   * @param {string} rule id
   * @param {Rule} rule
   * @return {Promise}
   */
  async updateRule(ruleId: string, rule: Rule) {
    if (!this.rules.has(ruleId)) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
    rule.id = ruleId;
    await RuleSchema.update(ruleId, rule.toDescription());

    const oldRule = this.rules.get(ruleId);
    if (oldRule) {
      oldRule.stop();
    }
    this.rules.set(ruleId, rule);
    return await rule.start();
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {Promise}
   */
  async deleteRule(ruleId: string) {
    if (!this.rules.has(ruleId)) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
    await RuleSchema.findByIdAndDelete(ruleId);
    const delRule = this.rules.get(ruleId);
    if (delRule) {
      delRule.stop();
    }
    this.rules.delete(ruleId);
  }
}
