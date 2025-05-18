import os
import re
import random
import requests
from flask import Flask, render_template, request, jsonify
from google.cloud import speech

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# === API KEYS ===
GROQ_TRANSLATE_KEY = "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"  # Kannada translation
GROQ_ANALYZE_KEY = "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"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama3-70b-8192"

# === GOOGLE CLOUD CREDENTIALS ===
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\prath\OneDrive\Desktop\central2025 std\central\key-rider-460020-q6-88f7c5c8e10d.json"

# === ROUTES ===

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/translate')
def translate_page():
    return render_template('translate.html')

@app.route('/analyzer')
def analyzer_page():
    return render_template('analyzer.html')

@app.route('/quiz-lang-select')
def quiz_page():
    return render_template('quiz.html')


# === AUDIO TRANSCRIPTION (Kannada Speech to Text) ===

@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    audio_path = os.path.join(UPLOAD_FOLDER, "recorded.webm")
    audio_file.save(audio_path)

    try:
        transcript = transcribe_kannada(audio_path)
        return jsonify({"transcription": transcript})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def transcribe_kannada(audio_path):
    client = speech.SpeechClient()
    with open(audio_path, "rb") as f:
        content = f.read()

    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz=48000,
        language_code="kn-IN"
    )

    response = client.recognize(config=config, audio=audio)
    return " ".join([result.alternatives[0].transcript for result in response.results]).strip()


# === TIME COMPLEXITY ANALYSIS ===

@app.route('/analyze', methods=['POST'])
def analyze():
    code = request.json.get("code")
    prompt = f"Analyze the time complexity of the following code and explain your reasoning:\n\n{code}"

    headers = {
        "Authorization": f"Bearer {GROQ_ANALYZE_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert in analyzing code."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    response = requests.post(GROQ_URL, headers=headers, json=payload)
    result = response.json()
    message = result['choices'][0]['message']['content']

    match = re.search(r"O\([^)]+\)", message)
    complexity = match.group(0) if match else "Unknown"
    confidence = round(random.uniform(0.75, 0.95), 2) if complexity != "Unknown" else 0.5

    return jsonify({
        "explanation": message,
        "complexity": complexity,
        "confidence": confidence
    })


# === TRANSLATE EXPLANATION TO KANNADA ===

@app.route('/translate-explanation', methods=['POST'])
def translate_explanation():
    text = request.json.get("text")
    prompt = f"Translate the following explanation to Kannada:\n\n{text}"

    headers = {
        "Authorization": f"Bearer {GROQ_TRANSLATE_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional Kannada translator."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    response = requests.post(GROQ_URL, headers=headers, json=payload)
    result = response.json()
    translation = result['choices'][0]['message']['content']

    return jsonify({"translated": translation.strip()})


# === QUIZ FEATURE ===

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    language = request.json.get("language")

    if not language:
        return jsonify({"error": "No language selected"}), 400

    questions = {
        "Python": [
            {
                "question": "What is a list in Python?",
                "options": ["Immutable", "Mutable", "Fixed-size", "None"],
                "answer": "Mutable"
            },
            {
                "question": "Which keyword is used to define a function?",
                "options": ["define", "function", "def", "func"],
                "answer": "def"
            }
        ],
        "C++": [
            {
                "question": "Which of the following is a correct class declaration in C++?",
                "options": ["class MyClass {}", "MyClass {}", "function MyClass {}", "def class MyClass {}"],
                "answer": "class MyClass {}"
            },
            {
                "question": "Which symbol is used to declare a pointer?",
                "options": ["&", "*", "#", "%"],
                "answer": "*"
            }
        ]
    }

    return jsonify({"questions": questions.get(language, [])})


# === MAIN ENTRY POINT ===

if __name__ == '__main__':
    app.run(debug=True)
