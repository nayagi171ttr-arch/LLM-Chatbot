const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-btn");
const messagesArea = document.querySelector(".messages-area");
const newChatButton = document.querySelector(".new-chat-btn");


async function sendMessage() {

    const message = messageInput.value.trim();

    if (!message) {
        return;
    }

    // Remove welcome screen
    const welcomeMessage = document.querySelector(".welcome-message");

    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Show user message
    const userMessage = document.createElement("div");

    userMessage.className = "message user-message";

    userMessage.innerHTML = `
        <div class="message-avatar">You</div>

        <div class="message-content">
            ${message}
        </div>
    `;

    messagesArea.appendChild(userMessage);

    // Clear input
    messageInput.value = "";

    // Show thinking message
    const thinkingMessage = document.createElement("div");

    thinkingMessage.className = "message bot-message";

    thinkingMessage.innerHTML = `
        <div class="message-avatar">✦</div>

        <div class="message-content">
            Thinking...
        </div>
    `;

    messagesArea.appendChild(thinkingMessage);

    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Disable button while waiting
    sendButton.disabled = true;

    try {

        const formData = new FormData();

        formData.append("message", message);

        const response = await fetch("/send-message/", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // Remove Thinking...
        thinkingMessage.remove();

        if (data.error) {
            showBotMessage("Sorry, something went wrong: " + data.error);
        } else {
            showBotMessage(data.response);
        }

    } catch (error) {

        thinkingMessage.remove();

        showBotMessage(
            "Sorry, I couldn't connect to the AI model."
        );

        console.error(error);

    } finally {

        sendButton.disabled = false;

        messageInput.focus();
    }

    messagesArea.scrollTop = messagesArea.scrollHeight;
}


function showBotMessage(message) {

    const botMessage = document.createElement("div");

    botMessage.className = "message bot-message";

    const content = document.createElement("div");

    content.className = "message-content";

    let formattedMessage = message;

    // Escape HTML
    formattedMessage = formattedMessage
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code blocks
    formattedMessage = formattedMessage.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
    );

    // Headings
    formattedMessage = formattedMessage.replace(
        /^###\s+(.*)$/gm,
        "<h3>$1</h3>"
    );

    formattedMessage = formattedMessage.replace(
        /^##\s+(.*)$/gm,
        "<h2>$1</h2>"
    );

    formattedMessage = formattedMessage.replace(
        /^#\s+(.*)$/gm,
        "<h1>$1</h1>"
    );

    // Bold
    formattedMessage = formattedMessage.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    // Italic
    formattedMessage = formattedMessage.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );

    // Horizontal line
    formattedMessage = formattedMessage.replace(
        /^\s*([-*_])\s*\1\s*\1+\s*$/gm,
        "<hr>"
    );

    // Numbered lists
    formattedMessage = formattedMessage.replace(
        /^\s*\d+\.\s+(.*)$/gm,
        "<li>$1</li>"
    );

    // Bullet lists
    formattedMessage = formattedMessage.replace(
        /^\s*[-*]\s+(.*)$/gm,
        "<li>$1</li>"
    );

    // Wrap consecutive list items
    formattedMessage = formattedMessage.replace(
        /(?:<li>.*?<\/li>\s*)+/gs,
        function(list) {
            return "<ul>" + list + "</ul>";
        }
    );

    // Convert remaining line breaks
    formattedMessage = formattedMessage.replace(
        /\n/g,
        "<br>"
    );

    content.innerHTML = formattedMessage;

    botMessage.innerHTML = `
        <div class="message-avatar">✦</div>
    `;

    botMessage.appendChild(content);

    messagesArea.appendChild(botMessage);

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Send button
sendButton.addEventListener("click", sendMessage);


// Enter key
messageInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();

        sendMessage();
    }

});



async function loadChats() {

    try {

        const response = await fetch("/chats/");
        const data = await response.json();

        const chatHistory = document.querySelector(".chat-history");

        chatHistory.innerHTML = `
            <div class="history-title">Recent chats</div>
        `;

            data.chats.forEach(function(chat) {

            const chatItem = document.createElement("div");

            chatItem.className = "history-item";
            chatItem.innerHTML = `
                <div class="history-chat-title">
                    <span>💬</span>
                    <span class="chat-title-text">${chat.title}</span>
                </div>

                <div class="chat-menu-wrapper">

                    <button
                        class="chat-more-btn"
                        title="Chat options"
                    >
                        ⋯
                    </button>

                    <div class="chat-options-menu">

                        <button class="chat-option edit-chat-btn">
                            <span>✏️</span>
                            Rename
                        </button>

                        <button class="chat-option delete-chat-btn">
                            <span>🗑️</span>
                            Delete
                        </button>

                    </div>

                </div>
            `;

                    // Open chat
            chatItem.querySelector(".history-chat-title").addEventListener("click", function() {
                loadChat(chat.id);
            });


            // Three-dot menu
            chatItem.querySelector(".chat-more-btn").addEventListener("click", function(event) {

                event.stopPropagation();

                // Close other open menus
                document.querySelectorAll(".chat-options-menu.show").forEach(function(menu) {
                    menu.classList.remove("show");
                });

                const menu = chatItem.querySelector(".chat-options-menu");

                menu.classList.toggle("show");

            });


            // Rename
            chatItem.querySelector(".edit-chat-btn").addEventListener("click", function(event) {

                event.stopPropagation();

                chatItem.querySelector(".chat-options-menu").classList.remove("show");

                renameChat(chat.id, chat.title, chatItem);

            });


            // Delete
            chatItem.querySelector(".delete-chat-btn").addEventListener("click", function(event) {

                event.stopPropagation();

                chatItem.querySelector(".chat-options-menu").classList.remove("show");

                confirmDeleteChat(chat.id);

            });

            chatHistory.appendChild(chatItem);

        });



    } catch (error) {

        console.error("Could not load chats:", error);

    }
}


