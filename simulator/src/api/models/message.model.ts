import mongoose from 'mongoose';

/**
 * Message Schema
 * @private
 */

const messageSchema = new mongoose.Schema({
  messageType: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
}, { timestamps: true })

/**
 * @typedef Message
 */
const Message = mongoose.model('Message', messageSchema);
export default Message;