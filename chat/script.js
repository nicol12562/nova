// Chat functionality
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, true);
    userInput.value = '';

    // Simulate bot response
    setTimeout(() => {
        addMessage('Recibí tu mensaje: "' + text + '". ¿Hay algo más en lo que pueda ayudarte?', false);
    }, 800);
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});