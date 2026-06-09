import { conf } from './config.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import { Chat } from './classes.js';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } })

// App setup
app.set('view engine', 'ejs');
app.use(express.static('static'))

// Paths
app.get('/', (req, res) => {
    res.render('index');
});

// Server things
const port = 2025;
server.listen(port, () => {
    console.log('Server is running:');
    console.log(`http://localhost:${port}`);
});


// Global variables
let global_chats = [];
let users = {};

// Functions
const clear_chats = () => {
    if (global_chats.length > conf.max_chat_count) {
        global_chats = [];
        global_chats.push('Cleared the chat!');
    }
};
const generate_username = () => {
    const ran_index = Math.floor(Math.random() * (8 - 0 + 1));
    return conf.random_usernames[ran_index];
};


// Socket handle for each client
io.on('connection', (sock) => {
    clear_chats();
    users[sock.id] = generate_username();

    console.log(`New device: ${sock.id}`);

    let chat = new Chat(
        'server_67', 
        `New user has arrived '${users[sock.id]}'.`,
        `admin_mangos`
    );

    global_chats.push(chat);

    io.emit('message_update', global_chats);

    // Receive messages from clients
    sock.on('msg', (data) => {
        clear_chats();

        let p1 = data.trim();
        let chat = new Chat(
            users[sock.id], 
            data, 
            sock.id
        );

        if (p1 == "") return;

        global_chats.push(chat);
        io.emit('message_update', global_chats);
    });

    // Announce disconnected clients
    sock.on('disconnect', () => {
        clear_chats();
        let username = String(users[sock.id]);
        let chat = new Chat(
            'server_67',
            `${username} left, sadly :(`,
            'admin_mangos'
        );

        delete users[sock.id];
        global_chats.push(chat);

        io.emit('message_update', global_chats);
    });
});
