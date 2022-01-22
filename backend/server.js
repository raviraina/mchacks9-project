const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../frontend")));

const io = socketio(server);
const {
    userConnected,
    connectedUsers,
    initializeChoices,
    moves,
    makeMove,
    choices
} = require("./util/users");
const {
    createRoom,
    joinRoom,
    exitRoom,
    rooms
} = require("./util/rooms");
const e = require("express");
const {
    exitCode
} = require("process");

io.on("connection", socket => {

    socket.on("create-room", (roomId) => {

        if (rooms[roomId]) {
            const error = "This room already exists";
            socket.emit("display-error", error);

        } else {
            userConnected(socket.client.id);
            createRoom(roomId, socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
        }
    })
})

server.listen(5000, () => console.log("Server started on port 5000..."));