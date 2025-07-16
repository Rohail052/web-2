const chatWidget = document.getElementById('chat-widget');
const chatLauncher = document.getElementById('chat-launcher');
const closeChatBtn = document.getElementById('close-chat');
const chatContent = document.getElementById('chat-content');
const chatResponse = document.getElementById('chat-response');
const chatInputArea = document.getElementById('chat-input-area');
const chatInput = document.getElementById('chat-input');
const chatIframeContainer = document.getElementById('chat-iframe-container');
const chatIframe = document.getElementById('chat-iframe');

const CHAT_AGENT_URL = 'https://tawk.to/chat/6872fa1c7f202b19181e9c17/1j00i206i';
const GEMINI_API_KEY = 'AIzaSyBoKSRmvIK878YI56TFdDJJrQo3NtuGVcc'; // Replace this with your actual Gemini API Key
let awaitingAgentConfirmation = false;

chatLauncher.addEventListener('click', () => {
  chatWidget.style.display = chatWidget.style.display === 'flex' ? 'none' : 'flex';
  chatWidget.style.flexDirection = 'column';
  resetChat();
});

closeChatBtn.addEventListener('click', () => {
  chatWidget.style.display = 'none';
  resetChat();
});

function resetChat() {
  chatResponse.innerText = "💡 I'm ready to assist you!";
  chatContent.style.display = 'block';
  chatInputArea.style.display = 'none';
  chatInput.value = '';
  chatIframeContainer.style.display = 'none';
  chatIframe.src = '';
  awaitingAgentConfirmation = false;
  chatWidget.style.height = window.innerWidth <= 480 ? '100vh' : 'auto';
}

function askAI(input) {
  const key = input.toLowerCase().trim();

  if (key === "talk to an agent") {
    chatResponse.innerText =
      "⚠️ Before we connect you, please make sure your email is correct in the ticket form. You will get a reply by email.\n\nType 'yes' to continue or 'no' to go back.";
    awaitingAgentConfirmation = true;
    chatContent.style.display = 'none';
    chatInputArea.style.display = 'block';
    chatInput.placeholder = "Type 'yes' to continue...";
    chatInput.focus();
    return;
  }

  chatResponse.innerText = "✍️ Thinking...";
  chatContent.style.display = 'none';
  chatInputArea.style.display = 'block';
  chatInput.placeholder = "Type your question...";
  chatInput.focus();

  fetchGeminiResponse(input).then((response) => {
    typeResponse(response);
  }).catch((err) => {
    chatResponse.innerText = "❌ Something went wrong. Please try again.";
    console.error("Gemini error:", err);
  });
}

async function fetchGeminiResponse(promptText) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }]
      }
    ]
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 I couldn't generate a reply.";
}

function typeResponse(text) {
  chatResponse.innerText = '';
  let i = 0;
  const interval = setInterval(() => {
    chatResponse.innerText += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 20);
}

function handleKey(e) {
  if (e.key === 'Enter') {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    if (awaitingAgentConfirmation) {
      if (userInput.toLowerCase() === 'yes') {
        openAgentChat();
      } else {
        chatResponse.innerText = "Okay! Let us know if you need anything else.";
        chatInputArea.style.display = 'none';
        chatContent.style.display = 'block';
        awaitingAgentConfirmation = false;
      }
      chatInput.value = '';
      return;
    }

    askAI(userInput);
    chatInput.value = '';
  }
}

function openAgentChat() {
  chatContent.style.display = 'none';
  chatInputArea.style.display = 'none';
  chatIframeContainer.style.display = 'block';
  chatResponse.innerText = "🔗 Connecting you to a live agent...";
  chatWidget.style.height = window.innerWidth <= 480 ? '100vh' : '700px';
  chatIframe.src = CHAT_AGENT_URL;
}
