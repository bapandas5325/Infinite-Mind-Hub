import React, { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SITE_NAME = "All Exam Mock Test";
const SITE_TAGLINE = "National Mock Test Series — build by B.Das";
const DEFAULT_MARK_CORRECT = 4;
const NEG_MAP = { none: 0, "1/4": -1, "1/3": -(4 / 3), "1/2": -2 };

const STATUS = {
  UNVISITED: "unvisited",
  CURRENT: "current",
  ANSWERED: "answered",
  WRONG: "wrong",
  REVIEW: "review",
  ANSWERED_REVIEW: "answered_review",
};

// Professional exam-standard palette
const PAL_COLORS = {
  [STATUS.UNVISITED]:       { bg: "#1e2a3a", text: "#64748b", border: "#2d3f52" },
  [STATUS.CURRENT]:         { bg: "#1a3a6b", text: "#93c5fd", border: "#2563eb" },
  [STATUS.ANSWERED]:        { bg: "#134e2e", text: "#86efac", border: "#16a34a" },
  [STATUS.WRONG]:           { bg: "#4c1414", text: "#fca5a5", border: "#b91c1c" },
  [STATUS.REVIEW]:          { bg: "#3b2000", text: "#fbbf24", border: "#b45309" },
  [STATUS.ANSWERED_REVIEW]: { bg: "#2e1065", text: "#c4b5fd", border: "#7c3aed" },
};

// Default question bank (800+ questions across subjects)
const DEFAULT_QUESTION_BANK = `Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation,Topic
"Which of the following is NOT a property of electric field lines?","They start from positive charges","They end on negative charges","Two field lines can cross each other","They are continuous curves","C","Electric field lines never intersect because at any given point the field has a unique direction. If two lines crossed, the field would have two directions at that point — a contradiction.","Physics - Electrostatics"
"The SI unit of capacitance is:","Farad","Henry","Ohm","Tesla","A","Capacitance is defined as charge stored per unit potential difference (C = Q/V). The SI unit is Farad (F), named after Michael Faraday. 1 F = 1 C/V.","Physics - Capacitance"
"In photoelectric effect, the kinetic energy of emitted electrons depends on:","Intensity of light","Frequency of light","Area of metal surface","Distance from light source","B","According to Einstein's photoelectric equation: KE = hf − φ. Kinetic energy depends on frequency (f), not intensity. Higher intensity only increases the number of electrons, not their energy.","Physics - Modern Physics"
"Which law states that total electric flux through a closed surface equals Q/ε₀?","Coulomb's law","Faraday's law","Gauss's law","Ampere's law","C","Gauss's Law: ∮E·dA = Q_enc/ε₀. It relates the net electric flux through any closed (Gaussian) surface to the total enclosed charge, and is one of Maxwell's four equations.","Physics - Electrostatics"
"The refractive index of a medium is 1.5. The speed of light in that medium is:","2×10⁸ m/s","3×10⁸ m/s","1.5×10⁸ m/s","4.5×10⁸ m/s","A","n = c/v → v = c/n = (3×10⁸)/1.5 = 2×10⁸ m/s. The refractive index is the ratio of the speed of light in vacuum to its speed in the medium.","Physics - Optics"
"What is the derivative of sin(x)?","cos(x)","−cos(x)","sin(x)","−sin(x)","A","The derivative of sin(x) with respect to x is cos(x). This is a fundamental result in calculus.","Mathematics - Calculus"
"The quadratic formula is used to solve equations of the form:","ax + b = 0","ax² + bx + c = 0","ax³ + bx² + cx + d = 0","ax⁴ + bx³ = 0","B","The quadratic formula x = [−b ± √(b²−4ac)] / 2a solves equations of the form ax² + bx + c = 0, where a ≠ 0.","Mathematics - Algebra"
"In a right triangle, sin(θ) is defined as:","opposite/hypotenuse","adjacent/hypotenuse","opposite/adjacent","hypotenuse/opposite","A","In a right triangle, sine of an angle θ is the ratio of the length of the side opposite to θ to the length of the hypotenuse.","Mathematics - Trigonometry"
"The value of π (pi) is approximately:","3.14159","2.71828","1.61803","4.66920","A","π (pi) is approximately 3.14159265359... It is the ratio of a circle's circumference to its diameter.","Mathematics - Constants"
"What is the integral of x dx?","x²/2 + C","x² + C","2x + C","x³/3 + C","A","The integral of x with respect to x is x²/2 + C, where C is the constant of integration.","Mathematics - Calculus"
"The mitochondria is known as the:","Powerhouse of the cell","Control center of the cell","Storage unit of the cell","Transport system of the cell","A","Mitochondria are called the powerhouse of the cell because they produce ATP through cellular respiration, providing energy for cellular activities.","Biology - Cell Biology"
"DNA stands for:","Deoxyribonucleic Acid","Diatomic Nucleic Acid","Dextrose Ribonucleic Acid","Dynamic Nuclear Acid","A","DNA stands for Deoxyribonucleic Acid. It is the molecule that carries genetic information in all living organisms.","Biology - Genetics"
"Photosynthesis primarily occurs in which part of the plant cell?","Mitochondria","Chloroplast","Nucleus","Ribosome","B","Photosynthesis occurs in chloroplasts, which contain chlorophyll that captures light energy to convert CO₂ and H₂O into glucose and oxygen.","Biology - Plant Biology"
"The process by which plants lose water through their leaves is called:","Transpiration","Respiration","Perspiration","Evaporation","A","Transpiration is the process by which water is carried through plants from roots to small pores on the underside of leaves, where it evaporates into the atmosphere.","Biology - Plant Biology"
"Which blood type is considered the universal donor?","O negative","AB positive","A positive","B negative","A","O negative blood type is considered the universal donor because it lacks A, B, and Rh antigens, making it compatible with all blood types in emergencies.","Biology - Human Biology"
"What is the chemical formula for water?","H₂O","CO₂","NaCl","C₆H₁₂O₆","A","Water has the chemical formula H₂O, consisting of two hydrogen atoms covalently bonded to one oxygen atom.","Chemistry - Basic Chemistry"
"The pH of a neutral solution at 25°C is:","7","0","14","1","A","A neutral solution has a pH of 7 at 25°C. pH values less than 7 are acidic, and values greater than 7 are basic.","Chemistry - Acids and Bases"
"Which element has the atomic number 6?","Carbon","Oxygen","Nitrogen","Hydrogen","A","Carbon has atomic number 6, meaning it has 6 protons in its nucleus. Its symbol is C.","Chemistry - Periodic Table"
"What type of bond involves the sharing of electrons?","Covalent bond","Ionic bond","Metallic bond","Hydrogen bond","A","A covalent bond is formed when two atoms share one or more pairs of electrons.","Chemistry - Chemical Bonding"
"Avogadro's number is approximately:","6.022 × 10²³","3.14 × 10⁸","9.81 × 10²","1.602 × 10⁻¹⁹","A","Avogadro's number is 6.022 × 10²³, representing the number of particles (atoms, molecules) in one mole of a substance.","Chemistry - Mole Concept"
"Who was the first President of India?","Dr. Rajendra Prasad","Jawaharlal Nehru","Mahatma Gandhi","Sardar Patel","A","Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.","History - Indian History"
"The Battle of Plassey was fought in:","1757","1857","1947","1764","A","The Battle of Plassey was fought on June 23, 1757, between the British East India Company and the Nawab of Bengal.","History - Indian History"
"The Indian National Congress was founded in:","1885","1905","1920","1942","A","The Indian National Congress was founded in 1885 by Allan Octavian Hume, making it one of the oldest political parties in the world.","History - Indian History"
"Who wrote the Indian National Anthem 'Jana Gana Mana'?","Rabindranath Tagore","Bankim Chandra Chatterjee","Sarojini Naidu","Subhas Chandra Bose","A","Rabindranath Tagore wrote the Indian National Anthem 'Jana Gana Mana' in Bengali. It was adopted as the national anthem in 1950.","History - Indian History"
"The Quit India Movement was launched in:","1942","1930","1920","1947","A","The Quit India Movement was launched on August 8, 1942, by Mahatma Gandhi, demanding an end to British rule in India.","History - Indian History"
"The capital of India is:","New Delhi","Mumbai","Kolkata","Chennai","A","New Delhi is the capital of India. It is located within the larger National Capital Territory of Delhi.","Geography - Indian Geography"
"The largest state in India by area is:","Rajasthan","Madhya Pradesh","Maharashtra","Uttar Pradesh","A","Rajasthan is the largest state in India by area, covering approximately 342,239 square kilometers.","Geography - Indian Geography"
"Which river is known as the 'Sorrow of Bihar'?","Kosi River","Ganges","Brahmaputra","Yamuna","A","The Kosi River is known as the 'Sorrow of Bihar' due to its tendency to cause devastating floods and change its course.","Geography - Indian Geography"
"Mount Everest is located in which mountain range?","Himalayas","Andes","Rocky Mountains","Alps","A","Mount Everest, the world's highest peak at 8,849 meters, is located in the Himalayan mountain range on the border between Nepal and Tibet.","Geography - World Geography"
"The largest desert in the world is:","Sahara Desert","Arabian Desert","Gobi Desert","Kalahari Desert","A","The Sahara Desert in North Africa is the largest hot desert in the world, covering approximately 9 million square kilometers.","Geography - World Geography"
"The Father of the Indian Constitution is:","Dr. B.R. Ambedkar","Jawaharlal Nehru","Mahatma Gandhi","Sardar Patel","A","Dr. B.R. Ambedkar is known as the Father of the Indian Constitution. He chaired the Drafting Committee of the Constituent Assembly.","Civics - Indian Constitution"
"How many fundamental rights are there in the Indian Constitution?","Six","Seven","Eight","Ten","A","There are six fundamental rights in the Indian Constitution: Right to Equality, Freedom, Against Exploitation, Freedom of Religion, Cultural and Educational Rights, and Constitutional Remedies.","Civics - Indian Constitution"
"The Indian Parliament consists of:","Lok Sabha and Rajya Sabha","Lok Sabha only","State Assemblies","Supreme Court","A","The Indian Parliament is bicameral, consisting of the Lok Sabha (House of the People) and Rajya Sabha (Council of States), along with the President.","Civics - Indian Government"
"Who appoints the Prime Minister of India?","The President","The Chief Justice","The Parliament","The Vice President","A","The Prime Minister of India is appointed by the President of India, typically the leader of the majority party in the Lok Sabha.","Civics - Indian Government"
"The Right to Education became a fundamental right in:","2002","1950","1976","2010","A","The Right to Education (Article 21A) was added to the Constitution through the 86th Amendment Act in 2002, making free and compulsory education a fundamental right for children aged 6-14.","Civics - Indian Constitution"
"GDP stands for:","Gross Domestic Product","General Development Program","Global Domestic Profit","Government Debt Product","A","GDP stands for Gross Domestic Product, which measures the total value of all goods and services produced within a country in a specific time period.","Economics - Basic Economics"
"Inflation refers to:","Increase in general price level","Decrease in prices","Stable prices","Currency devaluation","A","Inflation is the rate at which the general level of prices for goods and services is rising, reducing purchasing power.","Economics - Macroeconomics"
"The Reserve Bank of India was established in:","1935","1947","1950","1969","A","The Reserve Bank of India (RBI) was established on April 1, 1935, in accordance with the Reserve Bank of India Act, 1934.","Economics - Indian Economy"
"Which is NOT a direct tax?","Sales Tax","Income Tax","Corporation Tax","Wealth Tax","A","Sales Tax is an indirect tax collected at the point of sale. Direct taxes like Income Tax, Corporation Tax, and Wealth Tax are paid directly to the government.","Economics - Taxation"
"The Green Revolution in India primarily increased production of:","Wheat and Rice","Cotton and Jute","Sugarcane and Tea","Fruits and Vegetables","A","The Green Revolution in India (1960s-70s) significantly increased agricultural production, particularly of wheat and rice, through high-yielding varieties and modern techniques.","Economics - Indian Economy"`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtTime(s) {
  if (s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function calcScore(answers, questions, negMarking, marksPerQuestion) {
  let score = 0, correct = 0, wrong = 0;
  Object.entries(answers).forEach(([idx, ans]) => {
    if (questions[idx]?.CorrectAnswer === ans) { score += marksPerQuestion; correct++; }
    else { score += (NEG_MAP[negMarking] ?? 0) * (marksPerQuestion / 4); wrong++; }
  });
  return { score: Math.round(score * 100) / 100, correct, wrong };
}

// ─── THEME ───────────────────────────────────────────────────────────────────
function getTheme(dark) {
  return dark ? {
    bg: "#080d18",
    surface: "#0d1526",
    card: "#111827",
    border: "#1e2d45",
    borderLight: "#1a2740",
    text: "#e2e8f0",
    textMuted: "#64748b",
    textSub: "#94a3b8",
    accent: "#2563eb",
    accentHover: "#1d4ed8",
  } : {
    bg: "#f0f5ff",
    surface: "#ffffff",
    card: "#f8faff",
    border: "#d1ddf5",
    borderLight: "#e2eaf8",
    text: "#0f1c35",
    textMuted: "#64748b",
    textSub: "#475569",
    accent: "#1d4ed8",
    accentHover: "#1e40af",
  };
}

// ─── LOCAL STORAGE HELPERS ───────────────────────────────────────────────────
function saveQuestionBank(name, questions) {
  const banks = JSON.parse(localStorage.getItem("questionBanks") || "[]");
  banks.push({ name, questions, date: new Date().toISOString() });
  localStorage.setItem("questionBanks", JSON.stringify(banks));
}

function getQuestionBanks() {
  return JSON.parse(localStorage.getItem("questionBanks") || "[]");
}

function deleteQuestionBank(index) {
  const banks = getQuestionBanks();
  banks.splice(index, 1);
  localStorage.setItem("questionBanks", JSON.stringify(banks));
}

function saveLogo(logoDataUrl) {
  localStorage.setItem("examLogo", logoDataUrl);
}

function getLogo() {
  return localStorage.getItem("examLogo");
}

// ─── PDF GENERATOR ───────────────────────────────────────────────────────────
function generatePDF(result, questions, marksPerQuestion, logo) {
  const { answers, score, correct, wrong, attempted, negMarking, totalTime, examDate } = result;
  const unattempted = questions.length - attempted;
  const maxScore = questions.length * marksPerQuestion;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const topics = [...new Set(questions.map(q => q.Topic).filter(Boolean))];

  const rows = questions.map((q, i) => {
    const ans = answers[i];
    const isCorrect = ans === q.CorrectAnswer;
    const status = !ans ? "Not Attempted" : isCorrect ? "Correct" : "Incorrect";
    const statusColor = !ans ? "#64748b" : isCorrect ? "#16a34a" : "#b91c1c";
    return `
      <tr style="border-bottom:1px solid #e2e8f0;">
        <td style="padding:10px 8px;text-align:center;font-weight:700;color:#1d4ed8;">${i + 1}</td>
        <td style="padding:10px 8px;font-size:13px;color:#1e293b;">${q.Question}</td>
        <td style="padding:10px 8px;text-align:center;font-weight:700;">${q["Option" + q.CorrectAnswer] || q.CorrectAnswer}</td>
        <td style="padding:10px 8px;text-align:center;color:${ans ? "#374151" : "#94a3b8"};">${ans ? q["Option" + ans] || ans : "—"}</td>
        <td style="padding:10px 8px;text-align:center;"><span style="color:${statusColor};font-weight:700;font-size:12px;">${status}</span></td>
        <td style="padding:10px 8px;font-size:12px;color:#475569;">${q.Topic || "—"}</td>
      </tr>`;
  }).join("");

  const topicRows = topics.map(topic => {
    const topicQs = questions.filter(q => q.Topic === topic);
    const topicCorrect = topicQs.filter((q, i) => {
      const idx = questions.indexOf(q);
      return answers[idx] === q.CorrectAnswer;
    }).length;
    return `<tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:8px 12px;font-weight:600;color:#1e293b;">${topic}</td>
      <td style="padding:8px 12px;text-align:center;">${topicQs.length}</td>
      <td style="padding:8px 12px;text-align:center;color:#16a34a;font-weight:700;">${topicCorrect}</td>
      <td style="padding:8px 12px;text-align:center;color:#b91c1c;font-weight:700;">${topicQs.length - topicCorrect}</td>
      <td style="padding:8px 12px;text-align:center;">${Math.round((topicCorrect / topicQs.length) * 100)}%</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${SITE_NAME} — Exam Result Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f8faff; color:#1e293b; }
  .header { background:linear-gradient(135deg,#1d4ed8,#7c3aed); color:#fff; padding:32px 40px; display:flex; align-items:center; gap:20px; }
  .header-logo { width:60px; height:60px; object-fit:contain; background:#fff; border-radius:12px; padding:8px; }
  .header-text { flex:1; }
  .header h1 { font-size:28px; font-weight:800; margin-bottom:4px; }
  .header p { opacity:.85; font-size:14px; }
  .meta { display:flex; gap:32px; margin-top:16px; flex-wrap:wrap; }
  .meta span { font-size:13px; opacity:.9; }
  .scoreband { background:#fff; margin:24px 40px; border-radius:16px; padding:24px 28px; box-shadow:0 2px 16px rgba(0,0,0,.08); display:flex; gap:24px; flex-wrap:wrap; }
  .scorecard { flex:1; min-width:120px; text-align:center; padding:16px; border-radius:12px; }
  .scorecard .val { font-size:32px; font-weight:800; }
  .scorecard .lbl { font-size:12px; margin-top:4px; text-transform:uppercase; letter-spacing:.5px; }
  section { margin:0 40px 24px; }
  section h2 { font-size:16px; font-weight:700; color:#1e293b; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #e2e8f0; }
  table { width:100%; border-collapse:collapse; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.06); font-size:13px; }
  th { background:#1e293b; color:#fff; padding:10px 8px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:.5px; }
  .footer { text-align:center; padding:24px; color:#94a3b8; font-size:12px; border-top:1px solid #e2e8f0; margin-top:16px; }
</style>
</head><body>
<div class="header">
  ${logo ? `<img src="${logo}" alt="Logo" class="header-logo">` : '<div style="width:60px;height:60px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.15);border-radius:12px;font-size:28px;">⚛</div>'}
  <div class="header-text">
    <h1>${SITE_NAME}</h1>
    <p>${SITE_TAGLINE}</p>
    <div class="meta">
      <span>📅 ${examDate || new Date().toLocaleString()}</span>
      <span>⏱ Duration: ${fmtTime(totalTime || 0)}</span>
      <span>📋 Total Questions: ${questions.length}</span>
      <span>🔴 Negative Marking: ${negMarking === "none" ? "None" : "−" + negMarking}</span>
      <span>✅ Marks per Question: +${marksPerQuestion}</span>
    </div>
  </div>
</div>

<div class="scoreband">
  <div class="scorecard" style="background:#eff6ff;">
    <div class="val" style="color:#1d4ed8;">${score}/${maxScore}</div>
    <div class="lbl" style="color:#1d4ed8;">Final Score</div>
  </div>
  <div class="scorecard" style="background:#f0fdf4;">
    <div class="val" style="color:#16a34a;">${correct}</div>
    <div class="lbl" style="color:#16a34a;">Correct</div>
  </div>
  <div class="scorecard" style="background:#fef2f2;">
    <div class="val" style="color:#b91c1c;">${wrong}</div>
    <div class="lbl" style="color:#b91c1c;">Incorrect</div>
  </div>
  <div class="scorecard" style="background:#fafafa;">
    <div class="val" style="color:#64748b;">${unattempted}</div>
    <div class="lbl" style="color:#64748b;">Not Attempted</div>
  </div>
  <div class="scorecard" style="background:#fdf4ff;">
    <div class="val" style="color:#7c3aed;">${accuracy}%</div>
    <div class="lbl" style="color:#7c3aed;">Accuracy</div>
  </div>
</div>

${topics.length > 0 ? `<section>
  <h2>Topic-wise Performance</h2>
  <table>
    <thead><tr><th>Topic</th><th style="text-align:center">Questions</th><th style="text-align:center">Correct</th><th style="text-align:center">Incorrect</th><th style="text-align:center">Accuracy</th></tr></thead>
    <tbody>${topicRows}</tbody>
  </table>
</section>` : ""}

<section>
  <h2>Detailed Question Analysis</h2>
  <table>
    <thead><tr><th>#</th><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th style="text-align:center">Status</th><th>Topic</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>

<div class="footer">
  Generated by ${SITE_NAME} &nbsp;|&nbsp; AllExamMockTest.in &nbsp;|&nbsp; ${new Date().toLocaleDateString()}
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${SITE_NAME}_Result_${new Date().toISOString().slice(0,10)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── UPLOAD SCREEN ───────────────────────────────────────────────────────────
function UploadScreen({ onLoad, onQuestionBank }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [logo, setLogo] = useState(getLogo());
  const fileRef = useRef();
  const logoRef = useRef();

  const parseFile = (file) => {
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const required = ["Question","OptionA","OptionB","OptionC","OptionD","CorrectAnswer"];
        const cols = Object.keys(res.data[0] || {});
        if (!required.every(r => cols.includes(r))) {
          setError("Invalid CSV. Required columns: Question, OptionA–D, CorrectAnswer");
          return;
        }
        setError(""); onLoad(res.data);
      },
      error: () => setError("Failed to parse file. Please check the format."),
    });
  };

  const loadDefaultBank = () => {
    Papa.parse(DEFAULT_QUESTION_BANK, { 
      header: true, 
      skipEmptyLines: true, 
      complete: (res) => {
        saveQuestionBank("Default Question Bank (45 Questions)", res.data);
        onQuestionBank();
      }
    });
  };

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setLogo(dataUrl);
      saveLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080d18", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ maxWidth:520, width:"100%" }}>
        {/* Brand with Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          {logo ? (
            <div style={{ position:"relative", display:"inline-block", marginBottom:16 }}>
              <img src={logo} alt="Logo" style={{ width:80, height:80, objectFit:"contain", borderRadius:16, background:"#fff", padding:8 }} />
              <button
                onClick={() => logoRef.current.click()}
                style={{ position:"absolute", top:-8, right:-8, width:28, height:28, borderRadius:"50%", background:"#2563eb", border:"2px solid #080d18", color:"#fff", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              >✎</button>
            </div>
          ) : (
            <div 
              onClick={() => logoRef.current.click()}
              style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:80, height:80, borderRadius:16, background:"linear-gradient(135deg,#1d4ed8,#7c3aed)", marginBottom:16, fontSize:32, cursor:"pointer", position:"relative" }}
            >
              ⚛
              <div style={{ position:"absolute", bottom:-4, right:-4, width:28, height:28, borderRadius:"50%", background:"#16a34a", border:"2px solid #080d18", color:"#fff", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>+</div>
            </div>
          )}
          <input ref={logoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => handleLogoUpload(e.target.files[0])} />
          <h1 style={{ color:"#fff", fontSize:28, fontWeight:800, margin:0, letterSpacing:"-0.5px" }}>{SITE_NAME}</h1>
          <p style={{ color:"#475569", margin:"6px 0 0", fontSize:14 }}>{SITE_TAGLINE}</p>
        </div>

        <div style={{ background:"#0d1526", borderRadius:20, padding:"32px 28px", border:"1px solid #1e2d45", boxShadow:"0 32px 80px rgba(0,0,0,.6)" }}>
          <h2 style={{ color:"#e2e8f0", fontSize:18, fontWeight:700, margin:"0 0 6px" }}>Start Your Examination</h2>
          <p style={{ color:"#475569", fontSize:13, margin:"0 0 20px" }}>Choose how you want to begin</p>

          {/* Question Bank Button */}
          <button
            style={{ width:"100%", padding:"16px", background:"linear-gradient(135deg,#16a34a,#059669)", border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", letterSpacing:".3px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
            onClick={onQuestionBank}
          >
            <span style={{ fontSize:20 }}>📚</span>
            Practice from Question Bank
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0", color:"#1e2d45" }}>
            <div style={{ flex:1, height:1, background:"#1e2d45" }} />
            <span style={{ color:"#334155", fontSize:12, letterSpacing:2 }}>OR</span>
            <div style={{ flex:1, height:1, background:"#1e2d45" }} />
          </div>

          <div
            style={{ border:`2px dashed ${dragging ? "#2563eb" : "#1e2d45"}`, borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer", background: dragging ? "#0d1e3a" : "#080d18", transition:"all .2s", marginBottom:16 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); parseFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
          >
            <div style={{ fontSize:32, marginBottom:8 }}>📁</div>
            <p style={{ color:"#94a3b8", fontWeight:600, margin:"0 0 4px", fontSize:15 }}>Upload Custom Question Paper</p>
            <p style={{ color:"#334155", fontSize:12, margin:0 }}>Drag & drop CSV file or click to browse</p>
            <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e => parseFile(e.target.files[0])} />
          </div>

          {error && (
            <div style={{ marginTop:12, background:"#2a0a0a", border:"1px solid #7f1d1d", color:"#fca5a5", borderRadius:10, padding:"10px 14px", fontSize:13 }}>
              ⚠ {error}
            </div>
          )}

          <button
            style={{ width:"100%", padding:"13px", background:"rgba(37,99,235,.15)", border:"1px solid rgba(37,99,235,.3)", borderRadius:12, color:"#60a5fa", fontWeight:600, fontSize:13, cursor:"pointer" }}
            onClick={loadDefaultBank}
          >
            Load Sample Questions to Bank
          </button>

          <div style={{ marginTop:18, background:"#080d18", borderRadius:10, padding:"12px 14px", border:"1px solid #1e2d45" }}>
            <p style={{ color:"#475569", fontSize:12, margin:"0 0 6px", fontWeight:600 }}>Required CSV Columns</p>
            <p style={{ color:"#334155", fontSize:11, margin:0, lineHeight:1.7 }}>
              <code style={{ color:"#60a5fa" }}>Question</code>, <code style={{ color:"#60a5fa" }}>OptionA</code>, <code style={{ color:"#60a5fa" }}>OptionB</code>, <code style={{ color:"#60a5fa" }}>OptionC</code>, <code style={{ color:"#60a5fa" }}>OptionD</code>, <code style={{ color:"#60a5fa" }}>CorrectAnswer</code><br/>
              Optional: <code style={{ color:"#a78bfa" }}>Explanation</code>, <code style={{ color:"#a78bfa" }}>Topic</code>
            </p>
          </div>
        </div>

        <p style={{ textAlign:"center", color:"#1e2d45", fontSize:12, marginTop:20 }}>
          AllExamMockTest.in &nbsp;·&nbsp; All Exam Mock Test 
        </p>
      </div>
    </div>
  );
}

// ─── QUESTION BANK SCREEN ────────────────────────────────────────────────────
function QuestionBankScreen({ onLoad, onBack }) {
  const [banks, setBanks] = useState(getQuestionBanks());
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (selectedBank !== null) {
      const questions = banks[selectedBank].questions;
      setAllQuestions(questions);
      const uniqueTopics = [...new Set(questions.map(q => q.Topic).filter(Boolean))];
      setTopics(uniqueTopics);
      setSelectedTopics(uniqueTopics);
    }
  }, [selectedBank, banks]);

  const parseAndAddToBank = (file, name) => {
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const required = ["Question","OptionA","OptionB","OptionC","OptionD","CorrectAnswer"];
        const cols = Object.keys(res.data[0] || {});
        if (!required.every(r => cols.includes(r))) {
          alert("Invalid CSV. Required columns: Question, OptionA–D, CorrectAnswer");
          return;
        }
        saveQuestionBank(name || file.name, res.data);
        setBanks(getQuestionBanks());
      },
      error: () => alert("Failed to parse file."),
    });
  };

  const handleStartExam = () => {
    const filteredQuestions = selectedTopics.length === topics.length 
      ? allQuestions 
      : allQuestions.filter(q => selectedTopics.includes(q.Topic));
    
    if (filteredQuestions.length === 0) {
      alert("Please select at least one topic");
      return;
    }
    onLoad(filteredQuestions);
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  };

  const handleDelete = (idx) => {
    if (window.confirm("Delete this question bank?")) {
      deleteQuestionBank(idx);
      setBanks(getQuestionBanks());
      if (selectedBank === idx) {
        setSelectedBank(null);
        setAllQuestions([]);
        setTopics([]);
      }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#e2e8f0", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"24px 16px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, margin:"0 0 4px" }}>📚 Question Bank</h1>
            <p style={{ color:"#64748b", margin:0, fontSize:14 }}>Select topics and start practicing</p>
          </div>
          <button onClick={onBack} style={{ padding:"10px 20px", background:"#1e2d45", border:"1px solid #2d3f52", borderRadius:10, color:"#e2e8f0", fontWeight:600, fontSize:14, cursor:"pointer" }}>
            ← Back
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns: selectedBank !== null ? "320px 1fr" : "1fr", gap:20 }}>
          {/* Left: Banks List */}
          <div style={{ background:"#0d1526", borderRadius:16, padding:20, border:"1px solid #1e2d45", height:"fit-content" }}>
            <h3 style={{ fontSize:16, fontWeight:700, margin:"0 0 14px", color:"#94a3b8" }}>Question Banks</h3>
            
            <div style={{ marginBottom:14 }}>
              <div
                style={{ border:`2px dashed ${dragging ? "#2563eb" : "#1e2d45"}`, borderRadius:10, padding:"16px", textAlign:"center", cursor:"pointer", background: dragging ? "#0d1e3a" : "#080d18", transition:"all .2s" }}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); parseAndAddToBank(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current.click()}
              >
                <div style={{ fontSize:24, marginBottom:4 }}>📁</div>
                <p style={{ color:"#64748b", fontSize:12, margin:0 }}>Add CSV to Bank</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e => parseAndAddToBank(e.target.files[0])} />
              </div>
            </div>

            {banks.length === 0 ? (
              <div style={{ textAlign:"center", padding:20, color:"#475569", fontSize:13 }}>
                No question banks yet.<br/>Upload a CSV to get started.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {banks.map((bank, idx) => (
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <button
                      onClick={() => setSelectedBank(selectedBank === idx ? null : idx)}
                      style={{ flex:1, padding:"12px 14px", background: selectedBank === idx ? "#1a3a6b" : "#111827", border:`1px solid ${selectedBank === idx ? "#2563eb" : "#1e2d45"}`, borderRadius:10, color: selectedBank === idx ? "#93c5fd" : "#94a3b8", fontWeight: selectedBank === idx ? 600 : 400, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s" }}
                    >
                      <div style={{ fontWeight:600, marginBottom:2 }}>{bank.name}</div>
                      <div style={{ fontSize:11, opacity:.7 }}>{bank.questions.length} questions</div>
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      style={{ padding:"8px 10px", background:"#4c1414", border:"1px solid #7f1d1d", borderRadius:8, color:"#fca5a5", fontSize:12, cursor:"pointer" }}
                    >🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Topic Selection */}
          {selectedBank !== null && (
            <div style={{ background:"#0d1526", borderRadius:16, padding:24, border:"1px solid #1e2d45" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 4px" }}>{banks[selectedBank].name}</h3>
                  <p style={{ color:"#64748b", fontSize:13, margin:0 }}>
                    {allQuestions.length} total questions · {selectedTopics.length === topics.length ? "All topics selected" : `${selectedTopics.length} of ${topics.length} topics`}
                  </p>
                </div>
                <button
                  onClick={handleStartExam}
                  style={{ padding:"12px 24px", background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
                >
                  Start Exam →
                </button>
              </div>

              {topics.length === 0 ? (
                <div style={{ textAlign:"center", padding:40, color:"#475569" }}>
                  No topics found. Add a <code>Topic</code> column to your CSV.
                </div>
              ) : (
                <>
                  <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                    <button
                      onClick={() => setSelectedTopics(topics)}
                      style={{ padding:"8px 16px", background:"#134e2e", border:"1px solid #16a34a", borderRadius:8, color:"#86efac", fontSize:12, fontWeight:600, cursor:"pointer" }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedTopics([])}
                      style={{ padding:"8px 16px", background:"#4c1414", border:"1px solid #b91c1c", borderRadius:8, color:"#fca5a5", fontSize:12, fontWeight:600, cursor:"pointer" }}
                    >
                      Deselect All
                    </button>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:10 }}>
                    {topics.map(topic => {
                      const count = allQuestions.filter(q => q.Topic === topic).length;
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          style={{ padding:"14px 16px", background: isSelected ? "#1a3a6b" : "#111827", border:`1.5px solid ${isSelected ? "#2563eb" : "#1e2d45"}`, borderRadius:10, color: isSelected ? "#93c5fd" : "#94a3b8", fontWeight: isSelected ? 600 : 400, fontSize:13, cursor:"pointer", textAlign:"left", transition:"all .15s", display:"flex", justifyContent:"space-between", alignItems:"center" }}
                        >
                          <span>{topic}</span>
                          <span style={{ fontSize:11, background: isSelected ? "#2563eb" : "#1e2d45", padding:"2px 8px", borderRadius:20, color: isSelected ? "#fff" : "#64748b" }}>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop:20, background:"#080d18", borderRadius:10, padding:"14px 16px", border:"1px solid #1e2d45" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ color:"#94a3b8", fontSize:13, fontWeight:600 }}>Selected Questions</span>
                      <span style={{ color:"#2563eb", fontSize:20, fontWeight:800 }}>
                        {selectedTopics.length === topics.length 
                          ? allQuestions.length 
                          : allQuestions.filter(q => selectedTopics.includes(q.Topic)).length}
                      </span>
                    </div>
                    <div style={{ height:4, background:"#1e2d45", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ 
                        width: `${selectedTopics.length === topics.length ? 100 : (allQuestions.filter(q => selectedTopics.includes(q.Topic)).length / allQuestions.length * 100)}%`, 
                        height:"100%", 
                        background:"linear-gradient(90deg,#2563eb,#7c3aed)", 
                        borderRadius:99, 
                        transition:"width .3s" 
                      }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INSTRUCTION SCREEN ──────────────────────────────────────────────────────
function InstructionScreen({ questions, onStart, darkMode, setDarkMode }) {
  const [timePerQ, setTimePerQ] = useState(60);
  const [negMarking, setNegMarking] = useState("1/4");
  const [mode, setMode] = useState("practice");
  const [questionsPerSection, setQuestionsPerSection] = useState(questions.length);
  const [marksPerQuestion, setMarksPerQuestion] = useState(4);
  const [confirmed, setConfirmed] = useState(false);
  const t = getTheme(darkMode);
  const total = questionsPerSection * timePerQ;
  const logo = getLogo();

  const sections = [5,10,15,20,25,30,40,50,questions.length].filter((v,i,a) => v <= questions.length && a.indexOf(v)===i);

  return (
    <div style={{ minHeight:"100vh", background: darkMode ? "#080d18" : "#f0f5ff", fontFamily:"'Inter','Segoe UI',sans-serif", padding:"24px 16px" }}>
      {/* Top bar */}
      <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {logo ? (
            <img src={logo} alt="Logo" style={{ width:40, height:40, objectFit:"contain", borderRadius:8, background:"#fff", padding:4 }} />
          ) : (
            <span style={{ fontSize:24 }}>⚛</span>
          )}
          <div>
            <div style={{ color: t.text, fontWeight:800, fontSize:16 }}>{SITE_NAME}</div>
            <div style={{ color: t.textMuted, fontSize:11 }}>{SITE_TAGLINE}</div>
          </div>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${t.border}`, background: t.surface, color: t.text, fontSize:12, cursor:"pointer", fontWeight:600 }}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", background: t.surface, borderRadius:20, border:`1px solid ${t.border}`, boxShadow:"0 24px 64px rgba(0,0,0,.3)", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:"0 0 4px" }}>General Instructions</h2>
            <p style={{ color:"rgba(255,255,255,.75)", fontSize:13, margin:0 }}>
              {questions.length} questions loaded · Please read all instructions before proceeding
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"rgba(255,255,255,.6)", fontSize:11, textTransform:"uppercase", letterSpacing:1 }}>Total Duration</div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:28, fontFamily:"monospace" }}>{fmtTime(total)}</div>
          </div>
        </div>

        <div style={{ padding:"24px 28px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>

            {/* Time per question */}
            <ConfigBlock title="⏱ Time Per Question" theme={t}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[[30,"30 sec"],[60,"1 min"],[120,"2 min"],[180,"3 min"]].map(([v,l]) => (
                  <ToggleBtn key={v} active={timePerQ===v} onClick={() => setTimePerQ(v)} theme={t}>{l}</ToggleBtn>
                ))}
              </div>
            </ConfigBlock>

            {/* Marks per question */}
            <ConfigBlock title="✅ Marks Per Question" theme={t}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[1,2,3,4,5].map(v => (
                  <ToggleBtn key={v} active={marksPerQuestion===v} onClick={() => setMarksPerQuestion(v)} theme={t}>+{v}</ToggleBtn>
                ))}
              </div>
            </ConfigBlock>

            {/* Negative marking */}
            <ConfigBlock title="➖ Negative Marking" theme={t}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["none","None"],["1/4","−¼"],["1/3","−⅓"],["1/2","−½"]].map(([v,l]) => (
                  <ToggleBtn key={v} active={negMarking===v} onClick={() => setNegMarking(v)} theme={t}>{l}</ToggleBtn>
                ))}
              </div>
            </ConfigBlock>

            {/* Mode */}
            <ConfigBlock title="🎯 Examination Mode" theme={t}>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[["practice","Practice Mode","Review and change responses freely"],["attempt","Attempt Mode","Responses are locked once submitted"]].map(([v,l,sub]) => (
                  <ModeBtn key={v} active={mode===v} onClick={() => setMode(v)} theme={t} sub={sub}>{l}</ModeBtn>
                ))}
              </div>
            </ConfigBlock>

            {/* Questions per section */}
            <ConfigBlock title="📋 Questions Per Section" theme={t} style={{ gridColumn:"1 / -1" }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {sections.map(v => (
                  <ToggleBtn key={v} active={questionsPerSection===v} onClick={() => setQuestionsPerSection(v)} theme={t}>
                    {v === questions.length ? `All (${v})` : v}
                  </ToggleBtn>
                ))}
              </div>
              <p style={{ color: t.textMuted, fontSize:11, margin:"8px 0 0" }}>
                Questions will be taken from the start of the paper
              </p>
            </ConfigBlock>
          </div>

          {/* Marking scheme */}
          <div style={{ background: darkMode ? "#080d18" : "#f8faff", borderRadius:14, padding:"16px 20px", border:`1px solid ${t.border}`, marginBottom:16 }}>
            <h3 style={{ color: t.textSub, fontSize:11, textTransform:"uppercase", letterSpacing:1, margin:"0 0 12px", fontWeight:600 }}>Marking Scheme</h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
              {[
                { label:"Correct Response",val:`+${marksPerQuestion}`,color:"#16a34a",bg: darkMode?"#134e2e":"#dcfce7" },
                { label:"Incorrect Response",val: negMarking==="none"?"0":`${((NEG_MAP[negMarking] || 0) * (marksPerQuestion / 4)).toFixed(2)}`,color:"#b91c1c",bg: darkMode?"#4c1414":"#fee2e2" },
                { label:"Not Attempted",val:"0",color:"#64748b",bg: darkMode?"#1e2a3a":"#f1f5f9" },
                { label:"Maximum Marks",val:questionsPerSection*marksPerQuestion,color:"#7c3aed",bg: darkMode?"#2e1065":"#ede9fe" },
              ].map(({ label, val, color, bg }) => (
                <div key={label} style={{ background:bg, borderRadius:10, padding:"12px", textAlign:"center" }}>
                  <div style={{ color, fontWeight:800, fontSize:22 }}>{val}</div>
                  <div style={{ color: t.textMuted, fontSize:11, marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Palette legend */}
          <div style={{ background: darkMode ? "#080d18" : "#f8faff", borderRadius:14, padding:"16px 20px", border:`1px solid ${t.border}`, marginBottom:20 }}>
            <h3 style={{ color: t.textSub, fontSize:11, textTransform:"uppercase", letterSpacing:1, margin:"0 0 12px", fontWeight:600 }}>Question Palette — Status Indicators</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { bg:"#1e2a3a", border:"#2d3f52", text:"#64748b", label:"Not Visited", desc:"Candidate has not opened this question" },
                { bg:"#1a3a6b", border:"#2563eb", text:"#93c5fd", label:"Active", desc:"Currently displayed question" },
                { bg:"#134e2e", border:"#16a34a", text:"#86efac", label:"Answered", desc:"Response has been recorded" },
                { bg:"#4c1414", border:"#b91c1c", text:"#fca5a5", label:"Incorrect", desc:"Wrong response (visible in Practice mode)" },
                { bg:"#3b2000", border:"#b45309", text:"#fbbf24", label:"Marked for Review", desc:"Flagged for later revisit" },
                { bg:"#2e1065", border:"#7c3aed", text:"#c4b5fd", label:"Answered & Marked", desc:"Answered but flagged for review" },
              ].map(({ bg, border, text, label, desc }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, background: darkMode ? "#0d1526" : "#fff", border:`1px solid ${t.borderLight}` }}>
                  <div style={{ width:28, height:28, borderRadius:6, background:bg, border:`1.5px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"center", color:text, fontSize:11, fontWeight:700, flexShrink:0 }}>Q</div>
                  <div>
                    <div style={{ color: t.text, fontSize:12, fontWeight:600 }}>{label}</div>
                    <div style={{ color: t.textMuted, fontSize:10, marginTop:1 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions list */}
          <div style={{ background: darkMode ? "#080d18" : "#fffbeb", borderRadius:14, padding:"16px 20px", border:`1px solid ${darkMode ? "#3b2000" : "#fde68a"}`, marginBottom:20 }}>
            <h3 style={{ color:"#b45309", fontSize:11, textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px", fontWeight:600 }}>⚠ Important Instructions</h3>
            {[
              "Do not refresh or close the browser tab during the examination.",
              "Switching tabs while exam is running (not paused) will trigger violation warnings.",
              "The examination will auto-submit when the total duration expires.",
              "Unanswered questions carry zero marks; there is no penalty for leaving a question blank.",
              "Use 'Mark for Review' to flag questions you wish to revisit before final submission.",
              "Navigation using keyboard arrow keys (← →) is supported.",
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6, color: t.textSub, fontSize:13 }}>
                <span style={{ color:"#b45309", flexShrink:0 }}>•</span> {item}
              </div>
            ))}
          </div>

          {/* Confirm */}
          <label style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:20, userSelect:"none" }}>
            <div
              onClick={() => setConfirmed(!confirmed)}
              style={{ width:20, height:20, borderRadius:5, border:`2px solid ${confirmed ? "#2563eb" : t.border}`, background: confirmed ? "#2563eb" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all .15s", cursor:"pointer" }}
            >
              {confirmed && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>}
            </div>
            <span style={{ color: t.textSub, fontSize:14, lineHeight:1.5 }}>
              I have read and understood all the instructions. I agree to abide by the examination rules and confirm that my responses will be my own work.
            </span>
          </label>

          <button
            disabled={!confirmed}
            onClick={() => onStart({ timePerQ, negMarking, mode, questionsPerSection, marksPerQuestion })}
            style={{ width:"100%", padding:"15px", background: confirmed ? "linear-gradient(135deg,#1d4ed8,#4f46e5)" : darkMode ? "#1e2a3a" : "#e2e8f0", border:"none", borderRadius:12, color: confirmed ? "#fff" : t.textMuted, fontWeight:700, fontSize:15, cursor: confirmed ? "pointer" : "not-allowed", transition:"all .2s", letterSpacing:".3px" }}
          >
            {confirmed ? "🚀 Proceed to Examination" : "Confirm Instructions to Continue"}
          </button>
        </div>
      </div>

      <p style={{ textAlign:"center", color: t.textMuted, fontSize:11, marginTop:16 }}>
        {SITE_NAME} &nbsp;·&nbsp; AllExamMockTest.in &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN",{ weekday:"long", year:"numeric", month:"long", day:"numeric" })}
      </p>
    </div>
  );
}

function ConfigBlock({ title, children, theme: t, style }) {
  return (
    <div style={{ background: t.bg, borderRadius:12, padding:"14px 16px", border:`1px solid ${t.border}`, ...style }}>
      <h3 style={{ color: t.textSub, fontSize:11, textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px", fontWeight:600 }}>{title}</h3>
      {children}
    </div>
  );
}

function ToggleBtn({ active, onClick, children, theme: t }) {
  return (
    <button onClick={onClick} style={{ padding:"8px 14px", borderRadius:8, border:`1.5px solid ${active ? "#2563eb" : t.border}`, background: active ? "#1a3a6b" : t.surface, color: active ? "#93c5fd" : t.textMuted, fontSize:13, fontWeight: active ? 700 : 400, cursor:"pointer", transition:"all .15s" }}>
      {children}
    </button>
  );
}

function ModeBtn({ active, onClick, children, sub, theme: t }) {
  return (
    <button onClick={onClick} style={{ width:"100%", padding:"10px 14px", borderRadius:10, border:`1.5px solid ${active ? "#2563eb" : t.border}`, background: active ? "#1a3a6b" : t.surface, color: active ? "#93c5fd" : t.textMuted, fontSize:13, fontWeight: active ? 700 : 400, cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
      {children}
      <div style={{ color: t.textMuted, fontSize:11, fontWeight:400, marginTop:2 }}>{sub}</div>
    </button>
  );
}

// ─── EXAM SCREEN ─────────────────────────────────────────────────────────────
function ExamScreen({ questions: allQuestions, config, onSubmit, darkMode, setDarkMode }) {
  const { timePerQ, negMarking, mode, questionsPerSection, marksPerQuestion } = config;
  const questions = allQuestions.slice(0, questionsPerSection);
  const totalSeconds = questions.length * timePerQ;
  const examStart = useRef(Date.now());

  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState({});
  const [review, setReview]         = useState({});
  const [visited, setVisited]       = useState({ 0: true });
  const [totalTimer, setTotalTimer] = useState(totalSeconds);
  const [qTimer, setQTimer]         = useState(timePerQ);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [paused, setPaused]             = useState(false);
  const [proctorWarning, setProctorWarning] = useState(null);
  const [tabViolations, setTabViolations]   = useState(0);
  const [showExplainer, setShowExplainer]   = useState(false);

  const qTimerRef    = useRef(null);
  const totalTimerRef = useRef(null);
  const currentRef   = useRef(current);
  const pausedRef    = useRef(paused);
  currentRef.current = current;
  pausedRef.current  = paused;

  const t = getTheme(darkMode);
  const logo = getLogo();
  const { score, correct, wrong } = calcScore(answers, questions, negMarking, marksPerQuestion);
  const attempted  = Object.keys(answers).length;
  const progress   = Math.round((attempted / questions.length) * 100);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
    setVisited(v => ({ ...v, [idx]: true }));
    setQTimer(timePerQ);
    setShowExplainer(false);
  }, [timePerQ]);

  const goNext = useCallback(() => {
    if (currentRef.current < questions.length - 1) goTo(currentRef.current + 1);
  }, [goTo, questions.length]);

  const goPrev = useCallback(() => {
    if (currentRef.current > 0) goTo(currentRef.current - 1);
  }, [goTo]);

  // Per-question timer
  useEffect(() => {
    clearInterval(qTimerRef.current);
    setQTimer(timePerQ);
    qTimerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setQTimer(t => { if (t <= 1) { goNext(); return timePerQ; } return t - 1; });
    }, 1000);
    return () => clearInterval(qTimerRef.current);
  }, [current, timePerQ, goNext]);

  // Total timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setTotalTimer(t => {
        if (t <= 1) { clearInterval(totalTimerRef.current); handleSubmit(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(totalTimerRef.current);
  }, []);

  // Anti-cheat: tab/window visibility - ONLY count if NOT paused
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && !pausedRef.current) {
        setPaused(true);
        setTabViolations(v => {
          const newV = v + 1;
          setProctorWarning(`Tab switch detected (Violation #${newV}). This incident has been recorded. Return to the examination window.`);
          return newV;
        });
      }
    };
    const onFocus = () => {};
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = e => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const selectAnswer = (opt) => {
    if (mode === "attempt" && answers[current]) return;
    setAnswers(prev => ({ ...prev, [current]: opt }));
    if (mode === "practice") setShowExplainer(true);
  };

  const toggleReview = () => setReview(prev => ({ ...prev, [current]: !prev[current] }));

  const handleSubmit = (auto = false) => {
    clearInterval(qTimerRef.current);
    clearInterval(totalTimerRef.current);
    if (!auto && !window.confirm("Are you sure you want to submit the examination?")) return;
    const elapsed = Math.round((Date.now() - examStart.current) / 1000);
    onSubmit({ answers, score: calcScore(answers, questions, negMarking, marksPerQuestion).score, correct: calcScore(answers, questions, negMarking, marksPerQuestion).correct, wrong: calcScore(answers, questions, negMarking, marksPerQuestion).wrong, attempted, negMarking, totalTime: elapsed, tabViolations, examDate: new Date().toLocaleString(), marksPerQuestion });
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) { await document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { await document.exitFullscreen(); setIsFullscreen(false); }
  };

  const getStatus = (idx) => {
    if (idx === current) return STATUS.CURRENT;
    const ans = answers[idx];
    if (ans) {
      if (review[idx]) return STATUS.ANSWERED_REVIEW;
      const ok = ans === questions[idx]?.CorrectAnswer;
      return mode === "attempt" ? STATUS.ANSWERED : (ok ? STATUS.ANSWERED : STATUS.WRONG);
    }
    if (review[idx]) return STATUS.REVIEW;
    return STATUS.UNVISITED;
  };

  const q = questions[current];
  const ans = answers[current];
  const qPct = (qTimer / timePerQ) * 100;
  const tPct = (totalTimer / totalSeconds) * 100;
  const urgentQ = qTimer <= 10;
  const urgentT = totalTimer <= 60;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background: t.bg, color: t.text, fontFamily:"'Inter','Segoe UI',sans-serif", position:"relative" }}>

      {/* Proctor warning overlay */}
      {proctorWarning && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#0d1526", border:"2px solid #b91c1c", borderRadius:20, padding:32, maxWidth:480, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
            <h2 style={{ color:"#fca5a5", fontWeight:800, fontSize:20, margin:"0 0 12px" }}>Proctoring Alert</h2>
            <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, margin:"0 0 20px" }}>{proctorWarning}</p>
            <div style={{ color:"#ef4444", fontSize:13, fontWeight:600, marginBottom:20 }}>Total Violations: {tabViolations}</div>
            <button
              onClick={() => { setProctorWarning(null); setPaused(false); }}
              style={{ padding:"12px 28px", background:"#1d4ed8", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}
            >
              Resume Examination
            </button>
          </div>
        </div>
      )}

      {/* Pause overlay */}
      {paused && !proctorWarning && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#0d1526", border:"1px solid #1e2d45", borderRadius:20, padding:32, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>⏸</div>
            <h2 style={{ color:"#e2e8f0", fontWeight:800, fontSize:22, margin:"0 0 8px" }}>Examination Paused</h2>
            <p style={{ color:"#64748b", fontSize:13, margin:"0 0 20px" }}>Timer is paused. Click resume to continue.</p>
            <button onClick={() => setPaused(false)} style={{ padding:"12px 28px", background:"#1d4ed8", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
              ▶ Resume
            </button>
          </div>
        </div>
      )}

      {/* ── SIDEBAR with SCROLLABLE PALETTE ── */}
      <div style={{ width: sidebarOpen ? 256 : 0, minWidth: sidebarOpen ? 256 : 0, overflow:"hidden", background: darkMode ? "#0d1526" : "#1e293b", transition:"all .3s", display:"flex", flexDirection:"column", padding: sidebarOpen ? "16px 14px" : 0, boxSizing:"border-box", borderRight:`1px solid ${t.border}` }}>
        {sidebarOpen && <>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
              {logo ? (
                <img src={logo} alt="Logo" style={{ width:24, height:24, objectFit:"contain", borderRadius:4 }} />
              ) : (
                <span style={{ fontSize:16 }}>⚛</span>
              )}
              <span style={{ color:"#fff", fontWeight:700, fontSize:13 }}>{SITE_NAME}</span>
            </div>

            {/* Stats 2×2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {[
                { v: questions.length, l:"Total",     c:"#3b82f6" },
                { v: attempted,        l:"Attempted",  c:"#f59e0b" },
                { v: correct,          l:"Correct",    c:"#16a34a" },
                { v: wrong,            l:"Incorrect",  c:"#b91c1c" },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ background:c+"18", border:`1px solid ${c}33`, borderRadius:8, padding:"8px", textAlign:"center" }}>
                  <div style={{ color:c, fontWeight:800, fontSize:20 }}>{v}</div>
                  <div style={{ color:"#64748b", fontSize:10 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Score */}
            <div style={{ background:"#0d1e36", border:"1px solid #1e3a5f", borderRadius:10, padding:"10px 14px", textAlign:"center", marginBottom:12 }}>
              <div style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>Current Score</div>
              <div style={{ color: score >= 0 ? "#34d399" : "#f87171", fontWeight:800, fontSize:26 }}>{score >= 0 ? "+" : ""}{score}</div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginBottom:4 }}>
                <span>Completion</span><span style={{ fontWeight:700, color:"#94a3b8" }}>{progress}%</span>
              </div>
              <div style={{ height:5, background:"#1e2d45", borderRadius:99, overflow:"hidden" }}>
                <div style={{ width:progress+"%", height:"100%", background:"linear-gradient(90deg,#2563eb,#7c3aed)", borderRadius:99, transition:"width .5s" }} />
              </div>
            </div>
          </div>

          {/* Palette with SCROLL */}
          <div style={{ fontSize:10, color:"#475569", textTransform:"uppercase", letterSpacing:1, marginBottom:6, fontWeight:600 }}>Question Palette</div>
          <div style={{ 
            display:"grid", 
            gridTemplateColumns:"repeat(5,1fr)", 
            gap:3, 
            overflowY:"auto", 
            maxHeight:"calc(100vh - 420px)", 
            flex:1, 
            alignContent:"start",
            paddingRight:4
          }}>
            {questions.map((_, idx) => {
              const st = getStatus(idx);
              const pal = PAL_COLORS[st];
              return (
                <button key={idx} onClick={() => goTo(idx)}
                  style={{ background: pal.bg, color: pal.text, border:`1px solid ${pal.border}`, borderRadius:6, padding:"6px 2px", fontSize:11, fontWeight:700, cursor:"pointer", transition:"transform .1s", position:"relative" }}
                  onMouseEnter={e => e.currentTarget.style.transform="scale(1.12)"}
                  onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
                >
                  {idx + 1}
                  {review[idx] && <span style={{ position:"absolute", top:-3, right:-3, width:7, height:7, background:"#b45309", borderRadius:"50%", display:"block" }} />}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop:12, borderTop:"1px solid #1e2d45", paddingTop:10 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {[
                { c:"#1e2a3a", b:"#2d3f52", l:"Not Visited" },
                { c:"#1a3a6b", b:"#2563eb", l:"Active" },
                { c:"#134e2e", b:"#16a34a", l:"Answered" },
                { c:"#4c1414", b:"#b91c1c", l:"Incorrect" },
                { c:"#3b2000", b:"#b45309", l:"Marked" },
                { c:"#2e1065", b:"#7c3aed", l:"Ans+Marked" },
              ].map(({ c, b, l }) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:c, border:`1px solid ${b}`, flexShrink:0 }} />
                  <span style={{ color:"#475569", fontSize:9 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </>}
      </div>

      {/* ── MAIN with FIXED QUESTION SECTION ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>

        {/* Top bar */}
        <div style={{ background: t.surface, borderBottom:`1px solid ${t.border}`, padding:"10px 18px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", zIndex:10 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"6px 10px", color: t.textSub, cursor:"pointer", fontSize:14 }}>☰</button>

          <div style={{ flex:1, fontWeight:700, fontSize:13, color: t.accent }}>
            {logo && <img src={logo} alt="" style={{ width:20, height:20, objectFit:"contain", marginRight:6, verticalAlign:"middle" }} />}
            ⚛ {SITE_NAME} &nbsp;<span style={{ color: t.textMuted, fontWeight:400, fontSize:11 }}>|</span>&nbsp; <span style={{ color: t.textMuted, fontWeight:400, fontSize:11 }}>{mode === "practice" ? "Practice Mode" : "Attempt Mode"}</span>
          </div>

          {tabViolations > 0 && (
            <div style={{ background:"#4c1414", border:"1px solid #b91c1c", borderRadius:6, padding:"4px 10px", fontSize:11, color:"#fca5a5", fontWeight:600 }}>
              🔒 {tabViolations} violation{tabViolations > 1 ? "s" : ""}
            </div>
          )}

          {/* Q timer */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color: t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>Question</div>
            <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:18, color: urgentQ ? "#ef4444" : "#f59e0b", transition:"color .5s" }}>{fmtTime(qTimer)}</div>
            <div style={{ width:70, height:2, background: t.border, borderRadius:99, overflow:"hidden", marginTop:2 }}>
              <div style={{ width:qPct+"%", height:"100%", background: urgentQ ? "#ef4444" : "#f59e0b", transition:"width 1s linear" }} />
            </div>
          </div>

          <div style={{ width:1, height:36, background: t.border }} />

          {/* Total timer */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color: t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>Remaining</div>
            <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:18, color: urgentT ? "#ef4444" : "#34d399", transition:"color .5s" }}>{fmtTime(totalTimer)}</div>
            <div style={{ width:80, height:2, background: t.border, borderRadius:99, overflow:"hidden", marginTop:2 }}>
              <div style={{ width:tPct+"%", height:"100%", background: urgentT ? "#ef4444" : "#34d399", transition:"width 1s linear" }} />
            </div>
          </div>

          <div style={{ width:1, height:36, background: t.border }} />

          <button onClick={() => setPaused(p => !p)} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${paused ? "#16a34a" : t.border}`, background: paused ? "#134e2e" : "transparent", color: paused ? "#86efac" : t.textSub, fontSize:12, cursor:"pointer", fontWeight:600 }}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"6px 10px", color: t.textSub, cursor:"pointer", fontSize:13 }}>{darkMode ? "☀" : "🌙"}</button>
          <button onClick={toggleFullscreen} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:7, padding:"6px 10px", color: t.textSub, cursor:"pointer", fontSize:13 }}>{isFullscreen ? "⊠" : "⛶"}</button>
          <button onClick={() => handleSubmit(false)} style={{ padding:"7px 14px", background:"#b91c1c", border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Submit Exam</button>
        </div>

        {/* Question area - SCROLLABLE */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px", maxWidth:860, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>

          {/* Q header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div>
              <span style={{ fontSize:11, color: t.textMuted, textTransform:"uppercase", letterSpacing:1 }}>Question </span>
              <span style={{ fontWeight:800, color: t.text }}>{current + 1}</span>
              <span style={{ color: t.textMuted }}> / {questions.length}</span>
              {q?.Topic && <span style={{ marginLeft:8, padding:"2px 8px", background: darkMode ? "#1a3a6b" : "#eff6ff", color:"#60a5fa", borderRadius:20, fontSize:11, fontWeight:600 }}>{q.Topic}</span>}
            </div>
            <button onClick={toggleReview} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${review[current] ? "#b45309" : t.border}`, background: review[current] ? "#3b2000" : "transparent", color: review[current] ? "#fbbf24" : t.textMuted, fontSize:12, cursor:"pointer", fontWeight:600, transition:"all .15s" }}>
              {review[current] ? "🚩 Marked for Review" : "⚑ Mark for Review"}
            </button>
          </div>

          {/* Question box */}
          <div style={{ background:"linear-gradient(135deg,#1d4ed8 0%,#4f46e5 100%)", borderRadius:16, padding:"22px 26px", color:"#fff", fontSize:17, fontWeight:500, lineHeight:1.75, marginBottom:18, boxShadow:"0 8px 32px rgba(37,99,235,.25)" }}>
            <div style={{ fontSize:10, opacity:.7, textTransform:"uppercase", letterSpacing:1.5, marginBottom:8 }}>Question {current + 1}</div>
            {q?.Question}
          </div>

          {/* Options */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
            {["A","B","C","D"].map(opt => {
              const selected = ans === opt;
              const isCorrect = q?.CorrectAnswer === opt;
              const showFeedback = selected && mode === "practice";

              let bg = t.card;
              let border = t.border;
              let textC = t.text;
              let indicator = null;

              if (showFeedback && isCorrect) { bg = darkMode ? "#134e2e" : "#dcfce7"; border = "#16a34a"; textC = darkMode ? "#86efac" : "#166534"; indicator = "✓"; }
              else if (showFeedback && !isCorrect) { bg = darkMode ? "#4c1414" : "#fee2e2"; border = "#b91c1c"; textC = darkMode ? "#fca5a5" : "#991b1b"; indicator = "✗"; }
              else if (selected) { bg = darkMode ? "#1a3a6b" : "#eff6ff"; border = "#2563eb"; textC = darkMode ? "#93c5fd" : "#1e40af"; indicator = "●"; }

              return (
                <button key={opt} onClick={() => selectAnswer(opt)}
                  style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 18px", background:bg, border:`1.5px solid ${border}`, borderRadius:12, cursor: mode==="attempt" && ans ? "default" : "pointer", textAlign:"left", color:textC, fontSize:14, fontWeight: selected ? 600 : 400, transition:"all .15s", boxShadow: selected ? "0 3px 10px rgba(0,0,0,.15)" : "none" }}
                  onMouseEnter={e => { if (!ans || mode==="practice") e.currentTarget.style.transform="translateX(3px)"; }}
                  onMouseLeave={e => e.currentTarget.style.transform="translateX(0)"}
                >
                  <div style={{ width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background: selected ? (showFeedback && isCorrect ? "#16a34a" : showFeedback ? "#b91c1c" : "#2563eb") : (darkMode ? "#1e2d45" : "#e2e8f0"), color: selected ? "#fff" : t.textMuted, fontWeight:800, fontSize:13, flexShrink:0, transition:"all .15s" }}>{opt}</div>
                  <span style={{ flex:1 }}>{q?.["Option"+opt]}</span>
                  {indicator && <span style={{ fontSize:16, fontWeight:800 }}>{indicator}</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplainer && ans && q?.Explanation && (
            <div style={{ background: darkMode ? "#0f2340" : "#eff6ff", border:`1px solid ${darkMode ? "#1e3a6b" : "#bfdbfe"}`, borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:16 }}>💡</span>
                <span style={{ color:"#60a5fa", fontWeight:700, fontSize:13, textTransform:"uppercase", letterSpacing:.5 }}>Explanation</span>
              </div>
              <p style={{ color: t.textSub, fontSize:14, lineHeight:1.75, margin:0 }}>{q.Explanation}</p>
            </div>
          )}

          {mode === "attempt" && ans && q?.Explanation && (
            <div>
              <button onClick={() => setShowExplainer(e => !e)} style={{ background:"none", border:`1px solid ${t.border}`, borderRadius:8, padding:"7px 14px", color: t.textMuted, fontSize:12, cursor:"pointer", marginBottom:showExplainer ? 8 : 18, fontWeight:600 }}>
                {showExplainer ? "▲ Hide Explanation" : "▼ View Explanation"}
              </button>
              {showExplainer && (
                <div style={{ background: darkMode ? "#0f2340" : "#eff6ff", border:`1px solid ${darkMode ? "#1e3a6b" : "#bfdbfe"}`, borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span>💡</span>
                    <span style={{ color:"#60a5fa", fontWeight:700, fontSize:13 }}>Explanation</span>
                  </div>
                  <p style={{ color: t.textSub, fontSize:14, lineHeight:1.75, margin:0 }}>{q.Explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
            <button onClick={goPrev} disabled={current===0}
              style={{ padding:"10px 20px", background: t.surface, border:`1px solid ${t.border}`, borderRadius:10, color: t.text, fontWeight:600, fontSize:13, cursor: current===0 ? "not-allowed" : "pointer", opacity: current===0 ? .4 : 1, transition:"all .15s" }}>
              ← Previous
            </button>
            <div style={{ fontSize:11, color: t.textMuted, display:"flex", alignItems:"center" }}>← → keyboard navigation</div>
            <button onClick={goNext} disabled={current===questions.length-1}
              style={{ padding:"10px 20px", background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", border:"none", borderRadius:10, color:"#fff", fontWeight:700, fontSize:13, cursor: current===questions.length-1 ? "not-allowed" : "pointer", opacity: current===questions.length-1 ? .4 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RESULT SCREEN ───────────────────────────────────────────────────────────
function ResultScreen({ result, questions: allQuestions, config, onReset }) {
  const { answers, score, correct, wrong, attempted, negMarking, totalTime, tabViolations, examDate, marksPerQuestion } = result;
  const questions = allQuestions.slice(0, config?.questionsPerSection || allQuestions.length);
  const unattempted = questions.length - attempted;
  const maxScore = questions.length * marksPerQuestion;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const pct = maxScore > 0 ? Math.round(Math.max(0, score) / maxScore * 100) : 0;
  const topics = [...new Set(questions.map(q => q.Topic).filter(Boolean))];
  const logo = getLogo();

  const [tab, setTab] = useState("summary");
  const [reviewIdx, setReviewIdx] = useState(0);

  const grade = pct >= 90 ? { label:"Outstanding",  color:"#7c3aed", emoji:"🏅" }
              : pct >= 75 ? { label:"Excellent",     color:"#16a34a", emoji:"🏆" }
              : pct >= 60 ? { label:"Proficient",    color:"#2563eb", emoji:"👍" }
              : pct >= 40 ? { label:"Satisfactory",  color:"#b45309", emoji:"📚" }
              : { label:"Needs Improvement", color:"#b91c1c", emoji:"💪" };

  return (
    <div style={{ minHeight:"100vh", background:"#080d18", color:"#e2e8f0", fontFamily:"'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {logo && <img src={logo} alt="Logo" style={{ width:60, height:60, objectFit:"contain", background:"#fff", borderRadius:12, padding:8 }} />}
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>⚛ {SITE_NAME} — Examination Result</h1>
            <p style={{ opacity:.75, fontSize:13, margin:"4px 0 0" }}>
              {examDate} &nbsp;·&nbsp; Duration: {fmtTime(totalTime || 0)} &nbsp;·&nbsp; {questions.length} Questions &nbsp;·&nbsp; +{marksPerQuestion} marks each
              {tabViolations > 0 && <span style={{ marginLeft:8, background:"rgba(185,28,28,.4)", borderRadius:4, padding:"2px 6px", fontSize:11 }}>⚠ {tabViolations} Proctoring Violation{tabViolations>1?"s":""}</span>}
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => generatePDF(result, questions, marksPerQuestion, logo)} style={{ padding:"9px 18px", background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", borderRadius:9, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            ⬇ Download Report (HTML)
          </button>
          <button onClick={onReset} style={{ padding:"9px 18px", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:9, color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer" }}>
            🔄 New Exam
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px" }}>

        {/* Score hero */}
        <div style={{ background:"#0d1526", border:"1px solid #1e2d45", borderRadius:20, padding:"24px 28px", marginBottom:20, display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ textAlign:"center", minWidth:120 }}>
            <div style={{ fontSize:48 }}>{grade.emoji}</div>
            <div style={{ color: grade.color, fontWeight:800, fontSize:14, marginTop:4 }}>{grade.label}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
              <span style={{ color:"#94a3b8", fontSize:13 }}>Final Score</span>
              <span style={{ color:"#fff", fontWeight:800, fontSize:36 }}>{score} <span style={{ color:"#475569", fontSize:18, fontWeight:400 }}>/ {maxScore}</span></span>
            </div>
            <div style={{ height:10, background:"#1e2d45", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:Math.max(0,pct)+"%", height:"100%", background:`linear-gradient(90deg, ${grade.color}, #7c3aed)`, borderRadius:99, transition:"width 1.5s ease" }} />
            </div>
            <div style={{ textAlign:"right", fontSize:12, color:"#64748b", marginTop:4 }}>{pct}% of maximum marks</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
          {[
            { v: attempted,    l:"Attempted",     c:"#f59e0b", sub:`${unattempted} not attempted` },
            { v: correct,      l:"Correct",        c:"#16a34a", sub:`+${correct*marksPerQuestion} marks` },
            { v: wrong,        l:"Incorrect",      c:"#b91c1c", sub: negMarking!=="none" ? `${(wrong*(NEG_MAP[negMarking]||0)*(marksPerQuestion/4)).toFixed(1)} marks` : "No deduction" },
            { v: unattempted,  l:"Not Attempted",  c:"#64748b", sub:"No marks awarded" },
            { v: accuracy+"%", l:"Accuracy",       c:"#7c3aed", sub:"of attempted" },
          ].map(({ v, l, c, sub }) => (
            <div key={l} style={{ background:"#0d1526", border:`1px solid ${c}22`, borderRadius:14, padding:"14px 12px", textAlign:"center" }}>
              <div style={{ color:c, fontWeight:800, fontSize:22 }}>{v}</div>
              <div style={{ color:"#e2e8f0", fontSize:12, fontWeight:600, marginTop:2 }}>{l}</div>
              <div style={{ color:"#475569", fontSize:10, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, borderBottom:"1px solid #1e2d45", marginBottom:20 }}>
          {[["summary","Summary"],["topic","Topic Analysis"],["review","Review Answers"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding:"10px 18px", background: tab===id ? "#1a3a6b" : "transparent", border:"none", borderBottom: tab===id ? "2px solid #2563eb" : "2px solid transparent", color: tab===id ? "#93c5fd" : "#475569", fontWeight: tab===id ? 700 : 400, fontSize:13, cursor:"pointer", borderRadius:"8px 8px 0 0", transition:"all .15s" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Summary tab */}
        {tab === "summary" && (
          <div>
            <div style={{ background:"#0d1526", borderRadius:14, padding:20, marginBottom:16 }}>
              <h3 style={{ color:"#94a3b8", fontSize:12, textTransform:"uppercase", letterSpacing:1, margin:"0 0 14px" }}>Response Distribution</h3>
              <div style={{ display:"flex", height:16, borderRadius:99, overflow:"hidden", marginBottom:10, gap:2 }}>
                {correct > 0 && <div style={{ flex:correct, background:"#16a34a", borderRadius: wrong===0 && unattempted===0 ? 99 : "0" }} />}
                {wrong > 0 && <div style={{ flex:wrong, background:"#b91c1c" }} />}
                {unattempted > 0 && <div style={{ flex:unattempted, background:"#1e2a3a", borderRadius: correct===0 && wrong===0 ? 99 : "0" }} />}
              </div>
              <div style={{ display:"flex", gap:20, fontSize:13 }}>
                <span><span style={{ color:"#16a34a" }}>■</span> Correct: {correct} ({Math.round(correct/questions.length*100)}%)</span>
                <span><span style={{ color:"#b91c1c" }}>■</span> Incorrect: {wrong} ({Math.round(wrong/questions.length*100)}%)</span>
                <span><span style={{ color:"#334155" }}>■</span> Not Attempted: {unattempted} ({Math.round(unattempted/questions.length*100)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Topic Analysis */}
        {tab === "topic" && (
          <div>
            {topics.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#475569" }}>No topic data found in CSV. Add a <code>Topic</code> column to enable analysis.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {topics.map(topic => {
                  const topicQs = questions.map((q,i) => ({q,i})).filter(({q}) => q.Topic === topic);
                  const tc = topicQs.filter(({q,i}) => answers[i] === q.CorrectAnswer).length;
                  const tw = topicQs.filter(({q,i}) => answers[i] && answers[i] !== q.CorrectAnswer).length;
                  const ta = topicQs.length;
                  const tpct = Math.round(tc/ta*100);
                  return (
                    <div key={topic} style={{ background:"#0d1526", border:"1px solid #1e2d45", borderRadius:14, padding:"14px 18px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ fontWeight:700, color:"#e2e8f0", fontSize:14 }}>{topic}</div>
                        <div style={{ display:"flex", gap:16, fontSize:12 }}>
                          <span style={{ color:"#16a34a" }}>✓ {tc}</span>
                          <span style={{ color:"#b91c1c" }}>✗ {tw}</span>
                          <span style={{ color:"#7c3aed", fontWeight:700 }}>{tpct}%</span>
                        </div>
                      </div>
                      <div style={{ height:5, background:"#1e2d45", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ width:tpct+"%", height:"100%", background: tpct>=75?"#16a34a":tpct>=50?"#2563eb":"#b91c1c", borderRadius:99, transition:"width 1s ease" }} />
                      </div>
                      <div style={{ color:"#475569", fontSize:11, marginTop:4 }}>{ta} questions · {tc} correct · {tw} incorrect</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Review Answers */}
        {tab === "review" && (
          <div>
            <div style={{ display:"flex", gap:4, marginBottom:16, flexWrap:"wrap" }}>
              {questions.map((_, i) => {
                const a = answers[i];
                const ok = a === questions[i].CorrectAnswer;
                let bg = "#1e2a3a"; let bc = "#2d3f52";
                if (a && ok) { bg = "#134e2e"; bc = "#16a34a"; }
                else if (a && !ok) { bg = "#4c1414"; bc = "#b91c1c"; }
                return (
                  <button key={i} onClick={() => setReviewIdx(i)}
                    style={{ width:34, height:34, borderRadius:7, background:bg, border:`1.5px solid ${i===reviewIdx?"#fff":bc}`, color: a ? (ok?"#86efac":"#fca5a5") : "#64748b", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    {i+1}
                  </button>
                );
              })}
            </div>

            <div style={{ background:"#0d1526", border:"1px solid #1e2d45", borderRadius:16, padding:"20px 22px" }}>
              <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>
                Question {reviewIdx+1} of {questions.length}
                {questions[reviewIdx]?.Topic && <span style={{ marginLeft:8, padding:"2px 8px", background:"#1a3a6b", color:"#60a5fa", borderRadius:20, fontSize:10 }}>{questions[reviewIdx].Topic}</span>}
              </div>
              <div style={{ background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", borderRadius:12, padding:"18px 22px", color:"#fff", fontSize:16, fontWeight:500, lineHeight:1.7, marginBottom:14 }}>
                {questions[reviewIdx]?.Question}
              </div>

              {["A","B","C","D"].map(opt => {
                const isCorrect = questions[reviewIdx]?.CorrectAnswer === opt;
                const isSelected = answers[reviewIdx] === opt;
                let bg = "#111827"; let border = "#1e2d45"; let col = "#94a3b8";
                if (isCorrect) { bg="#134e2e"; border="#16a34a"; col="#86efac"; }
                else if (isSelected && !isCorrect) { bg="#4c1414"; border="#b91c1c"; col="#fca5a5"; }
                return (
                  <div key={opt} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:bg, border:`1.5px solid ${border}`, borderRadius:10, marginBottom:8, color:col }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background: isCorrect?"#16a34a":isSelected?"#b91c1c":"#1e2a3a", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff", fontSize:12 }}>{opt}</div>
                    <span style={{ flex:1, fontSize:13 }}>{questions[reviewIdx]?.["Option"+opt]}</span>
                    {isCorrect && <span style={{ fontSize:12, fontWeight:700, color:"#86efac" }}>✓ Correct Answer</span>}
                    {isSelected && !isCorrect && <span style={{ fontSize:12, fontWeight:700, color:"#fca5a5" }}>✗ Your Response</span>}
                  </div>
                );
              })}

              {questions[reviewIdx]?.Explanation && (
                <div style={{ background:"#0f2340", border:"1px solid #1e3a6b", borderRadius:12, padding:"14px 16px", marginTop:12 }}>
                  <div style={{ color:"#60a5fa", fontWeight:700, fontSize:12, marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>💡 Explanation</div>
                  <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.75, margin:0 }}>{questions[reviewIdx].Explanation}</p>
                </div>
              )}

              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <button onClick={() => setReviewIdx(Math.max(0,reviewIdx-1))} disabled={reviewIdx===0}
                  style={{ padding:"9px 18px", background:"#1e2d45", border:"1px solid #2d3f52", borderRadius:9, color:"#e2e8f0", fontWeight:600, fontSize:13, cursor: reviewIdx===0?"not-allowed":"pointer", opacity: reviewIdx===0?.4:1 }}>
                  ← Previous
                </button>
                <button onClick={() => setReviewIdx(Math.min(questions.length-1,reviewIdx+1))} disabled={reviewIdx===questions.length-1}
                  style={{ padding:"9px 18px", background:"linear-gradient(135deg,#1d4ed8,#4f46e5)", border:"none", borderRadius:9, color:"#fff", fontWeight:700, fontSize:13, cursor: reviewIdx===questions.length-1?"not-allowed":"pointer", opacity: reviewIdx===questions.length-1?.4:1 }}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign:"center", padding:"24px", color:"#1e2d45", fontSize:12, borderTop:"1px solid #0d1526" }}>
        {SITE_NAME} &nbsp;·&nbsp; AllExamMockTest.in &nbsp;·&nbsp; Mock Series &nbsp;·&nbsp; {new Date().getFullYear()}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("upload");
  const [questions, setQuestions] = useState([]);
  const [config, setConfig]     = useState(null);
  const [result, setResult]     = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleLoad         = (qs)  => { setQuestions(qs); setScreen("instructions"); };
  const handleQuestionBank = ()    => { setScreen("questionBank"); };
  const handleStart        = (cfg) => { setConfig(cfg);   setScreen("exam"); };
  const handleSubmit       = (res) => { setResult(res);   setScreen("result"); };
  const handleReset        = ()    => { setQuestions([]); setConfig(null); setResult(null); setScreen("upload"); };
  const handleBackFromBank = ()    => { setScreen("upload"); };

  if (screen === "upload")       return <UploadScreen onLoad={handleLoad} onQuestionBank={handleQuestionBank} />;
  if (screen === "questionBank") return <QuestionBankScreen onLoad={handleLoad} onBack={handleBackFromBank} />;
  if (screen === "instructions") return <InstructionScreen questions={questions} onStart={handleStart} darkMode={darkMode} setDarkMode={setDarkMode} />;
  if (screen === "exam")         return <ExamScreen questions={questions} config={config} onSubmit={handleSubmit} darkMode={darkMode} setDarkMode={setDarkMode} />;
  if (screen === "result")       return <ResultScreen result={result} questions={questions} config={config} onReset={handleReset} />;
}
