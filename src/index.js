const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
// const hbs = require("hbs")

const app = express();
// This happens behind the scenes but we are specifically writing this to integrate socket.io in the mix
const server = http.createServer(app);
// Socket IO needs to be passed a raw http server just like below and that is why we have defined the server exlicitly
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public");

// app.set("view engine", "hbs")
app.use(express.static(publicPath));

// This socket is an object with client information. Can be used to communicate with the client
io.on("connection", (socket) => {
  console.log("New WebSocket Connection!");

  // socket.emit - to emit to that particular connection
  // socket.broadcast.emit - to emit to everyone but that particular connection
  // io.emit - to emit to everyone
  // socket.broadcast.to(roomname).emit - emit to everyone but you in a particular room
  // io.to(roomname).emit - emit to everyone in the room

  socket.on("join", ({ username, room }, callback) => {
    // This feature in socket.io gives a method to emit events specifically to the mentioned room
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined the room!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("textMessage", (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  // Predefined event for when a connection is terminated
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has disconnected!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("Server is up on port - " + port);
});
