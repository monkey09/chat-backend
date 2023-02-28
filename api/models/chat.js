const mongoose = require('mongoose')

const chatModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    multi: {
      type: Boolean,
      default: false
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    latest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

const Chat = mongoose.model('Chat', chatModel)
module.exports = Chat