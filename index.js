const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io') (server, { cors: { origin: "*" } })

app.set('view engine', 'ejs');
app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index');
});

// Server things
const port = 2025;
server.listen(port, () => {
    console.log('Server is running:');
    console.log(`http://localhost:${port}`);
});

// Chats variable
const max_chat_count = 11;

// Main chats list
const random_usernames = [
    'Alonzo', 'My_nutsack', 'Craacky', 'Joe_bart',
    'Fen', 'Jezreel', 'Mel', 'Adik', 'Rug_puller'
];
let global_chats = [];
let users = {};

const clear_chats = () => {
    if (global_chats.length > max_chat_count) {
        global_chats = [];
        global_chats.push('Cleared the chat!');
    }
};
const generate_username = () => {
    const ran_index = Math.floor(Math.random() * (8 - 0 + 1));
    return random_usernames[ran_index];
};

// Socket handle for each client
io.on('connection', (sock) => {
    clear_chats();
    users[sock.id] = generate_username();
    console.log(`New device: ${sock.id}`);
    global_chats.push(`New user joined ${sock.id} nicknamed ${users[sock.id]}.`);
    io.emit('message_update', global_chats);

    // Receive messages from clients
    sock.on('msg', (data) => {
        clear_chats();
        let p1 = data.trim();
        if (p1 == "") return;

        global_chats.push(`[${users[sock.id]}]:  ${data}`);
        io.emit('message_update', global_chats);
    });

    // Announce disconnected clients
    sock.on('disconnect', () => {
        clear_chats();
        delete users[sock.id];
        global_chats.push(`User '${sock.id}' disconnected.`);
        io.emit('message_update', global_chats);
    });
});