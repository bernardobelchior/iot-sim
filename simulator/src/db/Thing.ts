import mongoose from "mongoose";

/**
 * Thing Schema
 * @private
 */

const thingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

/**
 * @typedef Thing
 */
const Thing = mongoose.model("Thing", thingSchema);
export default Thing;
