 document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotBox = document.getElementById('chatbot-box');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-text');
    const chatbotSend = document.getElementById('chatbot-send');

    chatbotToggle.addEventListener('click', () => {
      chatbotBox.classList.toggle('hidden');
    });

    chatbotClose.addEventListener('click', () => {
      chatbotBox.classList.add('hidden');
    });

    function sendMessage() {
      const message = chatbotInput.value.trim();
      if (message) {
        addMessage(message, 'user');
        chatbotInput.value = '';

        // Call Flask API
        fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ message: message })
        })
        .then(res => res.json())
        .then(data => {
          addMessage(data.response, 'bot');
        })
        .catch(err => {
          console.error(err);
          addMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
        });
      }
    }

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, sender) {
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('chatbot-message', `${sender}-message`);
      const messagePara = document.createElement('p');
      messagePara.textContent = text;
      messageDiv.appendChild(messagePara);
      chatbotMessages.appendChild(messageDiv);
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
  });