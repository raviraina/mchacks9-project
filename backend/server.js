const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const randomstring = require('randomstring');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');


mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('DB Connected!');
    })
    .catch((err) => {
        console.log(err);
    });

//const server = http.createServer(app);


//const io = socketio(server)
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
});

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
const e = require("express");
const {
    exitCode
} = require("process");

// roomIDs = {
//     "some_id": [player1, player2]
// };

const allRoomsFull = () => {
    //let areRoomsFull = true;
    //rooms.forEach((item)=>{

    //})
    for (let room in rooms) {
        if (rooms[room][1] === "") {
            return false
        }
    }
    return true;
}

io.on("connection", socket => {
    console.log("user connected")

    // socket.emit("createJoinRoom", player);
    socket.on("createJoinRoom", player => {
        console.log("user trying to join room: " + player + " with socket id " + socket.client.id)
        console.log(rooms)
        console.log(allRoomsFull())
        if (Object.keys(rooms).length < 1 || allRoomsFull() === true) {
            const roomId = randomstring.generate({
                length: 4
            });
            userConnected(socket.client.id);
            createRoom(roomId, socket.client.id);
            socket.emit("room-created", roomId);
            socket.emit("player-1-connected");
            socket.join(roomId);
            // roomIDs[roomId] = [player]
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

    // socket.on("create-room", (roomId) => {
    //     if (rooms[roomId]) {
    //         const error = "This room already exists";
    //         socket.emit("display-error", error);
    //     } else {
    //         userConnected(socket.client.id);
    //         createRoom(roomId, socket.client.id);
    //         socket.emit("room-created", roomId);
    //         socket.emit("player-1-connected");
    //         socket.join(roomId);
    //     }
    // })

    // socket.on("join-room", roomId => {
    //     if (!rooms[roomId]) {
    //         const error = "This room doen't exist";
    //         socket.emit("display-error", error);
    //     } else {
    //         userConnected(socket.client.id);
    //         joinRoom(roomId, socket.client.id);
    //         socket.join(roomId);

    //         socket.emit("room-joined", roomId);
    //         socket.emit("player-2-connected");
    //         socket.broadcast.to(roomId).emit("player-2-connected");
    //         initializeChoices(roomId);
    //     }
    // })

    // socket.on("join-random", () => {
    //     let roomId = "";

    //     for (let id in rooms) {
    //         if (rooms[id][1] === "") {
    //             roomId = id;
    //             break;
    //         }
    //     }

    //     if (roomId === "") {
    //         const error = "All rooms are full or none exists";
    //         socket.emit("display-error", error);
    //     } else {
    //         userConnected(socket.client.id);
    //         joinRoom(roomId, socket.client.id);
    //         socket.join(roomId);

    //         socket.emit("room-joined", roomId);
    //         socket.emit("player-2-connected");
    //         socket.broadcast.to(roomId).emit("player-2-connected");
    //         initializeChoices(roomId);
    //     }
    // });

    socket.on("make-move", ({
        playerId,
        myChoice,
        roomId
    }) => {
        makeMove(roomId, playerId, myChoice);

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
                } else {
                    enemyChoice = playerOneChoice;
                }

                io.to(roomId).emit("player-1-wins", {
                    myChoice,
                    enemyChoice
                });
            } else {
                let enemyChoice = "";

                if (playerId === 1) {
                    enemyChoice = playerTwoChoice;
                } else {
                    enemyChoice = playerOneChoice;
                }

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