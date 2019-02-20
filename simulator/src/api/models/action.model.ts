import mongoose from "mongoose";

/**
 * Action Schema
 * @private
 */

const actionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  href: {
    type: String,
    required: true
  },
  timeRequested: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  }
}, { timestamps: true });

/**
 * @typedef Action
 */
const Action = mongoose.model("Action", actionSchema);
export default Action;