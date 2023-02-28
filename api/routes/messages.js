const express = require("express")
const multer = require('multer')
const authHandler = require('../middlewares/authHandler')
const {
  allMessages,
  sendMessage,
  sendRecord
} = require("../controllers/messages")

const router = express.Router()
const multerInstance = multer()

router.route("/:chatId")
.get(authHandler, allMessages)

router.route("/")
.post(authHandler, sendMessage)

router.route("/record")
.post(authHandler, multerInstance.single('file'), sendRecord)

module.exports = router