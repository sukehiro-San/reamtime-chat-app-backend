const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes/api");
require("dotenv").config();
mongoose
  .connect("mongodb://localhost:27017/chat-app")
  .then((connection) => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log(err);
  });
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use("/api", routes);
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins, configure for production
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // Event: User joins a specific chat room
  socket.on("join-room", ({ username, room }) => {
    socket.join(room);

    // Broadcast to others in the room that a new user has joined
    socket.to(room).emit("message", {
      username: "ChatBot",
      message: `${username} has joined the room.`,
      time: new Date().toLocaleTimeString(),
    });

    console.log(`${username} joined room: ${room}`);
  });

  // Event: Listen for a new chat message
  socket.on("chat-message", (data) => {
    const { username, room, message, date, time } = data;

    // Emit the message to everyone in the room
    io.to(room).emit("message", {
      username,
      message,
      date,
      time,
    });

    console.log(`[${room}] ${username}: ${message}`);
  });

  socket.on("typing-start", (data) => {
    const { username, room } = data;
    console.log(`[${room}] ${username} is typing`);
    io.to(room).emit("typing", { username, room, status: "typing" });
  });

  socket.on("typing-stop", (data) => {
    const { username, room } = data;
    console.log(`[${room}] ${username} has stopped typing...`);
    io.to(room).emit("typing", { username, room, status: "stopped" });
  });

  // Event: User disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Emit a user-left event to all rooms (if necessary, you can pass the room and username)
    socket.broadcast.emit("message", {
      username: "ChatBot",
      message: "A user has left the chat.",
      time: new Date().toLocaleTimeString(),
    });
  });

  // Event: Leave room
  socket.on("leave-room", ({ username, room }) => {
    socket.leave(room);

    // Broadcast to others in the room that the user has left
    socket.to(room).emit("message", {
      username: "ChatBot",
      message: `${username} has left the room.`,
      time: new Date().toLocaleTimeString(),
    });

    console.log(`${username} left room: ${room}`);
  });
});

server.listen(3000, () => {
  console.log("Server running on port: 3000");
});
