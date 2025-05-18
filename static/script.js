const kannadaInput = document.getElementById("kannadaInput");
const englishOutput = document.getElementById("englishOutput");
const outputDiv = document.getElementById("output");
const explanationBox = document.getElementById("explanation");
const keyboardDiv = document.getElementById("keyboard");

const kannadaKeys = [
  'ಅ','ಆ','ಇ','ಈ','ಉ','ಊ','ಎ','ಏ','ಐ','ಒ','ಓ',
  'ಕ','ಖ','ಗ','ಘ','ಙ','ಚ','ಛ','ಜ','ಝ','ಞ','ಟ',
  'ಠ','ಡ','ಢ','ಣ','ತ','ಥ','ದ','ಧ','ನ','ಪ','ಫ',
  'ಬ','ಭ','ಮ','ಯ','ರ','ಲ','ವ','ಶ','ಷ','ಸ','ಹ',
  'ಳ','ಕ್ಷ','ಜ್ಞ','ಾ','ಿ','ೀ','ು','ೂ','ೆ','ೇ','ೈ',
  'ೊ','ೋ','ೌ','್','ಂ','ಃ','೦','೧','೨','೩','೪',
  '೫','೬','೭','೮','೯'
];

// Build virtual keyboard
function buildKeyboard() {
  kannadaKeys.forEach(char => {
    const key = document.createElement("div");
    key.className = "key";
    key.textContent = char;
    key.onclick = () => kannadaInput.value += char;
    keyboardDiv.appendChild(key);
  });

  const spaceKey = document.createElement("div");
  spaceKey.className = "key wide";
  spaceKey.textContent = "Space";
  spaceKey.onclick = () => kannadaInput.value += " ";
  keyboardDiv.appendChild(spaceKey);

  const backspaceKey = document.createElement("div");
  backspaceKey.className = "key wide";
  backspaceKey.textContent = "Backspace";
  backspaceKey.onclick = () => {
    kannadaInput.value = kannadaInput.value.slice(0, -1);
  };
  keyboardDiv.appendChild(backspaceKey);
}

function toggleKeyboard() {
  keyboardDiv.classList.toggle("hidden");
}

buildKeyboard();

// Speech-to-text using browser
function startRecording() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'kn-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log("Speech recognition started...");
  };

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    kannadaInput.value += transcript + ' ';
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error", event);
    if (event.error === "aborted") {
      alert("Speech recognition aborted. Please allow mic access and try again.");
    } else {
      alert("Speech recognition error: " + event.error);
    }
  };

  recognition.onend = () => {
    console.log("Speech recognition ended.");
  };

  recognition.start();
}

// Translate Kannada → English
async function translateKannada() {
  const inputText = kannadaInput.value.trim();
  if (!inputText) return;
  englishOutput.value = "Translating...";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "Translate from Kannada to English. Only return the translated text without any extra explanation or quotes."
          },
          { role: "user", content: inputText }
        ],
        temperature: 0.3
      })
    });

    const json = await res.json();
    const fullText = json.choices[0].message.content.trim();
    const lines = fullText.split('\n').filter(line => line.trim() !== '');
    let translation = lines[lines.length - 1].trim();
    translation = translation.replace(/^"(.*)"$/, '$1');
    englishOutput.value = translation;
    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    englishOutput.value = "Error translating text. Please try again.";
    return null;
  }
}

// Generate Python code from English prompt
async function generateCode() {
  const prompt = englishOutput.value.trim();
  if (!prompt) {
    outputDiv.value = "Please enter translated text first.";
    return;
  }
  outputDiv.value = "Generating Python code...";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Convert the user's request into valid Python code. Only return code." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      })
    });

    const json = await res.json();
    const pythonCode = json.choices[0].message.content.trim();
    outputDiv.value = pythonCode;
    return pythonCode;
  } catch (error) {
    console.error("Code generation error:", error);
    outputDiv.value = "Error generating Python code. Please try again.";
    return null;
  }
}

// Explain Python code in English
async function explainCode() {
  const code = outputDiv.value.trim();
  if (!code) {
    explanationBox.value = "Please generate Python code first.";
    return;
  }
  explanationBox.value = "Generating explanation in English...";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Explain what the following Python code does in simple English." },
          { role: "user", content: code }
        ],
        temperature: 0.3
      })
    });

    const json = await res.json();
    const explanation = json.choices[0].message.content.trim();
    explanationBox.value = explanation;
    return explanation;
  } catch (error) {
    console.error("Explanation error:", error);
    explanationBox.value = "Error generating explanation. Please try again.";
    return null;
  }
}

// Explain Python code in Kannada
async function explainCodeKannada() {
  const code = outputDiv.value.trim();
  if (!code) {
    explanationBox.value = "Please generate Python code first.";
    return;
  }
  explanationBox.value = "ಕೋಡ್ ವಿವರಣೆ ತಯಾರಿಸಲಾಗುತ್ತಿದೆ...";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Explain what the following Python code does in Kannada language." },
          { role: "user", content: code }
        ],
        temperature: 0.3
      })
    });

    const json = await res.json();
    const explanation = json.choices[0].message.content.trim();
    explanationBox.value = explanation;
    return explanation;
  } catch (error) {
    console.error("Kannada explanation error:", error);
    explanationBox.value = "ವಿವರಣೆ ತಯಾರಿಸುವಲ್ಲಿ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
    return null;
  }
}

// Full pipeline: Translate → Generate Code → Explain
async function processKannadaToCode(explainLanguage = 'english') {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true);

  try {
    const translation = await translateKannada();
    if (!translation) return;

    const pythonCode = await generateCode();
    if (!pythonCode) return;

    if (explainLanguage === 'english') {
      await explainCode();
    } else {
      await explainCodeKannada();
    }
  } catch (error) {
    console.error("Processing error:", error);
    alert("An error occurred during processing. Please try again.");
  } finally {
    buttons.forEach(button => button.disabled = false);
  }
}

// Enter key triggers full processing
kannadaInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    processKannadaToCode();
  }
});
