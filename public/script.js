/* eslint-disable no-undef */
let socket = io()
const videoGrid = document.getElementById('video-grid')

let peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    const myVideo = document.createElement('video')
    myVideo.muted = true
    myVideoStream = stream
    addVideoStream(myVideo, myVideoStream)
})

//Event Listeners
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id) 
}) //send generater id from peer as userid

socket.on('user-connected', (userId) => {
    connectToNewUser(userId)
}) //catch userId passed from backend socket

peer.on('call', call => {
    const video = document.createElement('video')
    call.answer(myVideoStream)
    call.on('stream', stream => {
        console.log('another stream')
        addVideoStream(video, stream)
    })
})

socket.on('create-message', message => {
    const li = document.createElement('li')
    li.classList.add('message')
    const b = document.createElement('b')
    const br = document.createElement('br')
    b.textContent = 'user'
    li.append(b)
    li.append(br)
    li.append(message)
    document.getElementById('messages').append(li)
})

const connectToNewUser = userId => {
    const call = peer.call(userId, myVideoStream)
    const video = document.createElement('video')
    call.on('stream', stream => {
        console.log('stream called')
        addVideoStream(video, stream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

document.getElementById('chat').addEventListener('submit', (e)=> {
    e.preventDefault()
    let inputValue = document.getElementById('chat-message')
    if (inputValue.value.length !== 0) {
        socket.emit('message', inputValue.value)
        inputValue.value = ''
        const chat = document.getElementsByClassName('main-chat-window')[0]
        chat.scrollTo(0, chat.scrollHeight)
    }
})

const handleButtonsEvent = (eventHandle, FAiconName, trueTextContent, falseTextContent, type) => {
    eventHandle.addEventListener('click', () => {
        const icon = eventHandle.firstElementChild
        const text = eventHandle.children[1]
        let condition
        let funct
        switch (type) 
        {
        case 'audio':
            condition = myVideoStream.getAudioTracks()[0].enabled
            funct = condition ? () => myVideoStream.getAudioTracks()[0].enabled = false : () => myVideoStream.getAudioTracks()[0].enabled = true
            break
        case 'video':
            condition = myVideoStream.getVideoTracks()[0].enabled
            funct = condition ? () => myVideoStream.getVideoTracks()[0].enabled = false : () => myVideoStream.getVideoTracks()[0].enabled = true
            break
        }
        if (condition) {
            icon.classList.remove(`fa-${FAiconName}`)
            icon.classList.add(`fa-${FAiconName}-slash`, 'red')
            text.textContent = trueTextContent
            text.classList.add('red')
            condition = false
        } else {
            condition = true
            icon.classList.remove(`fa-${FAiconName}-slash`, 'red')
            icon.classList.add(`fa-${FAiconName}`)
            text.textContent = falseTextContent
            text.classList.remove('red')
        }
        funct()
    })
}

handleButtonsEvent(document.querySelector('.mic'), 'microphone', 'UnMute', 'Mute', 'audio')
handleButtonsEvent(document.querySelector('.video'), 'video', 'Start Video', 'Stop Video', 'video')