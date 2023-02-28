const asyncHandler = require('express-async-handler')
const Chat = require('../models/chat')
const User = require('../models/user')

const accessChat = asyncHandler((async (req, res) => {
  const { id } = req.body
  
  if (!id) {
    res.status(400)
    throw new Error('no id!')
  }

  const isChat = await Chat.find({
    multi: false,
    $and: [
      {users: {$elemMatch: {$eq: req.user._id}}},
      {users: {$elemMatch: {$eq: id}}}
    ]
  })
  .populate('users', '-password')
  .populate('latest')

  const userChats = await User.populate(isChat, {
    path: 'latest.sender',
    select: 'name pic email'
  })

  if (userChats.length > 0) {
    res.status(200).json(userChats[0])
  } else {
    const chatData = {
      name: 'sender',
      multi: false,
      users: [req.user._id, id]
    }

    try {
      const createdChat = await Chat.create(chatData)
      const chat = await Chat.findOne({ 
        _id: createdChat._id 
      })
      .populate('users', '-password')

      res.status(200).json(chat)
    } catch (e) {
      res.status(500)
      throw new Error('bad request!')
    }
  }
}))

const getChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({
      users: {$elemMatch: {$eq: req.user._id}}
    })
    .populate('users', '-password')
    .populate('admin', '-password')
    .populate('latest')
    .sort({ updatedAt: -1 })

    const userChats = await User.populate(chats, {
      path: 'latest.sender',
      select: 'name pic email'
    })

    res.status(200).json(userChats)
  } catch (e) {
    res.status(400)
    throw new Error('bad request!')
  }
})

const createGroup = asyncHandler(async (req, res) => {
  let { users, name } = req.body
  if (!users || !name) {
    res.status(400)
    throw new Error('empty fields!')
  }

  if (users.length < 2) {
    res.status(400)
    throw new Error('less than 2!')
  }
  
  users.push(req.user)
  try {
    const createdGroup = await Chat.create({
      name,
      users,
      multi: true,
      admin: req.user
    })

    const group = await Chat.findOne({
      _id: createdGroup._id
    })
    .populate('users', '-password')
    .populate('admin', '-password')

    res.status(200).json(group)
  } catch (e) {
    res.status(500)
    throw new Error('bad request!')
  }
})

const updateGroup = asyncHandler(async (req, res) => {
  const { name, id } = req.body

  if (!id || !name) {
    res.status(400)
    throw new Error('empty fields!')
  }

  try {
    const updatedGroup = await Chat.findByIdAndUpdate (
      id, 
      {name}, 
      {new: true}
    )
    .populate('users', '-password')
    .populate('admin', '-password')

    if (!updatedGroup) {
      res.status(404)
      throw new Error('not found!')
    } else {
      res.status(200).json(updatedGroup)
    }
  } catch (e) {
    res.status(500)
    throw new Error('bad request!')
  }
})

const addToGroup = asyncHandler(async (req, res) => {
  const { chat, user } = req.body

  if (!user || !chat) {
    res.status(400)
    throw new Error('empty fields!')
  }

  const exist = chat.users.find(u => u._id == user._id)
  if (exist) {
    res.status(400)
    throw new Error('already exist!')
  }

  try {
    const added = await Chat.findByIdAndUpdate(
      chat._id,
      {$push: {users: user}},
      {new: true}
    )
    .populate('users', '-password')
    .populate('admin', '-password')
    
    if (!added) {
      res.status(400)
      throw new Error('bad request!')
    } else {
      res.status(200).json(added)
    }
  } catch (e) {
    res.status(500)
    throw new Error('bad request!')
  }
})

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chat, user } = req.body

  if (chat.users.length <= 3) {
    res.status(400)
    throw new Error('less than 2!')
  }

  if (user._id == req.user._id) {
    res.status(400)
    throw new Error('admin remove!')
  }

  try {
    const removed = await Chat.findByIdAndUpdate(
      chat._id,
      {$pull: {users: {$in: [user._id]}}},
      {new: true}
    )
    .populate('users', '-password')
    .populate('admin', '-password')
    if (!removed) {
      res.status(404)
      throw new Error('not found!')
    } else {
      res.status(200).json(removed)
    }
  } catch (e) {
    res.status(500)
    throw new Error('bad request!')
  }
})

module.exports = { 
  accessChat, 
  getChats, 
  createGroup,
  updateGroup,
  addToGroup,
  removeFromGroup
}