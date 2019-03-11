import RuleSchema from "../db/Rule";
import Rule from "./Rule";

type RuleMap = { [id: string]: Rule };

/**
 * An engine for running and managing list of rules
 */
export default class Engine {
  rules: RuleMap = {};
  rulesPromise: any = undefined;

  /**
   * Get a list of all current rules
   */
  async getRules(): Promise<RuleMap> {
    if (Object.keys(this.rules).length > 0) {
      return Promise.resolve(this.rules);
    }

    if (this.rulesPromise) {
      return this.rulesPromise.then((rules: RuleMap) => {
        return rules;
      });
    }

    this.rulesPromise = RuleSchema.find({}).then(async rulesDb => {
      this.rulesPromise = undefined;

      this.rules = {};
      for (const rule of rulesDb) {
        this.rules[rule.id] = Rule.fromDescription(rule);
        await this.rules[rule.id].start();
      }
      return this.rules;
    });

    return this.rulesPromise;
  }

  /**
   * Get a rule by id
   * @param {string} id
   * @return {Promise<Rule>}
   */
  async getRule(id: string): Promise<Rule> {
    try {
      const rule = (await this.getRules())[id];
      if (!rule) {
        return Promise.reject(new Error(`Rule ${id} does not exist`));
      } else return Promise.resolve(rule);
    } catch (error) {
      return Promise.reject(new Error(`Rule ${id} does not exist`));
    }
  }

  /**
   * Add a new rule to the engine's list
   * @param {Rule} rule
   * @return {Promise<string>} rule id
   */
  async addRule(rule: Rule): Promise<string> {
    try {
      const r = await RuleSchema.create(rule.toDescription());
      rule.id = r.id;
      this.rules[r.id] = rule;
      await this.rules[r.id].start();
      return r.id;
    } catch (error) {
      return Promise.reject(new Error(`Error creating rule.`));
    }
  }

  /**
   * Update an existing rule
   * @param {string} rule id
   * @param {Rule} rule
   * @return {Promise<string>}
   */
  async updateRule(ruleId: string, rule: Rule): Promise<string> {
    try {
      const rule = (await this.getRules())[ruleId];
      if (!rule) {
        return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
      }
      const uRule = await RuleSchema.update(ruleId, rule.toDescription(), {
        new: true
      });
      const oldRule = this.rules[ruleId];
      oldRule.stop();
      this.rules[ruleId] = uRule.fromDescription();
      await this.rules[ruleId].start();
      return ruleId;
    } catch (error) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
  }

  /**
   * Delete an existing rule
   * @param {number} rule id
   * @return {Promise<string>}
   */
  async deleteRule(ruleId: string): Promise<string> {
    try {
      const rule = (await this.getRules())[ruleId];
      if (!rule) {
        return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
      }
      await RuleSchema.findByIdAndDelete(ruleId);
      const delRule = this.rules[ruleId];
      await delRule.stop();
      delete this.rules[ruleId];
      return ruleId;
    } catch (error) {
      return Promise.reject(new Error(`Rule ${ruleId} does not exist`));
    }
  }
}
