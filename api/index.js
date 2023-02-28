// init
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const colors = require('colors')
const cors = require('cors')
const path = require("path")
const { 
  notFound, 
  errorHandler 
} = require('./middlewares/errorHandler')
// routes
const users = require('./routes/users')
const chats = require('./routes/chats')
const messages = require('./routes/messages')
// func
const app = express()
dotenv.config()
connectDB()
// app
app.use(cors())
app.use(express.json())
// app routes 
app.use('/api/users', users)
app.use('/api/chats', chats)
app.use('/api/messages', messages)
const __dirname1 = path.resolve()
app.use(express.static(path.join(__dirname1, "/out")))
app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname1, "out", "index.html"))
)
// app errors
app.use(notFound)
app.use(errorHandler)
// listen
const PORT = process.env.PORT || 5000
const server= app.listen(PORT, console.log(`Server is up on: ${PORT.blue.bold}`))

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000',
  }
})

let actives = []

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    actives.push({c: userData._id, s: socket.id})
    io.emit('broadcast', actives)
    socket.join(userData._id)
    socket.emit('connected')
  })
  socket.on('join chat', (room) => {
    socket.join(room)
  })
  socket.on('typing', (room) => socket.in(room).emit('typing', room))
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'))
  socket.on('new message', (newMessageRec) => {
    const chat = newMessageRec.chat
    if (!chat.users) {
      return 
    }
    chat.users.forEach(user => {
      if (user._id == newMessageRec.sender._id) {
        return
      }
      socket.in(user._id).emit('message recieved', newMessageRec)
    })
  })

  socket.on('logout', () => {
    const userOff = actives.find(active => active.s == socket.id)
    actives = actives.filter(active => active.s != socket.id)
    io.emit('broadcast', actives)
    socket.off('setup', () => socket.leave(userOff._id))
  })
  socket.on('disconnect', () => {
    const userOff = actives.find(active => active.s == socket.id)
    actives = actives.filter(active => active.s != socket.id)
    io.emit('broadcast', actives)
    socket.off('setup', () => socket.leave(userOff._id))
  })
})