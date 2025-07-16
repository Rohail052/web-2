// === DOM Elements ===
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
const AI21_API_KEY = '06ab84aa-a88e-4a8d-99c2-d4e6bfd8ca4d';

let awaitingAgentConfirmation = false;

// Predefined simple responses for buttons
const brain = {
  "i have a question": "Sure! What would you like to ask?",
  "help with login": "🔐 Login Help\n▶ Forgot your password? Click 'Forgot Password' and check your spam folder.\n▶ Account locked? Wait 10–15 minutes and try again.",
  "file issue": "📁 File Help\n▶ File not showing? Refresh the page.\n▶ Deleted something? Click the trash icon next to the file.",
  "talk to an agent": "⚠️ Before we connect you, please make sure your email is correct in the ticket form. You will get a reply by email.\n\nType 'yes' to continue or 'no' to go back."
};

// === Event Listeners ===
chatLauncher.addEventListener('click', () => {
  chatWidget.style.display = chatWidget.style.display === 'flex' ? 'none' : 'flex';
  chatWidget.style.flexDirection = 'column';
  resetChat();
});

closeChatBtn.addEventListener('click', () => {
  chatWidget.style.display = 'none';
  resetChat();
});

chatInput.addEventListener('keypress', handleKey);

// === Reset Chat State ===
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

// === Ask AI21 Labs API ===
async function askAI21(promptText) {
  const url = 'https://api.ai21.com/studio/v1/j2-jumbo/complete';

  const body = {
    prompt: promptText,
    maxTokens: 150,
    temperature: 0.7,
    topP: 1,
    stopSequences: ["\n"],
    countPenalties: {
      scale: 0.5,
      applyToNumbers: false,
      applyToPunctuations: false,
      applyToStopwords: false,
      applyToWhitespaces: false,
      applyToEmojis: false
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI21_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data?.completions?.[0]?.data?.text) {
      return data.completions[0].data.text.trim();
    } else if (data.error) {
      return `❌ AI21 Error: ${data.error.message}`;
    } else {
      return "⚠️ Unexpected response from AI21.";
    }
  } catch (error) {
    console.error("AI21 Fetch Error:", error);
    return "❌ Network error. Please try again.";
  }
}

// === Ask AI (main handler) ===
function askAI(input) {
  const key = input.toLowerCase().trim();

  if (key === "talk to an agent") {
    chatResponse.innerText = brain["talk to an agent"];
    awaitingAgentConfirmation = true;
    chatContent.style.display = 'none';
    chatInputArea.style.display = 'block';
    chatInput.placeholder = "Type 'yes' to continue...";
    chatInput.focus();
    return;
  }

  // Show "thinking" text while waiting for API
  chatResponse.innerText = "✍️ Thinking...";
  chatContent.style.display = 'none';
  chatInputArea.style.display = 'block';
  chatInput.placeholder = "Type your question...";
  chatInput.focus();

  askAI21(input).then((response) => {
    typeResponse(response);
  }).catch((err) => {
    chatResponse.innerText = "❌ Something went wrong. Please try again.";
    console.error("AI21 Error:", err);
  });
}

// === Typing Animation ===
function typeResponse(text) {
  chatResponse.innerText = '';
  let i = 0;
  const interval = setInterval(() => {
    chatResponse.innerText += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 20);
}

// === Handle Enter Key ===
function handleKey(e) {
  if (e.key === 'Enter') {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    if (awaitingAgentConfirmation) {
      if (userInput.toLowerCase() === 'yes') {
        openAgentChat();
      } else {
        chatResponse.innerText = "👍 Okay! Let us know if you need anything else.";
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

// === Open Live Agent Chat ===
function openAgentChat() {
  chatContent.style.display = 'none';
  chatInputArea.style.display = 'none';
  chatIframeContainer.style.display = 'block';
  chatResponse.innerText = "🔗 Connecting you to a live agent...";
  chatWidget.style.height = window.innerWidth <= 480 ? '100vh' : '700px';
  chatIframe.src = CHAT_AGENT_URL;
}
