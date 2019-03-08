import mongoose from "mongoose";

/**
 * Rule Schema
 * @private
 */

const ruleSchema = new mongoose.Schema(
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
 * @typedef Rule
 */
const Rule = mongoose.model("Rule", ruleSchema);
export default Rule;
