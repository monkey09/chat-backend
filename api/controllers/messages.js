const asyncHandler = require("express-async-handler")
const Message = require("../models/message")
const User = require("../models/user")
const Chat = require("../models/chat")

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find(
      { 
        chat: req.params.chatId 
      }
    )
    .populate("sender", "name pic email")
    .populate("chat")
    res.status(200).json(messages)
  } catch (e) {
    res.status(500)
    throw new Error('bad request!')
  }
})

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body

  if (!content || !chatId) {
    res.status(400)
    throw new Error('empty fields!')
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email"
    })

    await Chat.findByIdAndUpdate(req.body.chatId, { latest: message })

    res.status(200).json(message)
  } catch (e) {
    res.status(500)
    throw new Error('bad reqesut!')
  }
})

const sendRecord = asyncHandler(async (req, res) => {
  const content = req.file.buffer.toString('base64')
  const chatId = req.body.chat

  if (!content || !chatId) {
    res.status(400)
    throw new Error('empty fields!')
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    record: true
  }

  try {
    let message = await Message.create(newMessage)

    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email"
    })

    await Chat.findByIdAndUpdate(chatId, { latest: message })

    res.status(200).json(message)
  } catch (e) {
    res.status(500)
    throw new Error('bad reqesut!')
  }
})

module.exports = { allMessages, sendMessage, sendRecord }