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