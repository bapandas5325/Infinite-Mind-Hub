# 📚 MCQ Exam App

A React + Vite based MCQ quiz system that converts CSV question files into a full online exam platform with Practice Mode, Attempt Mode, Timer system, Anti-Cheating features, and Result tracking.

---

# 🧠 About the System

This application converts a CSV question bank into a full exam simulation platform.  
It supports competitive exam preparation like SSC, Banking, Railway, etc.

Users can upload questions, configure exam settings, and attempt structured tests with real exam-like environment.

---

# ⚙️ How It Works

CSV Upload → Questions parsed → Exam settings selected → Instruction page → Exam starts → User answers → Score calculated → Result shown.

---

# 🎯 Modes

## 📖 Practice Mode
- No time limit  
- Answers can be changed anytime  
- Learning-based mode  
- Instant feedback  

## 🏁 Attempt Mode (Exam Simulation)
- Strict exam rules  
- Timer enabled  
- No answer changes allowed  
- Full-screen mode active  
- Anti-cheating system enabled  
- Result shown at end  

---

# 🛡️ Anti-Cheating System

- Tab switch detection  
- Full-screen enforcement  
- Focus loss warning  
- Optional copy/paste disable  
- Auto-submit on violation (optional)  

---

# 🌙 UI / UX FEATURES

- 🌙 Dark / Light mode toggle  
- 🖥️ Full-screen exam interface  
- 📋 Question palette navigation  
- 📊 Progress bar tracking  
- ⏱️ Countdown timer system  
- 🎨 Clean exam UI design  

---

# 📋 QUESTION PALETTE

Scrollable question navigator:

- 🟩 Answered  
- ⬜ Not answered  
- 🟨 Marked for review  
- 🔵 Current question  

---

# ⏱️ TIMER SYSTEM

- Countdown timer  
- Auto-submit on time end  
- Warning before time ends  

---
# 📸 Screenshots (App Flow)

## 🏠 Home Page
![Home](screenshots/home.png)

---

## 📁 Question File Upload
![Upload](screenshots/question-file.png)

---

## 📊 Questions From CSV
![CSV Questions](screenshots/questions-from-csv.png)

---

## 📑 Instruction Page
![Instruction](screenshots/instruction.png)

---

## 🧠 Exam Window
![Exam](screenshots/exam-window.png)

# 📁 CSV FORMAT

```csv
Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer
Who discovered gravity?,Newton,Einstein,Galileo,Faraday,A
What is 2 + 2?,1,2,3,4,D
