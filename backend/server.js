// init
const app = require('express');
const socket = require('socket.io');
const express = app();

// start server on port 4000
const server = express.listen(4000, () => {
    console.log("server started at http://localhost:4000");
})

// init
express.use(app.static('public'));
const io = socket(server);


// player info
let players = {};
let choice1 = "";
let choice2 = "";

// TODO: socket functions to implement frontend side
// createdGame, p1, p2, newGame, result

io.on("connection", (socket) => {

    // create a new game
    socket.on("initializeGame", (data) => {
        // TOOD: create a random room ID
        const id = "aaaa"

        // join the initialized game
        socket.join(id);
        players[id] = data.name;
        socket.emit("createdGame", {
            id: id
        });
    })

    // join a created game
    socket.on("joinGame", (data) => {
        socket.join(data.id);
        socket.to(data.id).emit("p2", {
            p2name: data.name,
            p1name: players[data.id]
        });
        socket.emit("p1", {
            p2name: players[data.roomID],
            p1name: data.name
        });
    })

    // get choices from each player
    socket.on("ChoiceP1", (data) => {
        p1choice = data.choice;
        console.log(choice1, choice2);
        if (choice2 != "") {
            compare(data.roomID);
        }
    });

    socket.on("ChoiceP2", (data) => {
        choice2 = data.choice;
        console.log(choice1, choice2);
        if (choice1 != "") {
            compare(data.roomID);
        }
    });
})

// return true if player 1 wins
const getWinner = (p1Choice, p2Choice) => {
    // TODO: Implement logic
}

const compare = (roomID) => {
    var winner = getWinner(p1Choice, p2Choice);

    // return winner
    io.sockets.to(roomID).emit("result", {
        winner: winner
    });

    // reset choices
    choice1 = "";
    choice2 = "";
}