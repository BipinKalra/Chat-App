// This file contains code for learning.
// Includes the code written to test connection between server and client

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

let count = 0

// This socket is an object with client information. Can be used to communicate with the client
io.on("connection", (socket) => {
  console.log("New WebSocket Connection!")

  // Any number of variables sent to the client using emit can be accessed from the callback function at the client side
  socket.emit("countUpdated", count)

  socket.on("increment", () => {
    count++
    // This emits the message to only the current connection
    // socket.emit('countUpdated', count)

    io.emit("countUpdated", count)
  })
})

server.listen(port, () => {
  console.log("Server is up on port - " + port)
})