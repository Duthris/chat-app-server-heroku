const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const { setIO } = require('./socket-io');
require('dotenv').config();

const port = process.env.PORT || 1337;
const server = http.createServer(app);
let io = setIO(server);

const sockets = {};

const createRoom = (roomName) => {
    if (sockets[roomName]) return;
    sockets[roomName] = { users: [] };
}

const joinRoom = (roomName, socket) => {
    if (!sockets[roomName]) return;
    sockets[roomName].users.push({ id: socket.id, socket: socket, userName: undefined });
}

const setUserName = (roomName, socket, userName) => {
    if (!sockets[roomName]) return;
    let user = sockets[roomName].users.find(user => user.id === socket.id);
    if (user) user.userName = userName;
}

const getUsers = (roomName) => {
    if (!sockets[roomName]) return [];
    return sockets[roomName].users.map(user => user.userName);
}


io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    const { roomName } = socket.handshake.query;
    socket.join(roomName);
    createRoom(roomName);
    joinRoom(roomName, socket);

    socket.on('join', (data) => {
        setUserName(data.roomName, socket, data.userName);
    })

    socket.on('get-users', (data) => {
        socket.emit('users', getUsers(data.roomName));
    })

    socket.on('new-message', (data) => {
        io.to(roomName).emit('new-message', data);
    });

    socket.on('disconnect', () => {
        let user = sockets[roomName].users.find(user => user.id === socket.id);
        if (user) sockets[roomName].users.splice(sockets[roomName].users.indexOf(user), 1);
    });

});

app.use(express.urlencoded({ extended: true }), cors(), express.json());

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

