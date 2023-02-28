const jwt = require('jsonwebtoken')

const accessGenerator = id => {
  const token = jwt.sign(
    {id},
    process.env.JWT_ACCESS,
    {
      expiresIn: '1d'
    }
  )
  return token
}

module.exports = { accessGenerator }