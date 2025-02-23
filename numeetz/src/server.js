const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("register", (peerId) => {
    users[socket.id] = peerId;
    console.log("Registered Peer:", peerId);
  });

  socket.on("call-user", (data) => {
    io.to(data.userToCall).emit("incoming-call", {
      from: data.from,
      signal: data.signal,
    });
  });

  socket.on("accept-call", (data) => {
    io.to(data.to).emit("call-accepted", data.signal);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    delete users[socket.id];
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
