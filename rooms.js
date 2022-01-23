const rooms = {};

const createRoom = (roomId, player1Id) => {
    rooms[roomId] = [player1Id, ""];
}

const joinRoom = (roomId, player2Id) => {
    rooms[roomId][1] = player2Id;
}

const exitRoom = (roomId, player) => {
    rooms[roomId][player -1 ] = "";
    if (rooms[roomId][0] === "" && rooms[roomId][1] === ""){
        delete rooms[roomId]
    }
    //if (player === 1) {
        //delete rooms[roomId];
    //} else {
        //console.log(JSON.stringify(rooms))
        //console.log("trying to exit " + roomId)
        //rooms[roomId][1] = "";
    //}
}

module.exports = {
    rooms,
    createRoom,
    joinRoom,
    exitRoom
};