document.addEventListener('DOMContentLoaded', () => {
    const sessionButton = document.getElementById('sessionButton');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    let sessionId = null;

    sessionButton.addEventListener('click', async () => {
        if (!sessionId) {
            const response = await fetch('/api/start-session');
            const data = await response.json();
            if (data.success) {
                sessionId = data.sessionId;
                sessionButton.textContent = 'End Chat';
                chatMessages.innerHTML = '<div class="message gpt-message">Chat session started</div>';
                chatInput.disabled = false;
                sendButton.disabled = false;
            } else {
                chatMessages.innerHTML = '<div class="message gpt-message">No available sessions</div>';
            }
        } else {
            await fetch('/api/end-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            sessionId = null;
            sessionButton.textContent = 'Start New Chat';
            chatMessages.innerHTML += '<div class="message gpt-message">Chat session ended</div>';
            chatInput.disabled = true;
            sendButton.disabled = true;
        }
    });

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !sessionId) return;

        chatMessages.innerHTML += `<div class="message user-message">${message}</div>`;
        chatInput.value = '';
        scrollToBottom();

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, message })
        });
        const data = await response.json();
        
        if (data.response) {
            chatMessages.innerHTML += `<div class="message gpt-message">${data.response}</div>`;
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatInput.disabled = true;
    sendButton.disabled = true;
});