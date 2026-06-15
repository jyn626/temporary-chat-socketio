export class Chat {
    /**
     * @param {string} username - Username of the user who sent the message.
     * @param {string} message - Chat text content.
     * @param {string} user_id - Chat identifier(unique).
     */
    constructor(username, message, user_id) {
        this.username = username;
        this.message = message;
        this.user_id = user_id;
    }

    announce_join() {
        return `New user joined '${this.username}'.`;
    }

    getInfo() {
        return {
            username: this.username,
            chat: this.message,
            id: this.user_id,
        };
    }
}
