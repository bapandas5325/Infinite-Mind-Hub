# 📚 MCQ Exam App

A React + Vite based MCQ quiz system that converts CSV question files into a full online exam platform with practice mode, test mode, timer, and result tracking.

---

# 🧠 About the System
This app reads MCQ questions from a CSV file and dynamically builds an exam interface. It supports both learning (practice) and real exam simulation with strict rules, timer control, and scoring system.

---

# ⚙️ How It Works
Upload CSV → Questions are parsed → User selects exam settings (mode, time, question count) → Quiz starts → User answers questions → System evaluates score → Result displayed with performance summary

---

# 🎯 Modes

Practice Mode → Learning mode, no time limit, answers can be changed anytime, instant feedback possible  
Attempt Mode → Real exam simulation, timer enabled, no answer changes allowed, strict exam rules applied

---

# 🛡️ Anti-Cheating System
To simulate real exam environment:
- Detects tab switching / window loss
- Fullscreen mode enforced during exam
- Warning alerts on focus loss
- Prevents distractions like copy/paste or right-click (optional)

---

# 🌙 UI / UX Features
- Dark mode / light mode toggle
- Full-screen exam interface
- Question palette sidebar for quick navigation
- Progress bar showing attempted questions
- Clean exam-style layout

---

# 📋 Question Palette
A scrollable numbered panel that allows users to jump between questions instantly. It shows:
- Answered questions
- Unanswered questions
- Marked questions
- Current question highlight

---

# ⏱️ Timer System
- Countdown timer for exam duration
- Auto-submit when time ends
- Warning when time is about to finish

---

# 📁 CSV Format
Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer  
CorrectAnswer must be A / B / C / D

---

# 🛠️ Tech Stack
React 18, Vite, PapaParse, Chart.js, React-Chartjs-2

---

# 🚀 System Flow
CSV Upload → Parse Data → Configure Exam → Start Quiz → Answer Questions → Submit → Score Calculation → Result Dashboard

---
# 📸 Screenshots (App Flow)

The app follows a step-by-step exam workflow from login/start to final exam execution.

---

## 🏠 1. Home Page
Entry screen of the MCQ system where user starts the process.

![Home Page](screenshots/home.png)

---

## 📁 2. Question File Upload
User uploads the CSV question file here.

![Question File](screenshots/question-file.png)

---

## 📊 3. Questions From CSV
System parses and displays questions from uploaded CSV file.

![Questions From CSV](screenshots/questions-from-csv.png)

---

## 📑 4. Instruction Page
Before starting the exam, user selects settings like:
- Mode (Practice / Attempt)
- Number of questions
- Timer setup
- Exam rules

![Instruction Page](screenshots/instruction.png)

---

## 🧠 5. Exam Window
Main exam interface with full features:
- Timer system
- Question palette navigation
- Answer selection
- Progress tracking
- Fullscreen + anti-cheating mode

![Exam Window](screenshots/exam-window.png)

# 👨‍💻 Author
B.Das  
GitHub: https://github.com/bapandas5325

---

# ⭐ Summary
This project is a complete exam simulation system designed to replicate real competitive exams with structured UI, timer control, and strict test environment.
