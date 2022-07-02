const socket = require("socket.io")

let io;

const setIO = (server) => {
    io = socket(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    })
    return io
}

const getIO = () => {
    return io
}

module.exports = {
    getIO,
    setIO
}