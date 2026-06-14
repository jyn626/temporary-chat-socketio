import { Chat } from "../models/chat.model.js";
import { conf } from "../config.js";

class ChatService {
    constructor() {
        /**
         * this variables are private,
         * only modify them inside this class
         */
        this._global_chats = [];
        this._all_users_id = []; // TODO: this as a Map class instead of an array
        this._users = {};
    }

    /**
     * @desc for each users that joined, we'll them each socket IDs to this._all_users_id
     */
    addUserIdToAllUsersIdMap(sock_id) {
        this._all_users_id.push(sock_id);
    }

    addUser() {}

    get_chats(user_id) {
        let filtered_chats = [];

        this._global_chats.map((chat) => {
            let new_chat;

            if (chat.user_id == user_id)
                new_chat = new Chat(chat.username, chat.message, "you");
            else if (chat.user_id == "admin_mangos")
                new_chat = new Chat(chat.username, chat.message, "admin");
            else new_chat = new Chat(chat.username, chat.message, "other");

            filtered_chats.push(new_chat);
        });

        return filtered_chats;
    }

    global_announce(io, announce_msg) {
        let chat = new Chat("server_67", announce_msg, `admin_mangos`);

        this._global_chats.push(chat);
        io.emit("message_update", this.get_chats());
    }

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
}

export const chatService = new ChatService();

/** @type {ServerAnnounce} */
export const serverAnnounce = (announce_msg) => {
    let chat = new Chat("server_67", announce_msg, `admin_mangos`);

    global_chats.push(chat);
    io.emit("message_update", get_chats());
};

/**
 * @returns {string} generate_username
 *
 * @callback GetChats
 * @param {string} user_id
 * @returns {Chat[]}
 *
 * @callback ServerAnnounce
 * @param {string} announce_msg
 * @returns {null}
 * */

// Functions
// export const clear_chats = () => {
//     if (global_chats.length > conf.max_chat_count) {
//         global_chats = [];

//         let chat = new Chat(
//             "server_67",
//             `Cleared the messages.`,
//             `admin_mangos`,
//         );

//         global_chats.push(chat);
//     }
// };

/** @type {GetChats} */
export const get_chats = (user_id = "") => {
    let filtered_chats = [];

    global_chats.map((chat) => {
        let new_chat;

        if (chat.user_id == user_id)
            new_chat = new Chat(chat.username, chat.message, "you");
        else if (chat.user_id == "admin_mangos")
            new_chat = new Chat(chat.username, chat.message, "admin");
        else new_chat = new Chat(chat.username, chat.message, "other");

        filtered_chats.push(new_chat);
    });

    return filtered_chats;
};
