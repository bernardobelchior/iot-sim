import Rule from "./Rule";

type RuleMap = { [id: string]: Rule };
type RuleRecord = { ruleId: string; state: boolean; date: number };

/**
 * An engine for running and managing list of rules
 */
export default class Engine {
  rules: RuleMap = {};
  records: RuleRecord[] = [];

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
      await this.rules[rule.id].start();

      this.records.push({ ruleId: rule.id, state: rule.enabled, date: Date.now() });
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

      if (rule.enabled !== updatedRule.enabled) {
        this.records.push({ ruleId: rule.id, state: updatedRule.enabled, date: Date.now() });
      }

      await this.rules[ruleId].start();
      return ruleId;
    } catch (error) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {string}
   */
  deleteRule(ruleId: string): string {
    try {
      const rule = this.rules[ruleId];
      if (!rule) {
        throw new Error(`Rule ${ruleId} does not exist`);
      }
      const delRule = this.rules[ruleId];
      delRule.stop();
      delete this.rules[ruleId];

      this.records = this.records.filter(record => record.ruleId !== ruleId);

      return ruleId;
    } catch (error) {
      throw new Error(`Rule ${ruleId} does not exist`);
    }
  }
}
