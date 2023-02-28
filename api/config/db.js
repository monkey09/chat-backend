const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'chat'
    })
  } catch (e) {
    process.exit()
  }
}

module.exports = connectDB