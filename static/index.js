const socket = io("/");

const msgBox = document.getElementById("msgBox");
const sendBtn = document.getElementById("sendBtn");
let current_user_id = "";

// Send button functionality
sendBtn.addEventListener("click", () => {
    msgBox.value = msgBox.value.trim();
    if (msgBox.value != "") {
        // Send message to the server
        socket.emit("msg", msgBox.value);
        msgBox.value = "";
    }
});
// Enter functionality
msgBox.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
        event.preventDefault();

        msgBox.value = msgBox.value.trim();
        if (msgBox.value != "") {
            // Send message to the server
            socket.emit("msg", msgBox.value);
            msgBox.value = "";
        }
    }
});

// Render message
const msgContain = document.getElementById("msgContain");

const renderMessages = (list) => {
    msgContain.innerHTML = "";

    let past_chat_id = "";
    list.map((msg, i) => {
        const msg_contain = document.createElement("div");
        const name = document.createElement("p");
        const message = document.createElement("p");

        // Classes
        msg_contain.className = `message-contain ${msg.user_id}`;
        name.className = "name";
        message.className = "msg";

        name.textContent = msg.user_name;
        message.textContent = msg.message;

        msg_contain.appendChild(name);
        msg_contain.appendChild(message);
        msgContain.appendChild(msg_contain);

        if (i == list.length - 1) {
            document.getElementById("footer").scrollIntoView({
                behavior: "smooth",
            });

            if (msg.user_id == "you")
                msg_contain.style.animation = "slide-1 0.5s ease-in";
            else if (msg.user_id == "admin")
                msg_contain.style.animation = "top-slide 0.5s ease-in";
            else msg_contain.style.animation = "slide-2 0.5s ease-in";
        }

        if (msg.user_id == past_chat_id) {
            msg_contain.style.top = "0";
            msg_contain.style.marginTop = "-15px";
            name.remove();
        }

        past_chat_id = msg.user_id;
    });
};

// For debug purposes
console.log("-- For debugging purposes only (dont be sus) --");

// Establish connection
socket.on("init_connection", (data) => {
    current_user_id = data.id;
});

socket.on("message_update", (data) => {
    console.log(data);
    renderMessages(data);
});
