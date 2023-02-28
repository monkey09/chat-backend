const express = require('express')
const authHandler = require('../middlewares/authHandler')
const { 
  accessChat, 
  getChats, 
  createGroup, 
  updateGroup,
  addToGroup,
  removeFromGroup
} = require('../controllers/chats')

const router = express.Router()

router.route('/')
.post(authHandler, accessChat)
.get(authHandler, getChats)

router.route('/group')
.post(authHandler, createGroup)
.patch(authHandler, updateGroup)

router.route('/group/add')
.patch(authHandler, addToGroup)

router.route('/group/remove')
.patch(authHandler, removeFromGroup)

module.exports = router