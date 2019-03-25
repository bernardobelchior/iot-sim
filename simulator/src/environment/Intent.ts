enum IntentType {
  "turn",
  "switch",
  "make",
  "change",
  "set",
  "dim",
  "brighten"
}

export class Intent {
  type: IntentType;
  constructor() {
    this.type = IntentType.brighten;
  }
}
