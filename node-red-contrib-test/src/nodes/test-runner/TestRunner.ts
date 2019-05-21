import { TestFailure } from "../../util";

export class TestRunner {
  private readonly totalOutputs: number;
  private readonly onTestsDone: (failures: TestFailure[]) => void;
  private readonly runNextTest: (testNumber: number) => void;
  private currentOutput: number;
  private testFailures: TestFailure[] = [];

  constructor(
    totalOutputs: number,
    onTestsDone: (failures: TestFailure[]) => void,
    runNextTest: (testNumber: number) => void
  ) {
    this.totalOutputs = totalOutputs;
    this.currentOutput = -1;
    this.onTestsDone = onTestsDone;
    this.runNextTest = runNextTest;
  }

  start() {
    this.testDone();
  }

  private testsDone() {
    return this.currentOutput === this.totalOutputs;
  }

  testDone(failed?: TestFailure) {
    if (failed) {
      this.testFailures.push(failed);
    }

    this.currentOutput++;

    if (this.testsDone()) {
      this.onTestsDone(this.testFailures);
      return;
    }

    this.runNextTest(this.currentOutput);
  }
}
