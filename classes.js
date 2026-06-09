
export class Chat {
	/**
	 * @param {string} user_name - Chat username. 
	 * @param {string} user_chat - Chat text content. 
	 * @param {string} user_id - Chat identifier(unique). 
	 */
	constructor (user_name, user_chat, id) {
		this.user_name = user_name;
		this.user_chat = user_chat;
		this.user_id = id;
	}

	announce () {
		return `New user joined '${this.user_name}'.`;
	}
	
	getInfo () {
		return { 
			username: this.user_chat, 
			chat: this.user_chat, 
			id: this.user_id 
		}
	}
}
