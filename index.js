import { conf } from "./config.js";
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { Chat } from "./models/chat.model.js";
import { chatService } from "./services/chat.service.js";
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// App setup
app.set("view engine", "ejs");
app.use(express.static("static"));

// Paths
app.get("/", (req, res) => {
    res.render("index");
});

// Server things
const port = 2025;
server.listen(port, () => {
    console.log("Server is running:");
    console.log(`http://localhost:${port}`);
});

const generate_username = () => {
    const ran_index = Math.floor(Math.random() * (8 - 0 + 1));
    return conf.random_usernames[ran_index];
};

/** @type {Chat[]} global_chats */
// Socket handle for each client
io.on("connection", (sock) => {
    chatService.clear_chats();

    // if a client joined then add them to our users array
    chatService._users[sock.id] = generate_username();

    console.log(`New device: ${sock.id}`);

    chatService.addUserIdToAllUsersIdMap(sock.id);
    chatService.global_announce(
        io,
        `New user has arrived '${chatService._users[sock.id]}'.`,
    );

    sock.emit("init_connection", { id: sock.id });

    // Receive messages from clients
    sock.on("msg", (data) => {
        chatService.clear_chats();

        // Rules
        if ([...data].length >= 500) {
            chatService.global_announce(
                io,
                `${chatService._users[sock.id]} too long of a message man...`,
            );
            return;
        }
        let p1 = data.trim();
        if (p1 == "") return;

        let chat = new Chat(chatService._users[sock.id], data, sock.id);

        chatService._global_chats.push(chat);
        console.log("global chat", chatService._global_chats);
        chatService._all_users_id.map((id) => {
            io.to(id).emit("message_update", chatService.get_chats(id));
        });
    });

    // Announce disconnected clients
    sock.on("disconnect", () => {
        chatService.clear_chats();

        let username = String(chatService._users[sock.id]);
        chatService.global_announce(io, `${username} left, sadly :(`);
        delete chatService._users[sock.id];
    });
});
