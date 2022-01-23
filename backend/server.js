// init
const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const randomstring = require('randomstring');
const app = express();
const server = http.createServer(app);

// setup server
const {
    Server
} = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// get users and rooms modules
const {
    userConnected,
    connectedUsers,
    initializeChoices,
    moves,
    makeMove,
    choices
} = require("./users");

const {
    createRoom,
    joinRoom,
    exitRoom,
    rooms
} = require("./rooms");

// init
const e = require("express");
const {
    exitCode
} = require("process");

// helper function to check room status
const allRoomsFull = () => {
    for (let room in rooms) {
        if (rooms[room][1] === "") {
            return false
        }
    }
    return true;
}

const updateLeaderboard = (playerID, win) => {
    // if playerID not in database
    // create playerID entry

    // if win is true
    // increment playerID win, games played fields
    // else
    // increment games played field
}

// socket functions
io.on("connection", socket => {
    console.log("user connected")

    socket.on("createJoinRoom", player => {
        console.log("user trying to join room: " + player + " with socket id " + socket.client.id)

        if (Object.keys(rooms).length < 1 || allRoomsFull() === true) {
            const roomId = randomstring.generate({
                length: 4
            });
            userConnected(socket.client.id);
            createRoom(roomId, socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
        } else {
            for (let room in rooms) {
                console.log(rooms[room][1])

                if (rooms[room][1] === "") {
                    let roomId = room
                    userConnected(socket.client.id);
                    joinRoom(roomId, socket.client.id);
                    socket.join(roomId);
                    socket.emit("room-joined", roomId);
                    socket.emit("player-2-connected", player);
                    socket.broadcast.to(roomId).emit("player-2-connected");
                    initializeChoices(roomId);
                    break
                }
            }
        }
    })

    socket.on("make-move", ({
        userId,
        playerId,
        myChoice,
        roomId
    }) => {
        makeMove(roomId, playerId, myChoice);
        console.log("move made: " + myChoice + " by player " + playerId + " in room " + roomId)
        console.log(JSON.stringify(choices))

        if (choices[roomId][0] !== "" && choices[roomId][1] !== "") {
            let playerOneChoice = choices[roomId][0];
            let playerTwoChoice = choices[roomId][1];

            if (playerOneChoice === playerTwoChoice) {
                let message = "Both of you chose " + playerOneChoice + " . So it's draw";
                io.to(roomId).emit("draw", message);

            } else if (moves[playerOneChoice] === playerTwoChoice) {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice = playerTwoChoice;
                    updateLeaderboard(userId, true);
                } else {
                    enemyChoice = playerOneChoice;
                    updateLeaderboard(userId, false);
                }

                io.to(roomId).emit("player-1-wins", {
                    myChoice,
                    enemyChoice
                });
            } else {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice = playerTwoChoice;
                    updateLeaderboard(userId, true);
                } else {
                    enemyChoice = playerOneChoice;
                    updateLeaderboard(userId, false);
                }

                updateLeaderboard(userId, true)
                io.to(roomId).emit("player-2-wins", {
                    myChoice,
                    enemyChoice
                });
            }

            choices[roomId] = ["", ""];
        }
    });

    socket.on("disconnect", () => {
        if (connectedUsers[socket.client.id]) {
            let player;
            let roomId;

            for (let id in rooms) {
                if (rooms[id][0] === socket.client.id ||
                    rooms[id][1] === socket.client.id) {
                    if (rooms[id][0] === socket.client.id) {
                        player = 1;
                    } else {
                        player = 2;
                    }

                    roomId = id;
                    break;
                }
            }

            exitRoom(roomId, player);

            if (player === 1) {
                io.to(roomId).emit("player-1-disconnected");
            } else {
                io.to(roomId).emit("player-2-disconnected");
            }
        }
    })
})

server.listen(4000, () => console.log("Server started on port 4000..."));