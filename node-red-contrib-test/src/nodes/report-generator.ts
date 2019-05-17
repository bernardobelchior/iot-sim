import { NodeProperties, Red } from "node-red";
import { Node } from "node-red-contrib-typescript-node";
import { TestFailure } from "../util";

interface Config extends NodeProperties {
  outputs: number;
}

module.exports = function(RED: Red) {
  class ReportGeneratorNode extends Node {
    constructor(config: Config) {
      super(RED);

      this.createNode(config);

      this.context().flow.generateReport = this.generateReport.bind(this);
    }

    generateReport(failures: TestFailure[]): void {
      this.send({
        payload: {
          failures
        }
      });
    }
  }

  ReportGeneratorNode.registerType(RED, "report-generator");
};

export interface ReportGeneratorNode extends Node {
  generateReport: (failures: TestFailure[]) => void;
}
