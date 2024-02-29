import express from "express"
import path from "path"
import {Server } from "socket.io"
import { fileURLToPath } from "url"
// const server = require('http').createServer(app)
// const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

const expressServer = app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
})
// app.use(cors())

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, "WebRTC_Client")))

// const io = require('socket.io')(server, {
const io = new Server(expressServer, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) =>{
    res.send("Server is running")
})

io.on("connection", (socket) => {
    socket.emit("message", `Welcome to the chat ${socket.id}`);
    socket.on("disconnect", () => {

        socket.broadcast.emit("Call Ended")
    })

    socket.on("callUser", ({userToCall, signalData, from, name}) =>{
        io.to(userToCall).emit("callUser", {signal: signalData, from, name})
    })

    socket.on("answerCall", data => {
        io.to(data.to).emit("callAccepted", data.signal)
    })


})