loadChats();



newChatButton.addEventListener("click", async function () {

    try {

        const response = await fetch("/new-chat/", {
            method: "POST"
        });

        const data = await response.json();

        if (!data.success) {
            console.error("Could not create new chat.");
            return;
        }

        // Clear the current messages from the screen
        messagesArea.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">✦</div>
                <h1>How can I help you?</h1>
                <p>Ask me anything and I'll do my best to help.</p>
            </div>
        `;

        // Clear input
        messageInput.value = "";

        // Reload sidebar chats
        loadChats();

        // Focus input
        messageInput.focus();

    } catch (error) {

        console.error("Could not create new chat:", error);

    }

});



async function loadChat(chatId) {

    try {

        const response = await fetch(`/chats/${chatId}/`);
        const data = await response.json();

        if (!data.success) {
            console.error("Could not load chat.");
            return;
        }

        // Clear current messages
        messagesArea.innerHTML = "";

        // Display saved messages
        data.chat.messages.forEach(function(message) {

            if (message.role === "system") {
                return;
            }

            if (message.role === "user") {

                const userMessage = document.createElement("div");

                userMessage.className = "message user-message";

                userMessage.innerHTML = `
                    <div class="message-avatar">You</div>
                    <div class="message-content">
                        ${message.content}
                    </div>
                `;

                messagesArea.appendChild(userMessage);

            }

          if (message.role === "assistant") {

            showBotMessage(message.content);

        }

        });

        // Scroll to the latest message
        messagesArea.scrollTop = messagesArea.scrollHeight;

        // Focus input
        messageInput.focus();

    } catch (error) {

        console.error("Could not load chat:", error);

    }
}




async function renameChat(chatId, currentTitle, chatItem) {

    const titleContainer = chatItem.querySelector(".history-chat-title");

    titleContainer.innerHTML = `
        <span>💬</span>

        <input
            type="text"
            class="chat-title-input"
            value="${currentTitle.replace(/"/g, "&quot;")}"
        >
    `;

    const actions = chatItem.querySelector(".chat-actions");

    actions.innerHTML = `
        <button class="save-chat-btn" title="Save">✓</button>
        <button class="cancel-chat-btn" title="Cancel">✕</button>
    `;

    const input = titleContainer.querySelector(".chat-title-input");

    input.focus();
    input.select();

    // Save
    actions.querySelector(".save-chat-btn").addEventListener("click", function(event) {

        event.stopPropagation();

        saveChatRename(chatId, input.value, chatItem);

    });

    // Cancel
    actions.querySelector(".cancel-chat-btn").addEventListener("click", function(event) {

        event.stopPropagation();

        loadChats();

    });

    // Press Enter to save
    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            saveChatRename(chatId, input.value, chatItem);
        }

        if (event.key === "Escape") {

            event.preventDefault();

            loadChats();
        }

    });
}




async function saveChatRename(chatId, newTitle, chatItem) {

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
        return;
    }

    try {

        const formData = new FormData();

        formData.append("title", trimmedTitle);

        const response = await fetch(
            `/chats/${chatId}/rename/`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!data.success) {

            console.error(data.error || "Could not rename chat.");

            return;
        }

        // Reload sidebar with updated name
        loadChats();

    } catch (error) {

        console.error("Could not rename chat:", error);

    }
}



function confirmDeleteChat(chatId) {

    const modal = document.getElementById("delete-chat-modal");

    modal.classList.add("show");

    // Store the chat ID on the modal
    modal.dataset.chatId = chatId;
}



async function deleteChat(chatId) {

    try {

        const response = await fetch(
            `/chats/${chatId}/delete/`,
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!data.success) {

            console.error(data.error || "Could not delete chat.");

            return;
        }

        // Close modal
        const modal = document.getElementById("delete-chat-modal");

        modal.classList.remove("show");

        // Reload sidebar
        loadChats();

        // Show blank conversation area
        messagesArea.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">✦</div>
                <h1>How can I help you?</h1>
                <p>Ask me anything and I'll do my best to help.</p>
            </div>
        `;

        messageInput.value = "";

        messageInput.focus();

    } catch (error) {

        console.error("Could not delete chat:", error);

    }
}



const deleteChatModal = document.getElementById("delete-chat-modal");

const cancelDeleteModalButton = document.getElementById(
    "cancel-delete-modal"
);

const confirmDeleteModalButton = document.getElementById(
    "confirm-delete-modal"
);


// Cancel deletion
cancelDeleteModalButton.addEventListener("click", function() {

    deleteChatModal.classList.remove("show");

});


// Confirm deletion
confirmDeleteModalButton.addEventListener("click", function() {

    const chatId = deleteChatModal.dataset.chatId;

    if (!chatId) {
        return;
    }

    deleteChat(chatId);

});



document.addEventListener("click", function() {

    document.querySelectorAll(".chat-options-menu.show").forEach(function(menu) {
        menu.classList.remove("show");
    });

});


const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", function() {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {

        themeToggle.innerHTML = `
            ☀️
            <span>Light mode</span>
        `;

        localStorage.setItem("theme", "dark");

    } else {

        themeToggle.innerHTML = `
            🌙
            <span>Dark mode</span>
        `;

        localStorage.setItem("theme", "light");
    }

});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark-mode");

    themeToggle.innerHTML = `
        ☀️
        <span>Light mode</span>
    `;

}