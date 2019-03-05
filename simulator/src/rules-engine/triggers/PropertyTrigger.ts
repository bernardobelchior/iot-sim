import { Events } from "../Events";
import { Trigger } from "./Trigger";
import { Property } from "../Property";

/**
 * An abstract class for triggers whose input is a single property
 */
class PropertyTrigger extends Trigger {
  constructor(desc) {
    super(desc);
    this.property = new Property(desc.property);
    this.onValueChanged = this.onValueChanged.bind(this);
  }

  /**
   * @return {TriggerDescription}
   */
  toDescription() {
    return Object.assign(
      super.toDescription(),
      {property: this.property.toDescription()}
    );
  }

  async start() {
    this.property.on(Events.VALUE_CHANGED, this.onValueChanged);
    await this.property.start();
  }

  onValueChanged(_value) {
  }

  stop() {
    this.property.removeListener(Events.VALUE_CHANGED, this.onValueChanged);
    this.property.stop();
  }
}

module.exports = PropertyTrigger;
