const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(http, {
    debug: true
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())

app.use('/peerjs', peerServer)

app.get('/', (req, res) => {
    // res.send({ message: 'ok' })
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId) //join same socket session(ie. room)
        socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.on('message', message => {
            io.to(roomId).emit('create-message', message)
        })
    })
})





http.listen(process.env.PORT || 443, () => {
    console.log('Listening on port 443')
})
