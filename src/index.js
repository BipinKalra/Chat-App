const express = require("express")
const http = require("http")
const path = require("path")
const socketio = require("socket.io")
// const hbs = require("hbs")

const app = express()
// This happens behind the scenes but we are specifically writing this to integrate socket.io in the mix
const server = http.createServer(app)
// Socket IO needs to be passed a raw http server just like below and that is why we have defined the server exlicitly
const io = socketio(server)

const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, "../public")

// app.set("view engine", "hbs")
app.use(express.static(publicPath))

// This socket is an object with client information. Can be used to communicate with the client
io.on("connection", (socket) => {
  console.log("New WebSocket Connection!")

  socket.emit("welcomeMessage")

  socket.on("textMessage", (message) => {
    io.emit("message", message)
  })
})

server.listen(port, () => {
  console.log("Server is up on port - " + port)
})