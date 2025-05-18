# 🇮🇳 Kannada Code Tutor – A Culturally Inclusive Python Learning Platform

**Empowering rural learners with native-language programming tools.**

## 🧠 Overview

**Kannada Code Tutor** is a web-based educational platform designed to teach Python programming in **Kannada**. It addresses the linguistic and digital divide by enabling students—especially from rural areas—to learn coding using their native language. Through speech or typed Kannada input, users can generate Python code, analyze time complexity, and test their understanding with interactive quizzes.

---

## 🌟 Key Features

- ✍️ **Kannada-to-Python Code Generator**  
  Users type or speak programming logic in Kannada. The system translates it, processes it through a fine-tuned **CodeT5** model, and generates Python code with explanations.

- 🧪 **Embedded Python IDE**  
  Users can **run and test** the generated code instantly via an embedded **Trinket.io** Python interpreter.

- 📊 **Time Complexity Analyzer**  
  The platform uses a **fine-tuned LLaMA-3 model** to predict the time complexity of user-submitted Python code and displays it using a graph for intuitive understanding.

- 🧠 **Interactive Quiz Module**  
  A bilingual quiz (Kannada/English) randomly selects **10 multiple-choice questions** to help users test and reinforce their programming knowledge.

---

## 🏗️ Tech Stack

| Layer       | Tools / Frameworks                          |
|-------------|---------------------------------------------|
| Frontend    | HTML, CSS, JavaScript                       |
| Backend     | Django (Python)                             |
| AI Models   | CodeT5 (Hugging Face), LLaMA-3 (fine-tuned) |
| NLP         | deep_translator, Google Translate API       |
| Code Editor | Embedded Trinket.io                         |
| DevOps      | Git, GitHub                                 |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- Django
- Node.js (optional for API proxying)
- Git

### Clone the Repository

```bash
git clone https://github.com/yourusername/kannada-code-tutor.git
cd kannada-code-tutor
