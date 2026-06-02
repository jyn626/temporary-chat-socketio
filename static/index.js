const socket = io('/');

const msgBox = document.getElementById('msgBox');
const sendBtn = document.getElementById('sendBtn');

// Establish connection socket.on('connection');
sendBtn.addEventListener('click', () => {
    msgBox.value = msgBox.value.trim();
    if (msgBox.value != "") {
        // Send message to the server
        socket.emit('msg', msgBox.value);
        msgBox.value = "";
    }
});

// Render message
const msgContain = document.getElementById('msgContain');

const renderMessages = (list) => {
    msgContain.innerHTML = "";

    list.map((msg, i) => {
        const p = document.createElement('p');
        p.textContent = msg;
        msgContain.appendChild(p);
    });
};

socket.on('message_update', (data) => {
    renderMessages(data);
});