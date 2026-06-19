import { conf } from "./config.js";
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { Chat } from "./models/chat.model.js";
import { ChatService } from "./services/chat.service.js";
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Routes and Lobbies
const mainChat = io.of('/chats');
const tempChat = io.of('/temp_chats');

/**
 * @typedef {Object} LobbyMap
 * @property {ChatService} global
 * @property {ChatService} [chat_1] // Optional property
 * @property {ChatService} [chat_2]
 */

/** @type {LobbyMap} */
const permanentLobbies = { 
    global: new ChatService(mainChat, "Global center"), 
    chat_1: new ChatService(mainChat, "Joe's nutsack"),
    chat_2: new ChatService(mainChat, "Joe's floorboards") 
};

/** @type {LobbyMap} */
let temporaryLobbies = {};

// App setup 
app.set("view engine", "ejs");
app.use(express.static("static"));

// Paths
app.get("/", (req, res) => {
    res.send("Home thing.");
});

app.get("/new/:id", (req, res) => {
    const lobby_id = req.params.id;

    if (lobby_id && lobby_id.trim()) {
        temporaryLobbies[lobby_id] = new ChatService(tempChat, lobby_id);
        res.status(200).json({ message: `Lobby has been created: ${req.params.id}` });
    } else {
        res.status(500).json({ message: "Cannot create  lobby." });
    }
});

app.get("/chats", (req, res) => {
    res.render("main_chats");
});
app.get("/temp_chats", (req, res) => {
    res.render("temp_chats");
});

// Server things
const port = 2025;
server.listen(port, () => {
    console.log("Server is running:");
    console.log(`http://localhost:${port}`);
});

const generate_username = () => {
    const min = 0, max = conf.random_usernames.length-1;
    const ran_index = Math.floor(Math.random() * (max - min + 1));
    return conf.random_usernames[ran_index];
};

// Socket handle for each client
io.on("connection", (sock) => {
    console.log("what");
});

// The permanent chato lobbies.
mainChat.on("connection", (sock) => {
    const query = sock.handshake.query;
    let lobby_index = 'global';

    if (query.lobby != 'null' && permanentLobbies[query.lobby])
        lobby_index = query.lobby;

    // Filter each socket request to specific lobbies.
    /** @type {ChatService} */
    const chatService = permanentLobbies[lobby_index];
    chatService.clear_chats();
    let getUsername;

    if (query.username != 'null') 
        getUsername = query.username;
    else 
        getUsername = generate_username(); // if a client joined, then 

    chatService.add_user(sock.id, getUsername);
    chatService.lobby_announce(
        `New user has arrived '${chatService._users[sock.id]}'.`,
    );

    sock.emit("init_connection", { id: sock.id });

    // Receive messages from clients
    sock.on("msg", (data) => {
        chatService.clear_chats();

        // Rules
        if ([...data].length >= 500) {
            chatService.lobby_announce(
                `${chatService._users[sock.id]} too long of a message man...`,
            );
            return;
        }
        let p1 = data.trim();
        if (p1 == "") return;

        let chat = new Chat(chatService._users[sock.id], data, sock.id);

        chatService._global_chats.push(chat);
        chatService.update_messages();
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clear_chats();
        chatService.disconnect(sock.id);
    });
});

tempChat.on("connection", (sock) => {
    const query = sock.handshake.query;
    let lobby_index;
    console.log(query.lobby);

    if (query.lobby != 'null' && temporaryLobbies[query.lobby]) {
        lobby_index = query.lobby;
    } else {
        let chat = new Chat(
            "server_67", 
            "This lobby doesn't seem to exist", 
            "admin"
        );

        sock.emit("message_update", [chat]);
        return;
    }

    // Filter each socket request to specific lobbies.
    /** @type {ChatService} */
    const chatService = temporaryLobbies[lobby_index];
    chatService.clear_chats();
    let getUsername;

    if (query.username != 'null') 
        getUsername = query.username;
    else 
        getUsername = generate_username(); // if a client joined, then 

    chatService.add_user(sock.id, getUsername);
    chatService.lobby_announce(
        `New user has arrived '${chatService._users[sock.id]}'.`,
    );

    sock.emit("init_connection", { id: sock.id });

    // Receive messages from clients
    sock.on("msg", (data) => {
        chatService.clear_chats();

        // Rules
        if ([...data].length >= 500) {
            chatService.lobby_announce(
                `${chatService._users[sock.id]} too long of a message man...`,
            );
            return;
        }
        let p1 = data.trim();
        if (p1 == "") return;

        let chat = new Chat(chatService._users[sock.id], data, sock.id);

        chatService._global_chats.push(chat);
        chatService.update_messages();
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clear_chats();
        chatService.disconnect(sock.id);
    });
});

