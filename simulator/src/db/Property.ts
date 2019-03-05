import mongoose from "mongoose";

/**
 * Property Schema
 * @private
 */

const propertySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * @typedef Property
 */
const Property = mongoose.model("Property", propertySchema);
export default Property;
