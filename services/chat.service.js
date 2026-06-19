import { Chat } from "../models/chat.model.js";
import { conf } from "../config.js";
import { paramRequired } from "../utils/helpers.js";
import { Server } from "socket.io";

export class ChatService {
    /**
     * @param {Server} io 
     * @param {String} lobby_name  
     */
    constructor(io = paramRequired(), lobby_name) {
        /**
         * this variables are private,
         * only modify them inside this class
         */
        this.server = io;
        this._global_chats = [];
        this._all_users_id = []; // TODO: this as a Map class instead of an array
        this._users = {};

        this.lobby_announce(`Welcome to '${lobby_name}'.`);
    }

    /**
     * @desc Registers a new socket connection ID and
     * generate a random username associated with their socket id.
     *
     * @param {string} sock_id - The unique socket or connection identifier for the user.
     * @param {string} username - Username display for the specified identifier.
     */
    add_user (sock_id, username) {
        this._users[sock_id] = username;
        this._all_users_id.push(sock_id);
        console.log(`New device: ${sock_id}`);
    }

    /**
     * @desc processes every chats in _global_chats and pushes a formatted version into a new array.
     * @param {number} user_id - the socket id linked to the current user.
     * @returns {Chat[]} returns a new Chat array containing the formatted versions of each chatl..
     */
    get_chats(user_id) {
        let formattedChats = [];

        this._global_chats.map((chat) => {
            let new_chat;

            if (chat.user_id == user_id)
                new_chat = new Chat(chat.username, chat.message, "you");
            else if (chat.user_id == "admin_mangos")
                new_chat = new Chat(chat.username, chat.message, "admin");
            else new_chat = new Chat(chat.username, chat.message, "other");

            formattedChats.push(new_chat);
        });

        return formattedChats;
    }

    /**
     * @desc Update the messages for all clients.
     * @returns {null}
     */
    update_messages() {
        this._all_users_id.map((id) => {
            this.server.to(id).emit(
                "message_update", 
                this.get_chats(id)
            );
        });
    }

    /**
     * @desc Broadcasts a system-wide announcement message from the admin account,
     * saves it to the global chat history, and emits the updated chat logs to all connected clients.
     * * @param {Server} io - The Socket.IO server instance used to broadcast the update.
     * @param {string} announce_msg - The text content of the announcement to be sent.
     * @returns {null}
     */
    lobby_announce(announce_msg) {
        let chat = new Chat("server_67", announce_msg, `admin_mangos`);

        this._global_chats.push(chat);
        //this.server.emit("message_update", this.get_chats());

        this.update_messages();
        //console.log(this._all_users_id);
        //console.log(this._users);
    }

    /**
     * @desc Checks if the global chat history exceeds the maximum allowed limit.
     * If it does, wipes the entire chat log and inserts a system message
     * notifying users that the chat has been cleared.
     * @returns {null}
     */
    clear_chats() {
        if (this._global_chats.length > conf.max_chat_count) {
            this._global_chats = [];

            let chat = new Chat(
                "server_67",
                `Cleared the messages.`,
                `admin_mangos`,
            );

            this._global_chats.push(chat);
        }
    }

    /**
     * @desc Method to handle socket disconnects with provided socket id.
     * @param {string} user_id 
     */
    disconnect(user_id) {
        let username = String(this._users[user_id]);
        let filtered_id = this._all_users_id.filter(id => (id != user_id));

        this.lobby_announce(`${username} left, sadly :(`);
        this._all_users_id = filtered_id;
        delete this._users[user_id];
    }
}
