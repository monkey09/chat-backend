const express = require('express')
const authHandler = require('../middlewares/authHandler')
const { 
  signupUser, 
  signinUser,
  getUsers
} = require('../controllers/users')

const router = express.Router()

router.route('/')
.post(signupUser)
.get(authHandler, getUsers)

router.route('/signin')
.post(signinUser)

module.exports = router