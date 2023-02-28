const jwt = require('jsonwebtoken')
const User = require('../models/user')
const asyncHandler = require('express-async-handler')

const authHandler = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_ACCESS)
      req.user = await User.findById(decoded.id).select("-password")
      next ()
    } catch (e) {
      res.status(403)
      throw new Error('access forbidden!')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('not authorized!')
  }
})

module.exports = authHandler