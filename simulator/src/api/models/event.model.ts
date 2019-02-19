import mongoose from 'mongoose';

/**
 * Message Schema
 * @private
 */

const eventSchema = mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  data: {
    type: Number
  },
  timestamps: true
})

/**
 * @typedef Event
 */
const Event = mongoose.model('Event', eventSchema);
export default Event;