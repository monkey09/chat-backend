const asyncHandler = require('express-async-handler')
const { accessGenerator } = require('../utils/tokenHandler')
const User = require('../models/user')

const signupUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('empty fields!')
  }
  
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('user exists!')
  }

  const user = await User.create({
    name,
    email,
    password,
    pic
  })
  if (user) {
    res.status(201).json({message: 'created successfully'})
  } else {
    res.status(500)
    throw new Error('creation failed!')
  }
})

const signinUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400)
    throw new Error('empty fields!')
  }

  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: accessGenerator(user._id)
    })
  } else {
    res.status(404)
    throw new Error('not found!')
  }
})

const getUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search ? {
    $or: [
      {name: {$regex: req.query.search, $options: 'i'}},
      {email: {$regex: req.query.search, $options: 'i'}}
    ]
  } : {}

  const users = await User.find(keyword).find({_id: {$ne: req.user.id}})

  res.json(users)
})

module.exports = { signupUser, signinUser, getUsers }