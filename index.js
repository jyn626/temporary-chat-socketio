import { conf } from "./config.js";
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { Chat } from "./models/chat.model.js";
import { ChatService } from "./services/chat.service.js";
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

//Testing chatservice
//const chatService = new ChatService(io);
let lobbies = [ 
    new ChatService(io), 
    new ChatService(io),
    new ChatService(io) 
];

// App setup 
app.set("view engine", "ejs");
app.use(express.static("static"));

// Paths
app.get("/", (req, res) => {
    res.send("Home thing.");
});
app.get("/chats", (req, res) => {
    res.render("index");
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
    const query_lobby = sock.handshake.query.lobby;
    let lobby_index = 0;

    if (query_lobby != 'null')
        lobby_index = parseInt(query_lobby, 10);

    console.log(query_lobby);
    const chatService = lobbies[lobby_index];

    chatService.clear_chats();
    const query_username = sock.handshake.query.username;
    let getUsername;

    if (query_username != 'null') 
        getUsername = query_username;
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
        chatService._all_users_id.map((id) => {
            io.to(id).emit("message_update", chatService.get_chats(id));
        });
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clear_chats();
        chatService.disconnect(sock.id);
    });
});
