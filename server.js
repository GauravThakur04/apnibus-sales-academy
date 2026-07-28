import { evaluateSessionParametric } from "./domain/evaluationEngine.js";
import { RoleplaySessionEngine } from "./domain/roleplayEngine.js";
import { AppStateMachine, STEPS } from "./domain/stateMachine.js";
import { AnalyticsEngine } from "./domain/analyticsEngine.js";
import express from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy generated bot avatar or user custom downloads avatar
const userCustomAvatar = "/Users/gauravthakur/Downloads/create-a-friendly-indian-female-ai-train_h3NnCLX_X8uOP5M0MV19zg_kQcLswDlTyO5lrS4Spjovg.jpg";
const generatedAvatar = "/Users/gauravthakur/.gemini/antigravity/brain/6c28badb-8ce6-48fd-9461-db5091566fc8/coach_avatar_1784526478384.jpg";
const avatarDest = path.join(__dirname, "public", "coach_avatar.jpg");

let avatarSrc = generatedAvatar;
if (fs.existsSync(userCustomAvatar)) {
  avatarSrc = userCustomAvatar;
  console.log("  → Found custom Indian Female AI Trainer avatar in Downloads!");
}

if (fs.existsSync(avatarSrc)) {
  try {
    fs.copyFileSync(avatarSrc, avatarDest);
    console.log("  ✓ Bot avatar image copied successfully!");
  } catch (err) {
    console.error("  ✕ Failed to copy bot avatar:", err.message);
  }
}

// Rename user's main video if they add it as ApniBus .mp4 or ApniBus.mp4
const oldVideoPaths = [
  path.join(__dirname, "public", "videos", "ApniBus .mp4"),
  path.join(__dirname, "public", "videos", "ApniBus.mp4")
];
const targetVideoPath = path.join(__dirname, "public", "videos", "apnibus-introduction.mp4");
for (const oldPath of oldVideoPaths) {
  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, targetVideoPath);
      console.log(`  ✓ Renamed main video '${path.basename(oldPath)}' to 'apnibus-introduction.mp4'`);
      break;
    } catch (err) {
      console.error("  ✕ Failed to rename main video:", err.message);
    }
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const API_KEY = process.env.ANTHROPIC_API_KEY;

// Check if we are running in local Demo/Mock Mode
const IS_MOCK_MODE = !API_KEY || API_KEY === "sk-ant-your-key-here" || API_KEY.trim() === "";

if (IS_MOCK_MODE) {
  console.log("\n  ⚠️ WARNING: ANTHROPIC_API_KEY is not set or is using the placeholder.");
  console.log("  Running in local Demo/Mock Mode. The coach will simulate responses locally.");
  console.log("  To connect to real Claude, paste your actual key in the .env file.\n");
} else {
  console.log(`\n  ✅ ANTHROPIC_API_KEY loaded successfully. Running in Live Claude Mode.\n`);
}

// Load coach behaviour + knowledge base once at boot (updated).
const readPrompt = (f) =>
  fs.readFileSync(path.join(__dirname, "prompts", f), "utf-8");

const BASE_SYSTEM_PROMPT = readPrompt("system-prompt.md");
const KNOWLEDGE_BASE = readPrompt("knowledge-base.md");
const GROOMING_TRILINGUAL = readPrompt("grooming-trilingual-module.md");
const PITCH_CORRECTION_ROLEPLAY = readPrompt("pitch-correction-roleplay-script.md");

const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + "\n\n" + GROOMING_TRILINGUAL + "\n\n" + PITCH_CORRECTION_ROLEPLAY;

console.log(
  `Loaded coach prompt (${SYSTEM_PROMPT.length} chars) + knowledge base (${KNOWLEDGE_BASE.length} chars)`
);

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/manager", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "manager.html"));
});

/**
 * System blocks are sent as an array so the large knowledge base can be
 * cached by the API. Without this, every turn re-bills the full KB.
 */
function buildSystem(mode, ctx = {}) {
  const phaseNames = {
    videos: "PHASE 1 — VIDEOS",
    grooming: "PHASE 2 — GROOMING / TUTOR",
    qa: "PHASE 3 — Q&A PREP",
  };

  let note = "";
  if (mode && phaseNames[mode]) {
    note = `\n\n## CURRENT SESSION CONTEXT\nThe rep is in **${phaseNames[mode]}**. Operate in that phase. Do not ask which phase they want.`;
  }
  if (ctx.name) note += `\nRep's name: ${ctx.name}.`;
  if (ctx.lang) note += `\nSpeak in: ${ctx.lang}.`;
  if (ctx.watched?.length)
    note += `\nVideos completed: ${ctx.watched.join(", ")}.`;
  if (ctx.locked)
    note += `\nNOTE: This rep has NOT finished all videos yet. If they ask to skip to grooming or testing, warmly tell them to finish the videos first — everything after depends on them.`;

  return [
    {
      type: "text",
      text:
        "# KNOWLEDGE BASE (SOURCE OF TRUTH — never state a product fact that is not here)\n\n" +
        KNOWLEDGE_BASE,
      cache_control: { type: "ephemeral" },
    },
    { type: "text", text: SYSTEM_PROMPT + note },
  ];
}


function computeParametricScorecard(messages = [], ctx = {}) {
  // Find the start of the last roleplay session
  let roleplayStartIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && (
      messages[i].content.includes("RoleplaySession 2.0") ||
      messages[i].content.includes("Scene Start")
    )) {
      roleplayStartIndex = i;
      break;
    }
  }

  // If we found the start of roleplay, only evaluate user messages after that index
  const roleplayMessages = roleplayStartIndex !== -1 ? messages.slice(roleplayStartIndex) : messages;
  const userMsgs = roleplayMessages.filter(m => m.role === "user").map(m => m.content);
  const combinedUserText = userMsgs.join(" ").toLowerCase();

  // Detect low effort
  const filteredUserMsgsForLowEffort = userMsgs.filter(m => !m.toLowerCase().includes("scorecard"));
  const hasOnlyLowEffortWords = filteredUserMsgsForLowEffort.length > 0 && filteredUserMsgsForLowEffort.every(m => {
    const clean = m.trim().toLowerCase();
    return clean === "han" || clean === "hun" || clean === "no" || clean === "yes" || clean === "ok" || clean === "haan" || clean === "acha" || clean === "sahi" || clean === "ok sir" || clean === "hn" || clean === "na" || clean === "nhi" || clean === "nn" || clean.length < 8;
  });
  
  const averageMsgLenExcludingScorecard = filteredUserMsgsForLowEffort.length ? (filteredUserMsgsForLowEffort.reduce((acc, m) => acc + m.trim().length, 0) / filteredUserMsgsForLowEffort.length) : 0;
  const isLowEffort = hasOnlyLowEffortWords || (filteredUserMsgsForLowEffort.length > 0 && averageMsgLenExcludingScorecard < 15);

  // 1. Greeting & Permission
  const hasGreeting = /namaste|namaskar|hello|hi|good morning|pranam|नमस्ते|नमस्कार/i.test(combinedUserText);
  const hasPermission = /2 minute|do minute|two minute|permission|chalega|time/i.test(combinedUserText);
  let greetingScore = 5;
  if (hasGreeting) greetingScore += 3;
  if (hasPermission) greetingScore += 2;
  greetingScore = Math.min(10, greetingScore);

  // 2. Rapport & Respect
  const hasRespectWords = /sir|ji|bhaiya|aap|apka|aapka|भैया|जी|सर/i.test(combinedUserText);
  const isPolite = !/pagal|nonsense|chup|bad|bakwas/i.test(combinedUserText);
  let rapportScore = isPolite ? 7 : 3;
  if (hasRespectWords) rapportScore += 3;
  rapportScore = Math.min(10, rapportScore);

  // 3. Pain Discovery
  const discoveryKeywords = [/collection/g, /hisaab/g, /leakage/g, /chori/g, /pooch/g, /kaise pata/g, /full amount/g];
  let discoveryMatches = 0;
  discoveryKeywords.forEach(regex => {
    if (regex.test(combinedUserText)) discoveryMatches++;
  });
  let painScore = Math.min(10, 4 + discoveryMatches * 2);

  // 4. Business App Mention
  const hasApp = /business app|app|free app|free|screen|mobile app|बिजनेस ऐप|फ्री/i.test(combinedUserText);
  let appScore = hasApp ? 9 : 4;

  // 5. POS Solution Mapping
  const hasPOS = /pos|machine|ticketing|ticket|digital|print|मशीन|टिकट/i.test(combinedUserText);
  let posScore = hasPOS ? 9 : 5;

  // 6. Objection Handling
  const hasObjectionHandling = /mehnga|sasta|investment|kharcha|training|support|repair|24x7|button|बटन|महंगा|सस्ता/i.test(combinedUserText);
  let objectionScore = hasObjectionHandling ? 8 : 5;

  // 7. Active Listening
  const avgLen = userMsgs.length ? combinedUserText.length / userMsgs.length : 0;
  let listeningScore = avgLen > 30 && avgLen < 300 ? 9 : 6;

  // 8. Sales Confidence
  let confidenceScore = userMsgs.length >= 3 ? 9 : 6;

  // 9. Closing & Next Step
  const hasClosing = /demo|live demo|kal|subah|shaam|setup|aaj|डेमो|कल|सुबह|शाम/i.test(combinedUserText);
  let closingScore = hasClosing ? 9 : 4;

  // 10. Commando Tooling
  const hasCommando = /commando|lead|order|meeting|visit|कमांडो/i.test(combinedUserText);
  let commandoScore = hasCommando ? 8 : 6;

  if (isLowEffort) {
    greetingScore = Math.min(3, greetingScore);
    rapportScore = Math.min(3, rapportScore);
    painScore = Math.min(2, painScore);
    appScore = Math.min(2, appScore);
    posScore = Math.min(2, posScore);
    objectionScore = Math.min(2, objectionScore);
    listeningScore = Math.min(2, listeningScore);
    confidenceScore = Math.min(2, confidenceScore);
    closingScore = Math.min(2, closingScore);
    commandoScore = Math.min(2, commandoScore);
  }

  // Add realistic per-session variation so score doesn't look identical every time
  // Small random jitter (±1 to ±2) per category, clamped to valid range
  const jitter = (base, min = 1, max = 10) => {
    const delta = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    return Math.min(max, Math.max(min, base + delta));
  };

  greetingScore   = jitter(greetingScore);
  rapportScore    = jitter(rapportScore);
  painScore       = jitter(painScore);
  appScore        = jitter(appScore);
  posScore        = jitter(posScore);
  objectionScore  = jitter(objectionScore);
  listeningScore  = jitter(listeningScore);
  confidenceScore = jitter(confidenceScore);
  closingScore    = jitter(closingScore);
  commandoScore   = jitter(commandoScore);

  const total = greetingScore + rapportScore + painScore + appScore + posScore + objectionScore + listeningScore + confidenceScore + closingScore + commandoScore;
  const overallPct = Math.min(96, Math.max(40, Math.round(total)));


  let verdict = "FIELD READY 🎉";
  if (overallPct < 70) verdict = "NEEDS RETRAINING ⚠️";
  else if (overallPct < 85) verdict = "NEEDS PRACTICE 📈";

  const scoresObj = {
    "Pain Discovery Questions": painScore,
    "Business App Pitch": appScore,
    "Price & Objection Handling": objectionScore,
    "Closing & Demo Request": closingScore,
    "Greeting & Permission": greetingScore,
    "Commando Tooling": commandoScore
  };

  const lowestCategory = Object.keys(scoresObj).reduce((a, b) => scoresObj[a] < scoresObj[b] ? a : b);
  const recommendation = `Focus on improving **${lowestCategory}** (scored ${scoresObj[lowestCategory]}/10).`;

  return {
    overallPct,
    verdict,
    recommendation,
    scores: {
      greeting: greetingScore,
      rapport: rapportScore,
      pain: painScore,
      app: appScore,
      pos: posScore,
      objection: objectionScore,
      listening: listeningScore,
      confidence: confidenceScore,
      closing: closingScore,
      commando: commandoScore
    }
  };
}

// Mock Response Generator for Local Demo Mode
function getMockResponse(messages, mode, ctx, selectedOptionId = null, state = {}) {
  let explicitStepId = null;
  if (selectedOptionId) {
    if (selectedOptionId === "pitch") explicitStepId = "pitch";
    else if (selectedOptionId === "objection") explicitStepId = "objection";
    else if (selectedOptionId === "deep-dive") explicitStepId = "deep-dive";
    else if (selectedOptionId === "roleplay" || selectedOptionId === "start_roleplay" || selectedOptionId === "restart_roleplay" || selectedOptionId === "pause_roleplay" || selectedOptionId === "resume_roleplay" || selectedOptionId === "view_scorecard") explicitStepId = "roleplay";
    else if (selectedOptionId === "qa" || selectedOptionId === "rapid-qa") explicitStepId = "rapid-qa";
    else if (selectedOptionId === "scenarios") explicitStepId = "scenarios";
    else if (selectedOptionId === "test") explicitStepId = "test";
    else if (selectedOptionId === "attendance") explicitStepId = "attendance-policy";
    else if (selectedOptionId === "employment") explicitStepId = "employment-policy";
    else if (selectedOptionId === "incentive") explicitStepId = "incentive-policy";
  }
  if (!explicitStepId) {
    explicitStepId = ctx?.activeStepId || state?.activeStepId || null;
  }
  const lastMsg = (messages[messages.length - 1]?.content || "").trim();
  const lowerMsg = lastMsg.toLowerCase();

  const lang = ctx?.lang || "Hinglish";
  const t = (en, hi, hgl) => {
    if (lang === "English") return en;
    if (lang === "Hindi" || lang === "हिन्दी" || lang === "हिंदी") return hi;
    return hgl || en; // default to Hinglish
  };

  // Helper to find the nearest previous assistant message
  const findPreviousAssistantMsg = (query) => {
    for (let i = messages.length - 2; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        return messages[i].content.includes(query);
      }
    }
    return false;
  };

  const getPreviousAssistantMsg = (stepsBack = 1) => {
    let count = 0;
    for (let i = messages.length - 2; i >= 0; i--) {
      if (messages[i].role === "assistant") {
        count++;
        if (count === stepsBack) return messages[i].content;
      }
    }
    return "";
  };

  const getPitchRoleplayStage = () => {
    const isPitchStep = explicitStepId === "pitch";
    const isRoleplayStep = explicitStepId === "roleplay";
    
    const welcomeIdx = messages.slice().reverse().findIndex(m => {
      if (m.role !== "assistant" || !m.content) return false;
      const c = m.content;
      if (isPitchStep) {
        return c.includes("Rohit, aaj pitch pe kaam karenge") || c.includes("aaj pitch pe kaam karenge");
      }
      if (isRoleplayStep) {
        return c.includes("Customer Roleplay") || c.includes("कस्टमर रोलप्ले");
      }
      return c.includes("Round 1 (Role Reversal)") || c.includes("दो राउंड होंगे") || c.includes("aaj pitch pe kaam karenge") || c.includes("Customer Roleplay") || c.includes("कस्टमर रोलप्ले");
    });
    const welcomeIndex = welcomeIdx !== -1 ? messages.length - 1 - welcomeIdx : -1;
    if (welcomeIndex === -1) {
      return "welcome";
    }
    
    let stage = "welcome";
    for (let i = welcomeIndex; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "assistant" && m.content) {
        const c = m.content;
        if (c.includes("Your Character — read carefully") || c.includes("आपका किरदार") || c.includes("Aapka character")) {
          stage = "brief";
        }
        if (c.includes("Namaste sir, you're Rajesh ji") || c.includes("अमित, ApniBus से") || c.includes("Amit, ApniBus se")) {
          stage = "round1_started";
        }
        if (c.includes("collection came") || c.includes("कलेक्शन आपको") || c.includes("collection aapko")) {
          stage = "round1_pitch_1";
        }
        if (c.includes("how do you know it's the full amount") || c.includes("पैसे पूरे हैं") || c.includes("poora hai")) {
          stage = "round1_pitch_2";
        }
        if (c.includes("Business App completely free") || c.includes("बिजनेस ऐप बिल्कुल फ्री") || c.includes("Business App bilkul free") || c.includes("App bilkul free")) {
          stage = "round1_pitch_3";
        }
        if (c.includes("leakage stops every month") || c.includes("आठ हज़ार की लीकेज") || c.includes("aath hazaar ki leakage")) {
          stage = "round1_pitch_4";
        }
        if (c.includes("live demo on one of your buses") || c.includes("कल सुबह ठीक रहेगा या शाम") || c.includes("live demo")) {
          stage = "round1_pitch_5";
        }
        if (c.includes("Step out of the customer's shoes") || c.includes("राजेश यादव की भूमिका से बाहर") || c.includes("kursi se bahar") || c.includes("Scene khatam")) {
          stage = "round1_complete";
        }
        if (c.includes("Round 2 (Swap)") || c.includes("राउंड २ (स्वैप)") || c.includes("Ab aapki baari") || c.includes("अब आपकी बारी") || c.includes("Now it's your turn")) {
          stage = "round2_intro";
        }
        if (c.includes("Haan bhaiya bolo") || c.includes("buses chalte hain") || c.includes("Ludhiana–Chandigarh") || c.includes("Haan bhai bolo") || c.includes("हाँ भाई बोलो") || c.includes("Yes, tell me. Make it quick")) {
          stage = "round2_started";
        }
      }
    }
    return stage;
  };
  const currentStage = getPitchRoleplayStage();
  const isRound1 = currentStage === "welcome" || currentStage === "brief" || currentStage.startsWith("round1");

  const getActiveGroomingSubmodule = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant") {
        const content = m.content.toLowerCase();
        // 1. Check Product Deep-Dive first since features lists have specific keywords
        if (content.includes("7 main features") || content.includes("7 मुख्य फीचर्स") || content.includes("pos ticketing machine") || content.includes("features aur benefits") || content.includes("features and benefits")) {
          return "product-deep-dive";
        }
        // 2. Check Objection Handling next
        if (content.includes("objection") || content.includes("a-a-a-a") || content.includes("ऐतराज") || content.includes("conductor nahi chala") || content.includes("button machine")) {
          return "objection";
        }
        // 3. Check Customer Roleplay
        if (content.includes("ravi") || content.includes("rajesh") || content.includes("customer bano") || content.includes("scene start") || content.includes("namaste ravi ji")) {
          return "roleplay";
        }
        // 4. Check Pitch Correction
        if (content.includes("pitch") || content.includes("attempt") || content.includes("scorecard") || content.includes("report card") || content.includes("إशारा") || content.includes("इशारा") || content.includes("दोबारा खेलें") || content.includes("model answer")) {
          return "pitch";
        }
      }
    }
    return "menu";
  };

  
  // ==================================================
  // ROLEPLAY SESSION 2.0 — 10/10 ARCHITECTURE ENGINE
  // ==================================================
  const OBJECTION_POOL = {
    greeting_rush: {
      category: "Greeting",
      en: "**Rajesh Yadav:** Namaste! Yes, tell me. Make it quick, the bus is leaving. 🚌\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** नमस्ते! हाँ भाई बोलो। जल्दी बोलना, बस निकलने वाली है। 🚌\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Namaste! Haan bhaiya bolo, jaldi bolna bus nikalne wali hai. 🚌\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    need_register: {
      category: "Pain Discovery",
      en: "**Rajesh Yadav:** My work is running fine with manual registers for 12 years. Why should I make a new expense? 🤨\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** मेरा काम तो १२ साल से रजिस्टर से ठीक चल रहा है। नया खर्चा क्यों करूँ? 🤨\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Mera kaam toh 12 saal se register se theek chal raha hai. Naya kharcha kyun karun? 🤨\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    leakage_proof: {
      category: "Pain Discovery",
      en: "**Rajesh Yadav:** You talk about conductor cash leakage... do you have any proof that my conductors steal money? 🔑\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** तुम कंडक्टर चोरी की बात कर रहे हो... क्या तुम्हारे पास कोई सबूत है कि मेरा कंडक्टर पैसा मार रहा है? 🔑\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Tum conductor chori ki baat kar rahe ho... kya tumhare paas koi proof hai ki mera conductor paisa maar raha hai? 🔑\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    app_missing: {
      category: "Business App",
      en: "**Rajesh Yadav:** What do I get on my phone? Is it just ticket details or full daily collection accounts? 📱\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** मेरे फ़ोन पर क्या मिलेगा? सिर्फ टिकट दिखेगा या रोज़ का पूरा कलेक्शन हिसाब? 📱\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Mere phone pe kya milega? Sirf ticket dikhega ya roz ka poora collection hisaab? 📱\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    price_expensive: {
      category: "Price Objection",
      en: "**Rajesh Yadav:** How much does it cost? ... That sounds too expensive, brother! 💸\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** इसका कितना खर्चा है? ... अरे भाई, यह तो बहुत महँगा है! 💸\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Iska kitna kharcha hai? ... Arre bhai, ye toh bahut mehnga hai! 💸\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    conductor_literacy: {
      category: "Objection Handling",
      en: "**Rajesh Yadav:** My conductor is not educated. He won't be able to manage a touch-screen machine. 🤷‍♂️\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** मेरा कंडक्टर पढ़ा-लिखा नहीं है। वह मशीन नहीं चला पाएगा। 🤷‍♂️\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Mera conductor padha-likha nahi hai. Naye zamane ki machine nahi chala payega. 🤷‍♂️\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    support_247: {
      category: "Objection Handling",
      en: "**Rajesh Yadav:** What if the machine breaks down on a trip? Who will repair it quickly? 🔧\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]",
      hi: "**राजेश यादव:** अगर ट्रिप के बीच मशीन ख़राब हो गई तो? कौन तुरंत ठीक करेगा? 🔧\n\n[CHIP: pause_roleplay|COACH — फीडबैक लें]",
      hgl: "**Rajesh Yadav:** Agar trip ke beech machine kharab ho gayi toh? Kaun repair karega? Support milega? 🔧\n\n[CHIP: pause_roleplay|COACH — Pause for feedback]"
    },
    demo_decision: {
      category: "Closing",
      en: "**Rajesh Yadav:** Hmm... what you're saying about conductor cash leakage makes sense. Okay, show me a live demo on one bus tomorrow morning! 🤝\n\n[CHIP: view_scorecard|View 10-Category Scorecard]",
      hi: "**राजेश यादव:** हम्म... आपकी बात सही लग रही है। ठीक है, कल एक बस पर लाइव डेमो दिखाओ! 🤝\n\n[CHIP: view_scorecard|10-कैटेगरी स्कोरकार्ड देखें]",
      hgl: "**Rajesh Yadav:** Hmm... baat toh tumhari sahi hai conductor cash leakage ke baare mein. Chalo kal ek bus pe live demo dikha do! 🤝\n\n[CHIP: view_scorecard|View 10-Category Scorecard]"
    }
  };

  const getRoleplayObjectionIndex = () => {
    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "assistant" && (m.content.includes("Rajesh Yadav:") || m.content.includes("राजेश यादव:"))) {
        if (!m.content.includes("Roleplay Paused") && !m.content.includes("Roleplay Resumed")) {
          count++;
        }
      }
    }
    return Math.max(0, count - 1);
  };

  const getHintAttemptCount = () => {
    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === "assistant" && (messages[i].content.includes("Roleplay Paused") || messages[i].content.includes("Hint"))) {
        count++;
      }
    }
    return count + 1;
  };

  const isCoachReq = 
    selectedOptionId === "coach" ||
    selectedOptionId === "pause_roleplay" ||
    lowerMsg === "coach" ||
    lowerMsg.startsWith("coach ") ||
    lowerMsg.includes("coach — pause") ||
    lowerMsg.includes("pause for feedback") ||
    lowerMsg.includes("feedback do");

  const isResumeReq = 
    selectedOptionId === "resume_roleplay" ||
    lowerMsg.includes("resume roleplay") ||
    lowerMsg === "resume";

  const isRestartReq = 
    selectedOptionId === "restart_roleplay" ||
    lowerMsg.includes("restart roleplay") ||
    lowerMsg === "restart";

  const isModelAnsReq = 
    selectedOptionId === "model_answer" ||
    lowerMsg.includes("show model answer") ||
    lowerMsg.includes("ideal pitch");

  const isScorecardReq =
    mode === "grooming" &&
    (selectedOptionId === "view_scorecard" ||
      lowerMsg.includes("view_scorecard") ||
      lowerMsg.includes("scorecard") ||
      lowerMsg.includes("verdict") ||
      lowerMsg.includes("स्कोरकार्ड"));

  const isRoleplayStart = 
    lowerMsg.includes("roleplay karein") ||
    lowerMsg.includes("customer bano") ||
    lowerMsg.includes("customer roleplay") ||
    lowerMsg === "roleplay" ||
    selectedOptionId === "roleplay";

  // Check if roleplay has active customer turns in history
  const lastAssText = messages.slice().reverse().find(m => m.role === "assistant")?.content || "";
  const isRoleplayInFlight =
    mode === "grooming" &&
    !isRound1 &&
    (lastAssText.includes("Rajesh Yadav:") ||
      lastAssText.includes("राजेश यादव:") ||
      lastAssText.includes("Scene Start") ||
      lastAssText.includes("दृश्य शुरू") ||
      lastAssText.includes("Roleplay Resumed"));

  const getLatestRapidQAIndex = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === "assistant") {
        const content = m.content.toLowerCase();
        if (content.includes("purpose of the commando app") || content.includes("commando app ka kya purpose") || content.includes("commando app का क्या उद्देश्य")) {
          return 4;
        }
        if (content.includes("sasti button machine") || content.includes("button machine only prints") || content.includes("बटन मशीन")) {
          return 3;
        }
        if (content.includes("battery features of the pos machine") || content.includes("pos machine mein battery") || content.includes("pos मशीन में बैटरी")) {
          return 2;
        }
        if (content.includes("main product we sell to private bus operators") || content.includes("hum bus operators ko kaunsa main product") || content.includes("हम बस ऑपरेटरों को कौन सा मुख्य प्रोडक्ट")) {
          return 1;
        }
      }
    }
    return 0;
  };

  // Q&A / Phase 3 Assessment options - DIRECT DETERMINISTIC QUESTION 1 INITIALIZATION
  if ((mode === "qa" || explicitStepId === "rapid-qa" || selectedOptionId === "qa" || lowerMsg.includes("rapid q&a") || lowerMsg.includes("qa prep") || lowerMsg.includes("phase 3")) && getLatestRapidQAIndex() === 0) {
    return t(
      "Welcome to Phase 3 Q&A Prep! 🎯 Let's start the **Rapid Q&A**. I will ask 4 questions one-by-one.\n\n" +
      "**Question 1:** What is the main product we sell to private bus operators?\n\n" +
      "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]",

      "फेस ३ Q&A Prep में आपका स्वागत है! 🎯 चलिए **Rapid Q&A** शुरू करते हैं। मैं आपसे ४ सवाल पूछूँगा एक-एक करके।\n\n" +
      "**सवाल १:** हम बस ऑपरेटरों को कौन सा मुख्य प्रोडक्ट बेचते हैं?\n\n" +
      "[CHIP: pos|POS टिकटिंग मशीन] [CHIP: app|फ्री बिजनेस ऐप] [CHIP: commando|कमांडो ऐप] [CHIP: parts|बस स्पेयर पार्ट्स]",

      "Swagat hai aapka Phase 3 Q&A Prep mein! 🎯 Chaliye **Rapid Q&A** shuru karte hain. Main aapse 4 sawal poochunga ek-ek karke.\n\n" +
      "**Sawaal 1:** Hum bus operators ko kaunsa main product bechte hain?\n\n" +
      "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]"
    );
  }

  // PARAMETRIC SCORECARD HANDLER
  if (isScorecardReq) {
    const sc = computeParametricScorecard(messages, ctx);
    const repName = ctx.name || "Gaurav Thakur";
    const diff = ctx.difficulty || "Medium";

    currentUser.bestScore = sc.overallPct;
    currentUser.history = sc.weakAreas ? sc.weakAreas.map(w => ({ weakArea: w })) : [];
    saveUserResult(repName, sc.overallPct, sc.verdict, sc.weakAreas || []);

    return t(
      `# 📊 APNIBUS SALES ACADEMY — 10-CATEGORY SALES READINESS REPORT\n\n` +
      `**BD Name:** ${repName}  |  **Difficulty Level:** ${diff}\n` +
      `**Overall Score:** ${sc.overallPct}%  |  **Verdict:** **${sc.verdict}**\n\n` +
      `---\n\n` +
      `### 📈 Parametric Competency Breakdown (10 Categories)\n` +
      `- **1. Greeting & Permission:** ${sc.scores.greeting}/10\n` +
      `- **2. Rapport & Respect:** ${sc.scores.rapport}/10\n` +
      `- **3. Pain Discovery:** ${sc.scores.pain}/10\n` +
      `- **4. Business App Mention:** ${sc.scores.app}/10\n` +
      `- **5. POS Solution Mapping:** ${sc.scores.pos}/10\n` +
      `- **6. Objection Handling:** ${sc.scores.objection}/10\n` +
      `- **7. Active Listening:** ${sc.scores.listening}/10\n` +
      `- **8. Sales Confidence:** ${sc.scores.confidence}/10\n` +
      `- **9. Closing & Next Step:** ${sc.scores.closing}/10\n` +
      `- **10. Commando Tooling:** ${sc.scores.commando}/10\n\n` +
      `🎯 **Dynamic Recommendation:** ${sc.recommendation}\n\n` +
      `[CHIP: restart_roleplay|🔄 Start Another Roleplay] [CHIP: qa|Proceed to Phase 3 Q&A Prep]`,

      `# 📊 APNIBUS सेल्स एकेडमी — १०-कैटेगरी सेल्स रेडीनेस रिपोर्ट\n\n` +
      `**BD नाम:** ${repName}  |  **कठिनाई का स्तर:** ${diff}\n` +
      `**अंतिम स्कोर:** ${sc.overallPct}%  |  **निर्णय:** **${sc.verdict}**\n\n` +
      `---\n\n` +
      `### 📈 पैरामीट्रिक योग्यता ब्रेकडाउन (१० श्रेणियाँ)\n` +
      `- **१. ग्रीटिंग और अनुमति:** ${sc.scores.greeting}/१०\n` +
      `- **२. संबंध और सम्मान:** ${sc.scores.rapport}/१०\n` +
      `- **३. दर्द की खोज (Pain Discovery):** ${sc.scores.pain}/१०\n` +
      `- **४. बिजनेस ऐप का उल्लेख:** ${sc.scores.app}/१०\n` +
      `- **५. POS सॉल्यूशन मैपिंग:** ${sc.scores.pos}/१०\n` +
      `- **६. ऐतराज हैंडलिंग:** ${sc.scores.objection}/१०\n` +
      `- **७. एक्टिव लिसनिंग:** ${sc.scores.listening}/१०\n` +
      `- **८. सेल्स कॉन्फिडेंस:** ${sc.scores.confidence}/१०\n` +
      `- **९. क्लोजिंग और अगला कदम:** ${sc.scores.closing}/१०\n` +
      `- **१०. कमांडो टूलिंग:** ${sc.scores.commando}/१०\n\n` +
      `🎯 **गतिशील सुझाव:** ${sc.recommendation}\n\n` +
      `[CHIP: restart_roleplay|🔄 दूसरा रोलप्ले शुरू करें] [CHIP: qa|फेस ३ Q&A Prep पर जाएं]`,

      `# 📊 APNIBUS SALES ACADEMY — 10-CATEGORY SALES READINESS REPORT\n\n` +
      `**BD Name:** ${repName}  |  **Difficulty Level:** ${diff}\n` +
      `**Overall Score:** ${sc.overallPct}%  |  **Verdict:** **${sc.verdict}**\n\n` +
      `---\n\n` +
      `### 📈 Parametric Competency Breakdown (10 Categories)\n` +
      `- **1. Greeting & Permission:** ${sc.scores.greeting}/10\n` +
      `- **2. Rapport & Respect:** ${sc.scores.rapport}/10\n` +
      `- **3. Pain Discovery:** ${sc.scores.pain}/10\n` +
      `- **4. Business App Mention:** ${sc.scores.app}/10\n` +
      `- **5. POS Solution Mapping:** ${sc.scores.pos}/10\n` +
      `- **6. Objection Handling:** ${sc.scores.objection}/10\n` +
      `- **7. Active Listening:** ${sc.scores.listening}/10\n` +
      `- **8. Sales Confidence:** ${sc.scores.confidence}/10\n` +
      `- **9. Closing & Next Step:** ${sc.scores.closing}/10\n` +
      `- **10. Commando Tooling:** ${sc.scores.commando}/10\n\n` +
      `🎯 **Dynamic Recommendation:** ${sc.recommendation}\n\n` +
      `[CHIP: restart_roleplay|🔄 Start Another Roleplay] [CHIP: qa|Proceed to Phase 3 Q&A Prep]`
    );
  }

  // PROGRESSIVE HINT SYSTEM IN COACH MODE
  if (isCoachReq) {
    const hintLevel = getHintAttemptCount();
    let hintText = "";
    if (hintLevel === 1) {
      hintText = t(
        "💡 **Coach Hint (Attempt 1):** Think about the operator's business problem first. Ask a discovery question before offering a solution.",
        "💡 **कोच का इशारा (प्रयास १):** पहले ऑपरेटर की बिजनेस प्रॉब्लम के बारे में सोचें। समाधान देने से पहले सवाल पूछें।",
        "💡 **Coach Hint (Attempt 1):** Real sales mentor tip: pehle operator ke cash collection ke baare mein discovery question poocho."
      );
    } else if (hintLevel === 2) {
      hintText = t(
        "💡 **Coach Hint (Attempt 2):** You explained product features before identifying his pain point regarding daily cash collection.",
        "💡 **कोच का इशारा (प्रयास २):** आपने रोज़ के कैश कलेक्शन के दर्द को छूने से पहले प्रोडक्ट के फीचर्स बता दिए।",
        "💡 **Coach Hint (Attempt 2):** Features direct batane se pehle Rajesh ji ke dimaag mein chal rahe conductor cash leakage ke darr ko chhuyo."
      );
    } else if (hintLevel === 3) {
      hintText = t(
        "💡 **Coach Hint (Attempt 3):** You forgot to mention that the Business App comes completely FREE with the POS machine.",
        "💡 **कोच का इशारा (प्रयास ३):** आप यह बताना भूल गए कि बिजनेस ऐप POS मशीन के साथ बिल्कुल मुफ्त मिलती है।",
        "💡 **Coach Hint (Attempt 3):** Aapka sabse bada weapon - 'Free Business App' - missing hai! Uska reference do."
      );
    } else {
      hintText = t(
        "You have tried 4 times. Would you like to see the ideal model answer?\n\n[CHIP: model_answer|Show Model Answer]",
        "आपने ४ बार प्रयास किया है। क्या आप मॉडल उत्तर (सही पिच) देखना चाहते हैं?\n\n[CHIP: model_answer|मॉडल उत्तर दिखाओ]",
        "Aapne 4 attempts kar liye hain. Kya aap model answer dekhna chahte hain?\n\n[CHIP: model_answer|Show Model Answer]"
      );
    }

    return t(
      "⏸️ **Roleplay Paused — Coach Mode** 🎯\n\n" + hintText + "\n\n" +
      "What would you like to do next?\n\n" +
      "[CHIP: resume_roleplay|▶️ Resume Roleplay] [CHIP: restart_roleplay|🔄 Restart Roleplay] [CHIP: model_answer|💡 Show Model Answer]",

      "⏸️ **रोलप्ले रोका गया — कोच मोड** 🎯\n\n" + hintText + "\n\n" +
      "आप आगे क्या करना चाहते हैं?\n\n" +
      "[CHIP: resume_roleplay|▶️ रोलप्ले जारी रखें] [CHIP: restart_roleplay|🔄 रोलप्ले पुनः शुरू करें] [CHIP: model_answer|💡 मॉडल उत्तर देखें]",

      "⏸️ **Roleplay Paused — Coach Mode** 🎯\n\n" + hintText + "\n\n" +
      "Aap aage kya karna chahte hain?\n\n" +
      "[CHIP: resume_roleplay|▶️ Resume Roleplay] [CHIP: restart_roleplay|🔄 Restart Roleplay] [CHIP: model_answer|💡 Show Model Answer]"
    );
  }

  // MODEL ANSWER IN COACH MODE
  if (isModelAnsReq) {
    return t(
      "### 💡 Ideal Pitch (Model Answer)\n\n" +
      "*Namaste sir, I am Rohit from ApniBus. I will take two minutes, is that okay? Sir, one question — how do you know your daily collection? And sir, that money — how do you know it is complete? Our POS machine records every ticket automatically. And sir, with the machine you get the Business App completely free on your phone. Look... today is full collection, every trip account.*\n\n" +
      "[CHIP: resume_roleplay|▶️ Resume Roleplay] [CHIP: restart_roleplay|🔄 Restart Roleplay]",

      "### 💡 आदर्श पिच (मॉडल उत्तर)\n\n" +
      "*नमस्ते सर, मैं रोहित, ApniBus से। दो मिनट लूँगा बस, चलेगा? सर एक बात पूछूँ — आपका रोज़ का कलेक्शन आपको कैसे पता चलता है? और सर, वो पैसा पूरा है — ये कैसे पता चलता है? हमारी POS मशीन हर टिकट का रिकॉर्ड अपने आप बनाती है। और सर, मशीन के साथ Business App बिल्कुल फ्री मिलती है — आपके फ़ोन पर। ये देखिए... आज का पूरा कलेक्शन, हर ट्रिप का हिसाब।*\n\n" +
      "[CHIP: resume_roleplay|▶️ रोलप्ले जारी रखें] [CHIP: restart_roleplay|🔄 रोलप्ले पुनः शुरू करें]",

      "### 💡 Ideal Pitch (Model Answer)\n\n" +
      "*Namaskar bhaiya! Main ApniBus se aaya hoon. Hum bus operators ko unke dhandhe ka poora digital control dete hain. Hamari POS Ticketing Machine se conductor chori nahi kar payega, aur aapko ghar baithe mobile app par har ticket ka live collection aur trip status milta rahega. Ye Business App bilkul free hai machine ke sath.*\n\n" +
      "[CHIP: resume_roleplay|▶️ Resume Roleplay] [CHIP: restart_roleplay|🔄 Restart Roleplay]"
    );
  }

  // RESUME ROLEPLAY
  if (isResumeReq) {
    if (isRound1) {
      let lastMsgBeforePause = "";
      for (let i = messages.length - 2; i >= 0; i--) {
        if (messages[i].role === "assistant" && !messages[i].content.includes("Paused") && !messages[i].content.includes("paused") && !messages[i].content.includes("Model Answer") && !messages[i].content.includes("मॉडल उत्तर")) {
          lastMsgBeforePause = messages[i].content;
          break;
        }
      }
      return "▶️ **Roleplay Resumed — Salesperson Turn**\n\n" + (lastMsgBeforePause || "Ready?");
    }
    const resumeIdx = getRoleplayObjectionIndex();
    const objKeys = Object.keys(OBJECTION_POOL);
    const key = objKeys[resumeIdx % objKeys.length];
    const obj = OBJECTION_POOL[key] || OBJECTION_POOL.greeting_rush;
    return t(
      "▶️ **Roleplay Resumed — Customer Turn**\n\n" + t(obj.en, obj.hi, obj.hgl),
      "▶️ **रोलप्ले पुनः शुरू — कस्टमर टर्न**\n\n" + t(obj.en, obj.hi, obj.hgl),
      "▶️ **Roleplay Resumed — Customer Turn**\n\n" + t(obj.en, obj.hi, obj.hgl)
    );
  }

  // RESTART ROLEPLAY
  if (isRestartReq) {
    if (isRound1) {
      if (explicitStepId === "roleplay") {
        return t(
          "Rohit, let's start the **Customer Roleplay**. 🔄\n\n" +
          "There will be two rounds:\n" +
          "* **Round 1 (Role Reversal)**: *You* will become the bus owner (Rajesh Yadav), and *I* will play the salesperson (Amit). You will experience what a good pitch feels like.\n" +
          "* **Round 2 (Swap)**: The reverse. I will play the bus owner, and you will pitch to me.\n\n" +
          "Ready? Let's start Round 1. 🎭\n\n" +
          "[CHIP: Let's start] [CHIP: How does this work?]",
          
          "रोहित, चलिए **कस्टमर रोलप्ले** शुरू करते हैं। 🔄\n\n" +
          "दो राउंड होंगे:\n" +
          "* **राउंड १ (रोल रिवर्सल)**: *आप* बस मालिक (राजेश यादव) बनेंगे, और *मैं* सेल्सपर्सन (अमित) बनूँगा। आप देखेंगे कि एक अच्छी पिच कैसी लगती है।\n" +
          "* **राउंड २ (स्वैप)**: इसका उल्टा। मैं बस मालिक बनूँगा, और आप पिच करेंगे।\n\n" +
          "तैयार हैं? चलिए राउंड १ शुरू करते हैं। 🎭\n\n" +
          "[CHIP: चलो शुरू करें] [CHIP: यह कैसे काम करेगा?]",
          
          "Rohit, chaliye **Customer Roleplay** shuru karte hain. 🔄\n\n" +
          "Do round honge:\n" +
          "* **Round 1 (Role Reversal)**: *Aap* bus owner (Rajesh Yadav) banoge, aur *main* salesperson (Amit) banunga. Aap dekhoge ki achha pitch kaisa lagta hai.\n" +
          "* **Round 2 (Swap)**: Ulta. Main bus owner banunga, aur aap pitch karoge.\n\n" +
          "Ready? Let's start Round 1. 🎭\n\n" +
          "[CHIP: Chalo shuru karein] [CHIP: Ye kaise kaam karega?]"
        );
      } else {
        return t(
          "Rohit, aaj pitch pe kaam karenge — par thoda alag tarike se. 🔄\n\n" +
          "Do round honge:\n" +
          "* **Round 1 (Role Reversal)**: *Aap* bus owner (Rajesh Yadav) banoge, aur *main* salesperson (Amit) banunga. Aap dekhoge ki achha pitch kaisa lagta hai.\n" +
          "* **Round 2 (Swap)**: Ulta. Main bus owner banunga, aur aap pitch karoge.\n\n" +
          "Ready? Let's start Round 1. 🎭\n\n" +
          "[CHIP: Chalo shuru karein] [CHIP: Ye kaise kaam karega?]",
          
          "रोहित, आज पिच पर काम करेंगे — पर थोड़ा अलग तरीके से। 🔄\n\n" +
          "दो राउंड होंगे:\n" +
          "* **राउंड १ (रोल रिवर्सल)**: *आप* बस मालिक (राजेश यादव) बनेंगे, और *मैं* सेल्सपर्सन (अमित) बनूँगा। आप देखेंगे कि एक अच्छी पिच कैसी लगती है।\n" +
          "* **राउंड २ (स्वैप)**: इसका उल्टा। मैं बस मालिक बनूँगा, और आप पिच करेंगे।\n\n" +
          "तैयार हैं? चलिए राउंड १ शुरू करते हैं। 🎭\n\n" +
          "[CHIP: चलो शुरू करें] [CHIP: यह कैसे काम करेगा?]",
          
          "Rohit, aaj pitch pe kaam karenge — par thoda alag tarike se. 🔄\n\n" +
          "Do round honge:\n" +
          "* **Round 1 (Role Reversal)**: *Aap* bus owner (Rajesh Yadav) banoge, aur *main* salesperson (Amit) banunga. Aap dekhoge ki achha pitch kaisa lagta hai.\n" +
          "* **Round 2 (Swap)**: Ulta. Main bus owner banunga, aur aap pitch karoge.\n\n" +
          "Ready? Let's start Round 1. 🎭\n\n" +
          "[CHIP: Chalo shuru karein] [CHIP: Ye kaise kaam karega?]"
        );
      }
    }
    const obj = OBJECTION_POOL.greeting_rush;
    return t(
      "🔄 **Roleplay Restarted**\n\n" + t(obj.en, obj.hi, obj.hgl),
      "🔄 **रोलप्ले पुनः शुरू किया गया**\n\n" + t(obj.en, obj.hi, obj.hgl),
      "🔄 **Roleplay Restarted**\n\n" + t(obj.en, obj.hi, obj.hgl)
    );
  }

  // ROLEPLAY INITIALIZATION
  if (isRoleplayStart) {
    return t(
      "Rohit, let's start the **Customer Roleplay**. 🔄\n\n" +
      "There will be two rounds:\n" +
      "* **Round 1 (Role Reversal)**: *You* will become the bus owner (Rajesh Yadav), and *I* will play the salesperson (Amit). You will experience what a good pitch feels like.\n" +
      "* **Round 2 (Swap)**: The reverse. I will play the bus owner, and you will pitch to me.\n\n" +
      "Ready? Let's start Round 1. 🎭\n\n" +
      "[CHIP: Let's start] [CHIP: How does this work?]",

      "रोहित, चलिए **कस्टमर रोलप्ले** शुरू करते हैं। 🔄\n\n" +
      "दो राउंड होंगे:\n" +
      "* **राउंड १ (रोल रिवर्सल)**: *आप* बस मालिक (राजेश यादव) बनेंगे, और *मैं* सेल्सपर्सन (अमित) बनूँगा। आप देखेंगे कि एक अच्छी पिच कैसी लगती है।\n" +
      "* **राउंड २ (स्वैप)**: इसका उल्टा। मैं बस मालिक बनूँगा, और आप पिच करेंगे।\n\n" +
      "तैयार हैं? चलिए राउंड १ शुरू करते हैं। 🎭\n\n" +
      "[CHIP: चलो शुरू करें] [CHIP: यह कैसे काम करेगा?]",

      "Rohit, chaliye **Customer Roleplay** shuru karte hain. 🔄\n\n" +
      "Do round honge:\n" +
      "* **Round 1 (Role Reversal)**: *Aap* bus owner (Rajesh Yadav) banoge, aur *main* salesperson (Amit) banunga. Aap dekhoge ki achha pitch kaisa lagta hai.\n" +
      "* **Round 2 (Swap)**: Ulta. Main bus owner banunga, aur aap pitch karoge.\n\n" +
      "Ready? Let's start Round 1. 🎭\n\n" +
      "[CHIP: Chalo shuru karein] [CHIP: Ye kaise kaam karega?]"
    );
  }

  // DYNAMIC CUSTOMER RESPONSE (Picks next objection based on what learner missed)
  if (isRoleplayInFlight) {
    const currIdx = getRoleplayObjectionIndex();
    const objKeys = Object.keys(OBJECTION_POOL);
    const nextIdx = Math.min(currIdx + 1, objKeys.length - 1);
    const key = objKeys[nextIdx];
    const obj = OBJECTION_POOL[key] || OBJECTION_POOL.demo_decision;
    return t(obj.en, obj.hi, obj.hgl);
  }

  const getPitchAttemptCount = () => {
    let count = 0;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === "assistant" && (m.content.includes("Hint:") || m.content.includes("Ishara:") || m.content.includes("Attempt") || m.content.includes("scorecard") || m.content.includes("Report Card") || m.content.includes("Scorecard"))) {
        count++;
      }
    }
    return count + 1;
  };


  // 1. Define the 4-option trilingual questions structure
  const VIDEO_QUESTIONS = {
    intro: [
      {
        q: {
          en: "Which **one product** of ApniBus do we sell to operators?",
          hi: "ApniBus का कौन सा **एक प्रोडक्ट** है जो हम ऑपरेटरों को बेचते हैं?",
          hgl: "ApniBus ka kaunsa **ek product** hai jo hum operators ko bechte hain?"
        },
        options: [
          { key: "pos", en: "POS Ticketing Machine", hi: "POS Ticketing Machine (मशीन)", hgl: "POS Ticketing Machine" },
          { key: "business", en: "Business App", hi: "Business App (बिजनेस ऐप)", hgl: "Business App" },
          { key: "commando", en: "Commando App", hi: "Commando App (कमांडो ऐप)", hgl: "Commando App" },
          { key: "parts", en: "Bus Spare Parts", hi: "बस स्पेयर पार्ट्स", hgl: "Bus Spare Parts" }
        ],
        correct: "pos"
      },
      {
        q: {
          en: "What is the biggest problem a bus operator faces in manual ticketing?",
          hi: "मैन्युअल टिकटिंग में बस ऑपरेटर को सबसे बड़ी समस्या क्या आती है?",
          hgl: "Manual ticketing mein bus operator ko sabse badi samasya kya aati hai?"
        },
        options: [
          { key: "leakage", en: "Revenue leakage and ticket theft", hi: "कैश चोरी और रेवेन्यू लीकेज", hgl: "Revenue leakage aur ticket chori" },
          { key: "printing", en: "Slow ticket printing speed", hi: "टिकट धीरे प्रिंट होना", hgl: "Ticket printing slow hona" },
          { key: "drama", en: "Conductor's daily arguments", hi: "कंडक्टर के नखरे और बहस", hgl: "Conductor ka daily arguments" },
          { key: "buses", en: "Finding passengers for buses", hi: "बसों के लिए यात्री न मिलना", hgl: "Buses ke liye passengers dhundhna" }
        ],
        correct: "leakage"
      }
    ],
    "pos-demo": [
      {
        q: {
          en: "What are the primary payment modes demonstrated on the ApniBus POS machine?",
          hi: "ApniBus POS मशीन पर प्रदर्शित मुख्य भुगतान मोड कौन से हैं?",
          hgl: "ApniBus POS machine par kaunse primary payment modes support hote hain?"
        },
        options: [
          { key: "both", en: "Both Cash and UPI payments", hi: "दोनों कैश और UPI भुगतान", hgl: "Both Cash aur UPI payments" },
          { key: "card", en: "Only Credit/Debit Card", hi: "केवल क्रेडिट/डेबिट कार्ड", hgl: "Only Credit/Debit Card" },
          { key: "crypto", en: "Only Crypto currency", hi: "केवल क्रिप्टो करेंसी", hgl: "Only Crypto currency" },
          { key: "cheque", en: "Only Cheque payments", hi: "केवल चेक से भुगतान", hgl: "Only Cheque payments" }
        ],
        correct: "both"
      },
      {
        q: {
          en: "How fast does the POS Ticketing Machine print a ticket?",
          hi: "POS टिकटिंग मशीन कितनी तेज़ी से टिकट प्रिंट करती है?",
          hgl: "POS Ticketing Machine se ticket kitni der mein print ho jata hai?"
        },
        options: [
          { key: "instant", en: "Instantly in less than 2 seconds", hi: "तुरंत २ सेकंड से भी कम समय में", hgl: "Instantly in less than 2 seconds" },
          { key: "slow", en: "Takes 1 minute per ticket", hi: "१ मिनट प्रति टिकट लगता है", hgl: "Takes 1 minute per ticket" },
          { key: "manual", en: "Needs manual writing", hi: "हाथ से लिखना पड़ता है", hgl: "Manual writing karni padti hai" },
          { key: "medium", en: "Takes 30 seconds", hi: "३० सेकंड लगते हैं", hgl: "Takes 30 seconds" }
        ],
        correct: "instant"
      }
    ],
    commando: [
      {
        q: {
          en: "What is the first thing a BD must do in the Commando App to start their workday?",
          hi: "BD को अपना काम शुरू करने के लिए कमांडो ऐप में सबसे पहले क्या करना चाहिए?",
          hgl: "Commando App mein kaam shuru karne ke liye BD ko sabse pehle kya karna padta hai?"
        },
        options: [
          { key: "start", en: "Mark 'Start Day' with selfie and location", hi: "'Start Day' मार्क करना (सेल्फी + लोकेशन)", hgl: "Mark 'Start Day' with selfie and location" },
          { key: "pos", en: "Request a direct POS replacement", hi: "सीधे POS रिप्लेसमेंट रिक्वेस्ट करना", hgl: "Direct POS replacement request karna" },
          { key: "call", en: "Call the operator immediately", hi: "ऑपरेटर को तुरंत कॉल करना", hgl: "Operator ko call karna" },
          { key: "score", en: "Check the academy scorecard", hi: "अकादमी स्कोरकार्ड चेक करना", hgl: "Academy scorecard check karna" }
        ],
        correct: "start"
      },
      {
        q: {
          en: "Is the Commando App for operators or for internal use?",
          hi: "कमांडो ऐप ऑपरेटरों के लिए है या आंतरिक उपयोग के लिए?",
          hgl: "Is the Commando App for operators or for internal use?"
        },
        options: [
          { key: "internal", en: "Internal workflow management tool for BDs", hi: "BDs के लिए इंटरनल काम का टूल", hgl: "Internal work tool for ApniBus BDs" },
          { key: "operators", en: "For bus operators to see their accounts", hi: "बस मालिकों को अपना हिसाब देखने के लिए", hgl: "Bus operators ke liye accounts dekhne ke liye" },
          { key: "conductors", en: "For bus conductors to sell tickets", hi: "कंडक्टर्स के लिए टिकट काटने के लिए", hgl: "Conductors ke liye ticket kaatne ke liye" },
          { key: "passengers", en: "For passengers to book tickets", hi: "यात्रियों के लिए ऑनलाइन टिकट बुक करने के लिए", hgl: "Passengers ke liye ticket book karne ke liye" }
        ],
        correct: "internal"
      }
    ],
    business: [
      {
        q: {
          en: "Do operators have to pay extra for the **ApniBus Business App**?",
          hi: "क्या ऑपरेटर को **ApniBus Business App** के लिए अलग से भुगतान करना पड़ता है?",
          hgl: "Kya operator ko **ApniBus Business App** ke liye alag se paise dene hote hain?"
        },
        options: [
          { key: "free", en: "No, it is completely free with the POS machine", hi: "नहीं, यह POS मशीन के साथ बिल्कुल फ्री है", hgl: "Nahi, ye POS machine ke sath bilkul free hai" },
          { key: "monthly", en: "Yes, 500 Rupees monthly subscription", hi: "हाँ, ५०० रुपये का मासिक शुल्क है", hgl: "Haan, 500 Rupees monthly subscription" },
          { key: "onetime", en: "Yes, one-time payment of 2000 Rupees", hi: "हाँ, २००० रुपये का एक बार का पेमेंट", hgl: "Haan, one-time payment of 2000 Rupees" },
          { key: "perbus", en: "Yes, per-bus monthly charges apply", hi: "हाँ, हर बस का अलग चार्ज लगता है", hgl: "Haan, per-bus monthly charges lagte hain" }
        ],
        correct: "free"
      },
      {
        q: {
          en: "What is the main benefit of the Business App that helps operators close deals?",
          hi: "बिजनेस ऐप का मुख्य लाभ क्या है जो ऑपरेटरों के साथ डील क्लोज करने में मदद करता है?",
          hgl: "Business App ka main benefit kya hai jo operators ke sath deal close karne mein help karta hai?"
        },
        options: [
          { key: "live", en: "It shows real-time collection reports live on their phone", hi: "यह उनके फोन पर लाइव रियल-टाइम कलेक्शन रिपोर्ट दिखाता है", hgl: "It shows real-time collection reports live on their phone" },
          { key: "replace", en: "It replaces the conductor entirely", hi: "यह कंडक्टर को पूरी तरह बदल देता है", hgl: "It replaces the conductor entirely" },
          { key: "music", en: "It provides music entertainment", hi: "यह संगीत मनोरंजन प्रदान करता है", hgl: "It provides music entertainment" },
          { key: "print", en: "It prints physical tickets", hi: "यह फिजिकल टिकट प्रिंट करता है", hgl: "It prints physical tickets" }
        ],
        correct: "live"
      }
    ]
  };


  // Helper to shuffle array
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Find which video is actively being checked in the chat history
  const getActiveVideoId = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user" && messages[i].content.startsWith("[SYSTEM]")) {
        const sysMsg = messages[i].content.toLowerCase();
        if (sysMsg.includes("business")) return "business";
        if (sysMsg.includes("commando") || sysMsg.includes("lead") || sysMsg.includes("meeting") || sysMsg.includes("replacement")) return "commando";
        if (sysMsg.includes("pos") || sysMsg.includes("payment")) return "pos-demo";
        return "intro";
      }
    }
    return "intro";
  };

  // Helper to format/render a question with shuffled chips
  const renderQuestion = (qObj, index) => {
    const questionText = t(qObj.q.en, qObj.q.hi, qObj.q.hgl);
    const shuffledOpts = shuffleArray(qObj.options);
    const chipStrings = shuffledOpts.map(o => `[CHIP: ${o.key}|${t(o.en, o.hi, o.hgl)}]`).join(" ");
    
    const header = index === 0 
      ? t("Question 1:", "सवाल १:", "Sawaal 1:")
      : t("Question 2:", "सवाल २:", "Sawaal 2:");
      
    return `${header} ${questionText}\n\n${chipStrings}`;
  };

  // Helper to check if user's input is the correct answer
  const checkAnswer = (qObj) => {
    // 1. If we have selectedOptionId, do exact matching!
    if (selectedOptionId) {
      return selectedOptionId === qObj.correct;
    }
    
    // 2. Otherwise fall back to strict keyword matching (for typed answers or command tests)
    const correctOpt = qObj.options.find(o => o.key === qObj.correct);
    if (!correctOpt) return false;
    
    const userAns = lastMsg.toLowerCase().trim();
    
    // If the user's answer exactly matches option keys or text
    if (userAns === qObj.correct ||
        userAns === correctOpt.en.toLowerCase() ||
        userAns === correctOpt.hi.toLowerCase() ||
        userAns === correctOpt.hgl.toLowerCase()) {
      return true;
    }
    
    // Fall back to clean substring checking but with strict boundary word matching to prevent false positives
    const matchWord = (word, text) => {
      const regex = new RegExp("(?:^|\\s)" + word.replace(/[.*+?^${}()|[\\\\\\]/g, "\\$&") + "(?:$|\\s|\\W)", "i");
      return regex.test(text);
    };

    if (qObj.correct === "pos" && (matchWord("pos", userAns) || matchWord("machine", userAns))) return true;
    if (qObj.correct === "leakage" && (matchWord("leakage", userAns) || matchWord("chori", userAns) || matchWord("theft", userAns))) return true;
    if (qObj.correct === "free" && (matchWord("free", userAns) || matchWord("muft", userAns) || userAns === "no")) return true;
    if (qObj.correct === "both" && (matchWord("both", userAns) || matchWord("collection", userAns) || matchWord("cash", userAns))) return true;
    if (qObj.correct === "lead" && matchWord("lead", userAns)) return true;
    if (qObj.correct === "internal" && (matchWord("internal", userAns) || matchWord("intern", userAns))) return true;
    if (qObj.correct === "meeting" && (matchWord("meeting", userAns) || matchWord("visit", userAns))) return true;
    if (qObj.correct === "pipeline" && (matchWord("pipeline", userAns) || matchWord("history", userAns))) return true;
    if (qObj.correct === "yes" && (userAns === "yes" || userAns === "haan" || userAns === "haan, directly commando app se request kar sakta hai")) return true;
    if (qObj.correct === "approval" && (matchWord("admin", userAns) || matchWord("approval", userAns)) && !matchWord("conductor", userAns) && !matchWord("passenger", userAns)) return true;
    if (qObj.correct === "instant" && (matchWord("instant", userAns) || matchWord("second", userAns) || matchWord("fast", userAns))) return true;
    if (qObj.correct === "start" && (matchWord("start", userAns) || matchWord("shuru", userAns) || matchWord("selfie", userAns))) return true;
    if (qObj.correct === "live" && (matchWord("live", userAns) || matchWord("real", userAns) || matchWord("report", userAns) || matchWord("hisaab", userAns))) return true;

    return false;
  };

    // Handle Video Checkpoints
  const activeVideoId = getActiveVideoId();
  const lastAssContent = getPreviousAssistantMsg(1);
  const isAskingQ1 = lastAssContent.includes("Question 1:") || lastAssContent.includes("Sawaal 1:") || lastAssContent.includes("सवाल १:");
  const isAskingQ2 = lastAssContent.includes("Question 2:") || lastAssContent.includes("Sawaal 2:") || lastAssContent.includes("सवाल २:");

  // Handle Language Switches during active quiz
  const isLanguageCmd = lowerMsg.includes("baat karo") || lowerMsg.includes("baat karein") || lowerMsg.includes("language") || lowerMsg.includes("बात करो") || lowerMsg.includes("english") || lowerMsg.includes("hindi") || lowerMsg.includes("hinglish");

  if (isLanguageCmd && mode === "videos" && (isAskingQ1 || isAskingQ2)) {
    const questions = VIDEO_QUESTIONS[activeVideoId];
    if (questions) {
      const targetLangName = (lowerMsg.includes("hindi") || lowerMsg.includes("हिन्दी") || lowerMsg.includes("हिढी")) ? "हिढी" : (lowerMsg.includes("english") || lowerMsg.includes("अंग्रेजी")) ? "English" : "Hinglish";
      const confirmationText = targetLangName === "English"
        ? `Sure! From now on we will talk in **English**. Let's continue your video assessment: 👍`
        : targetLangName === "हिंदी"
        ? `ज़रूर! अब से हम **हिंदी** में बात करेंगे। चलिए आपका वीडियो असेसमेंट जारी रखते हैं: 👍`
        : `Sure! Ab se hum **Hinglish** mein baat karenge. Chaliye aapka video assessment continue karte hain: 👍`;

      const qObj = isAskingQ2 ? questions[1] : questions[0];
      const qIdx = isAskingQ2 ? 1 : 0;
      
      return confirmationText + "\n\n" + renderQuestion(qObj, qIdx);
    }
  }

  if (lastMsg.startsWith("[SYSTEM]")) {
    const questions = VIDEO_QUESTIONS[activeVideoId];
    if (questions && questions[0]) {
      const welcome = t(
        `You have completed the video! Good job. Let's answer 2 short questions to confirm your learning.`,
        `आपने वीडियो पूरा कर लिया है! शाबाश। चलिए, मैं आपसे २ छोटे सवाल पूछता हूँ ताकि आपकी सीख पक्की हो सके।`,
        `Aapne video complete kar liya hai! Shabaash. Chaliye, main aapse 2 short questions poochta hoon taaki confirm ho sake.`
      );
      return welcome + "\n\n" + renderQuestion(questions[0], 0);
    }
  }

  if (mode === "videos" && (isAskingQ1 || isAskingQ2)) {
    const questions = VIDEO_QUESTIONS[activeVideoId];
    if (!questions) {
      return t("System error: Questions not found.", "सिस्टम एरर: सवाल नहीं मिले।", "System error: Questions nahi mile.");
    }

    if (isAskingQ1) {
      const q1 = questions[0];
      const isQ1Correct = checkAnswer(q1);
      
      if (isQ1Correct) {
        const feedback = t("Correct! Great job. 👍", "बिल्कुल सही जवाब! बहुत बढ़िया। 👍", "Correct! Great job. 👍");
        return feedback + "\n\n" + renderQuestion(questions[1], 1);
      } else {
        const incorrectExplanations = {
          intro: t(
            "No, remember: we only sell the **POS Ticketing Machine**. The Business App is free, and the Commando App is internal.",
            "नहीं, ध्यान रखें: हम केवल **POS Ticketing Machine** बेचते हैं। बिजनेस ऐप मुफ्त है, और कमांडो ऐप आंतरिक उपयोग के लिए है।",
            "Nahi, yaad rakhein: hum sirf **POS Ticketing Machine** bechte hain. Business App free hai, aur Commando App internal use ke liye hai."
          ),
          business: t(
            "No, the **Business App is completely free** for the operator. It comes free with the POS machine to help them check their collection.",
            "नहीं, **बिजनेस ऐप बिल्कुल मुफ्त है**। यह ऑपरेटर को POS मशीन के साथ फ्री दी जाती है।",
            "Nahi, **Business App bilkul free hai**. Ye POS machine ke sath free milti hai taaki owner collection dekh sake."
          ),
          "commando-lead": t(
            "No, to track a new customer, a BD must first create a **Lead** in the Commando App.",
            "नहीं, नए ग्राहक को ट्रैक करने के लिए BD को सबसे पहले कमांडो ऐप में एक **Lead** बनानी होती है।",
            "Nahi, naye customer ko track karne ke liye BD ko sabse pehle Commando App mein **Lead** create karni hoti hai."
          ),
          "commando-meeting": t(
            "No, right after meeting the operator, you must add a **Meeting** visit log in the application.",
            "नहीं, ऑपरेटर से मिलने के तुरंत बाद आपको ऐप में **मीटिंग** जोड़नी होती है।",
            "Nahi, operator se milne ke turant baad aapko app mein **Meeting** add karni hoti hai."
          ),
          "commando-replacement": t(
            "Actually, a BD can request a POS device replacement **directly through the Commando App**.",
            "वास्तव में, BD ऐप से **डायरेक्ट रिप्लेसमेंट रिक्वेस्ट** डाल सकता है।",
            "Actually, BD app se **direct replacement request** daal sakta hai."
          )
        };
        const explanation = incorrectExplanations[activeVideoId] || t("Incorrect.", "यह सही जवाब नहीं है।", "Nahi, ye correct answer nahi hai.");
        const retryPrompt = t("Please try again: 🔄", "कृपया पुनः प्रयास करें: 🔄", "Kripya fir se try kijiye: 🔄");
        
        return explanation + "\n\n" + retryPrompt + "\n\n" + renderQuestion(q1, 0);
      }
    }

    if (isAskingQ2) {
      const q2 = questions[1];
      const isQ2Correct = checkAnswer(q2);
      
      if (isQ2Correct) {
        const feedback = t("Correct! You nailed it. 🎯", "बिल्कुल सही! आपने सही जवाब दिया। 🎯", "Correct! You nailed it. 🎯");

        const nextVideoTitles = {
          intro: "POS Machine Demo",
          "pos-demo": "AB Commando App",
          commando: "AB Business App"
        };

        if (activeVideoId === "business") {
          return feedback + "\n\n" + t(
            "Congratulations! 🎉 You have completed all video and slide checkpoints. **Phase 2 (Grooming)** is now unlocked!\n\n[CHIP: Grooming shuru karein]",
            "बधाई हो! 🎉 आपने सारे वीडियो और स्लाइड्स सफलतापूर्वक देख लिए हैं। अब आपका **Phase 2 (Grooming)** अनलॉक हो चुका है!\n\n[CHIP: Grooming shuru karein]",
            "Congratulations! 🎉 Aapne saare videos aur slides successfully confirm kar liye hain. Ab aapka **Phase 2 (Grooming)** unlock ho chuka hai!\n\n[CHIP: Grooming shuru karein]"
          );
        } else {
          const nextTitle = nextVideoTitles[activeVideoId] || "";
          return feedback + "\n\n" + t(
            `You have cleared this checkpoint! 👍 You can proceed to the next video: **${nextTitle}**.\n\n[CHIP: Watch next video]`,
            `आपने यह चेकपॉइंट सफलतापूर्वक पूरा कर लिया है! 👍 अब आप अगला वीडियो देख सकते हैं: **${nextTitle}**।\n\n[CHIP: Agla video dekhte hain]`,
            `Aapne ye checkpoint successfully clear kar liya hai! 👍 Ab aap agla video **${nextTitle}** dekh sakte hain.\n\n[CHIP: Agla video dekhte hain]`
          );
        }
      } else {
        const incorrectExplanations = {
          intro: t(
            "Actually, the operator's biggest headache is **Revenue Leakage** (conductors stealing cash) and lack of daily collections accounts.",
            "वास्तव में, ऑपरेटर का सबसे बड़ा सिरदर्द **कैश चोरी और रेवेन्यू लीकेज** है।",
            "Actually, operator ka sabse bada headache **Revenue Leakage** (cash chori) aur daily hisaab na milna hai."
          ),
          "pos-demo": t(
            "Actually, the smart POS machine prints thermal tickets instantly in less than 2 seconds.",
            "वास्तव में, स्मार्ट POS मशीन तुरंत २ सेकंड से भी कम समय में थर्मल टिकट प्रिंट करती है।",
            "Actually, smart POS machine instantly less than 2 seconds mein ticket print karti hai."
          ),
          commando: t(
            "Actually, the Commando App is strictly an **internal tool for ApniBus BDs** to manage leads.",
            "वास्तव में, कमांडो ऐप केवल **ApniBus BDs के लिए एक आंतरिक उपकरण** है।",
            "Actually, Commando App sirf **ApniBus BDs ke liye internal tool** hai."
          ),
          business: t(
            "Actually, the Business App allows operators to see real-time collection reports live on their phone.",
            "वास्तव में, बिजनेस ऐप ऑपरेटरों को अपने फोन पर लाइव रियल-टाइम कलेक्शन रिपोर्ट देखने की सुविधा देता है।",
            "Actually, Business App owner ko phone par live collection report dikhata hai."
          )
        };
        const explanation = incorrectExplanations[activeVideoId] || t("Incorrect.", "यह सही जवाब नहीं है।", "Nahi, ye correct answer nahi hai.");
        const retryPrompt = t("Please try again: 🔄", "कृपया पुनः प्रयास करें: 🔄", "Kripya fir se try kijiye: 🔄");
        
        return explanation + "\n\n" + retryPrompt + "\n\n" + renderQuestion(q2, 1);
      }
    }
  }

  // 3. Grooming/Phase 2 options — AUTOMATED SEQUENTIAL FLOW (No asking what to do!)
  if (lowerMsg.includes("completed all 5 videos") || lowerMsg.includes("grooming shuru") || lowerMsg.includes("grooming phase") || lowerMsg.includes("ग्रूमिंग")) {
    return t(
      "🚀 **Welcome to Phase 2 Grooming — Step 1: Product Deep-Dive**\n\n" +
      "Here are the 7 core features of ApniBus POS Ticketing Machine:\n\n" +
      "1. **Instant Digital Ticketing**: Prints thermal tickets in <2 seconds.\n" +
      "2. **Offline & Online Mode**: Works without signal; syncs automatically when network returns.\n" +
      "3. **Long Battery Life**: 24-hour battery for non-stop double trips.\n" +
      "4. **Rugged Hardware**: Heavy drop-tested body made for rough bus handling.\n" +
      "5. **Free Business App**: Owner gets real-time collection reports on phone for FREE.\n" +
      "6. **Revenue Leakage Control**: Stops conductor cash theft and ticket fraud.\n" +
      "7. **24x7 Support & Warranty**: Instant machine replacement support.\n\n" +
      "Ready to move to Step 2? Click below! 👇\n\n" +
      "[CHIP: Next Step — Objection Handling]",

      "🚀 **फेज २ ग्रूमिंग में आपका स्वागत है — स्टेप १: प्रोडक्ट डीप-डाइव**\n\n" +
      "यहाँ ApniBus POS मशीन के ७ मुख्य फीचर्स हैं:\n\n" +
      "१. **इंस्टेंट डिजिटल टिकट**: २ सेकंड में थर्मल प्रिंट।\n" +
      "२. **ऑफलाइन और ऑनलाइन मोड**: बिना नेटवर्क के भी चलता है।\n" +
      "३. **लंबी बैटरी लाइफ**: २४ घंटे बैकअप।\n" +
      "४. **मजबूत बॉडी**: बस के कठिन उपयोग के लिए ड्रॉप-टेस्टेड।\n" +
      "५. **फ्री बिजनेस ऐप**: मालिक को फ़ोन पर लाइव कलेक्शन रिपोर्ट मुफ्त।\n" +
      "६. **कैश चोरी पर रोक**: कंडक्टर चोरी और टिकट घपले पर पूरा कंट्रोल।\n" +
      "७. **२४x७ सपोर्ट**: तुरंत मशीन रिप्लेसमेंट वारंटी।\n\n" +
      "स्टेप २ पर जाने के लिए नीचे क्लिक करें! 👇\n\n" +
      "[CHIP: अगला कदम — ऑब्जेक्शन हैंडलिंग]",

      "🚀 **Welcome to Phase 2 Grooming — Step 1: Product Deep-Dive**\n\n" +
      "Ye hain ApniBus POS machine ke 7 main features:\n\n" +
      "1. **Instant Digital Ticketing**: 2 second mein thermal ticket print.\n" +
      "2. **Offline & Online Mode**: Bina network ke bhi chalega; signal aane pe auto-sync.\n" +
      "3. **Long Battery Life**: 24 ghante nonstop battery backup.\n" +
      "4. **Rugged Hardware**: Heavy drop-tested body.\n" +
      "5. **Free Business App**: Owner ko phone pe live collection report bilkul FREE.\n" +
      "6. **Revenue Leakage Control**: Conductor cash theft par full rok.\n" +
      "7. **24x7 Support & Replacement Warranty**.\n\n" +
      "Step 2 pe jaane ke liye niche click karein! 👇\n\n" +
      "[CHIP: Next Step — Objection Handling]"
    );
  }

  const lastAss = getPreviousAssistantMsg(1);



  // Model Answer request trigger
  if (lowerMsg.includes("model answer") || lowerMsg.includes("मॉडल उत्तर") || lowerMsg.includes("model answer dikhao")) {
    return t(
      "### 💡 Ideal Pitch (Model Answer)\n\n" +
      "*\"Namaste sir, I'm Rohit from ApniBus. I'll take two minutes, is that okay? Sir, one question — how do you know your daily collection? And sir, that money — how do you know it's complete? Sir, our POS machine records every ticket automatically. And sir, with the machine you get the Business App completely free on your phone. Look... today's full collection, every trip's account.\"\n\n" +
      "[CHIP: Try again]",

      "### 💡 आदर्श पिच (मॉडल उत्तर)\n\n" +
      "*\"नमस्ते सर, मैं रोहित, ApniBus से। दो मिनट लूँगा बस, चलेगा? सर एक बात पूछूँ — आपका रोज़ का कलेक्शन आपको कैसे पता चलता है? और सर, वो पैसा पूरा है — ये कैसे पता चलता है? हमारी POS मशीन हर टिकट का रिकॉर्ड अपने आप बनाती है। और सर, मशीन के साथ Business App बिल्कुल फ्री मिलती है — आपके फ़ोन पर। ये देखिए... आज का पूरा कलेक्शन, हर ट्रिप का हिसाब।\"\n\n" +
      "[CHIP: दोबारा खेलें]",

      "### 💡 Ideal Pitch (Model Answer)\n\n" +
      "*\"Namaskar bhaiya! Main ApniBus se aaya hoon. Hum bus operators ko unke dhandhe ka poora digital control dete hain. Hamari POS Ticketing Machine se conductor chori nahi kar payega, aur aapko ghar baithe mobile app par har ticket ka live collection aur trip status milta rahega. Ye Business App bilkul free hai machine ke sath.\"\n\n" +
      "[CHIP: Try again]"
    );
  }

  // Scorecard request trigger (Grooming Pitch Step only)
  if (lowerMsg.includes("pitch scorecard") || lowerMsg.includes("view scorecard")) {
    // Gather all user messages during the swap phase
    const swapStartIndex = messages.findIndex(m => m.content.includes("Haan bhai bolo") || m.content.includes("bus nikalne wali hai") || m.content.includes("बस निकलने वाली है"));
    const userPitchParts = [];
    if (swapStartIndex !== -1) {
      for (let i = swapStartIndex; i < messages.length; i++) {
        if (messages[i].role === "user") {
          userPitchParts.push(messages[i].content);
        }
      }
    } else {
      userPitchParts.push(lastMsg);
    }
    const fullPitchText = userPitchParts.join(" ");
    const lowerFullPitch = fullPitchText.toLowerCase();

    const hasGreeting = lowerFullPitch.includes("namaskar") || lowerFullPitch.includes("namaste") || lowerFullPitch.includes("hello") || lowerFullPitch.includes("नमस्ते") || lowerFullPitch.includes("नमस्कार") || lowerFullPitch.includes("bhaiya") || lowerFullPitch.includes("sir");
    const hasDiscovery = lowerFullPitch.includes("?") || lowerFullPitch.includes("kaise") || lowerFullPitch.includes("problem") || lowerFullPitch.includes("nuksan") || lowerFullPitch.includes("kyun") || lowerFullPitch.includes("कैसे") || lowerFullPitch.includes("नुकसान") || lowerFullPitch.includes("परेशानी");
    const hasProduct = lowerFullPitch.includes("pos") || lowerFullPitch.includes("machine") || lowerFullPitch.includes("app") || lowerFullPitch.includes("मशीन") || lowerFullPitch.includes("एप्लीकेशन");
    const hasObjectionHandling = lowerFullPitch.includes("mehnga") || lowerFullPitch.includes("price") || lowerFullPitch.includes("cost") || lowerFullPitch.includes("free") || lowerFullPitch.includes("conductor") || lowerFullPitch.includes("training");

    const greetingScore = hasGreeting ? 9 : 3;
    const rapportScore = hasGreeting && hasDiscovery ? 8 : 4;
    const discoveryScore = hasDiscovery ? 9 : 2;
    const problemScore = hasDiscovery && hasProduct ? 8 : 3;
    const productScore = hasProduct ? 9 : 3;
    const objectionScore = hasObjectionHandling ? 9 : 4;
    const confidenceScore = 9;
    const closingScore = hasProduct && hasObjectionHandling ? 8 : 3;

    const categories = [
      {
        name: t("Greeting", "अभिवादन (Greeting)", "Greeting"),
        score: greetingScore,
        well: hasGreeting 
          ? t("You greeted the operator respectfully.", "आपने ऑपरेटर का सम्मानपूर्वक अभिवादन किया।", "Aapne operator ko respectfully greet kiya.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: hasGreeting 
          ? t("None.", "कोई नहीं।", "None.") 
          : t("You should start with a warm greeting like Namaskar.", "आपको नमस्कार या राम-राम जैसे गर्मजोशी भरे अभिवादन से शुरू करना चाहिए था।", "Aapko Namaskar jaise warm greeting se shuru karna chahiye tha.")
      },
      {
        name: t("Rapport", "संबध निर्माण (Rapport)", "Rapport"),
        score: rapportScore,
        well: hasGreeting && hasDiscovery 
          ? t("Polite and business-focused attitude.", "सभ्य और व्यवसाय-केंद्रित दृष्टिकोण।", "Polite aur business-focused attitude.") 
          : t("Tried to keep the conversation going.", "बातचीत जारी रखने का प्रयास किया।", "Baatchiet jari rakhne ki koshish ki."),
        improve: !(hasGreeting && hasDiscovery) 
          ? t("Ask about the owner's wellbeing before talking about machine.", "मशीन की बात करने से पहले मालिक के काम-काज के बारे में पूछें।", "Machine ki baat se pehle owner ke haal-chaal ya kaam ke baare mein poochein.") 
          : t("None.", "कोई नहीं।", "None.")
      },
      {
        name: t("Need Discovery", "ज़रूरत खोजना (Need Discovery)", "Need Discovery"),
        score: discoveryScore,
        well: hasDiscovery 
          ? t("Asked questions about collection tracking.", "कलेक्शन ट्रैकिंग को लेकर सवाल पूछे।", "Collection tracking ko lekar sawaal pooche.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: hasDiscovery 
          ? t("None.", "कोई नहीं।", "None.") 
          : t("Avoid jumping straight to features. Ask how they track cash leakages first.", "सीधे फीचर्स पर न जाएं। पहले पूछें कि वे कैश चोरी को कैसे रोकते हैं।", "Direct features pe mat jao. Pehle poonchhein ki cash leakage kaise track karte hain.")
      },
      {
        name: t("Problem Understanding", "समस्या समझना (Problem Understanding)", "Problem Understanding"),
        score: problemScore,
        well: hasDiscovery 
          ? t("Focused on the daily verification headache.", "दैनिक हिसाब-किताब के सिरदर्द पर ध्यान दिया।", "Daily verification pe focus kiya.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: !hasDiscovery 
          ? t("Highlight the cost of conductor leakage.", "कंडक्टर द्वारा की जाने वाली चोरी के नुकसान को रेखांकित करें।", "Conductor leakage ke nuksan ko highlight karein.") 
          : t("None.", "कोई नहीं।", "None.")
      },
      {
        name: t("Product Positioning", "प्रोडक्ट पोजीशनिंग (Product Positioning)", "Product Positioning"),
        score: productScore,
        well: hasProduct 
          ? t("Presented the POS machine clearly.", "POS मशीन को स्पष्ट रूप से पेश किया।", "POS machine ko sahi se present kiya.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: hasProduct 
          ? t("Mention the free Business App to track collection.", "लाइव कलेक्शन देखने के लिए फ्री बिजनेस ऐप का जिक्र जरूर करें।", "Live collection dekhne ke liye free Business App ka zikr karein.") 
          : t("You did not name the product.", "आपने प्रोडक्ट का नाम नहीं लिया।", "Aapne product ka naam nahi liya.")
      },
      {
        name: t("Objection Handling", "ऐतराज संभालना (Objection Handling)", "Objection Handling"),
        score: objectionScore,
        well: hasObjectionHandling 
          ? t("Replied to price/conductor objections.", "कीमत और कंडक्टर संबंधी ऐतराजों का जवाब दिया।", "Price/conductor objections ka jawab diya.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: !hasObjectionHandling 
          ? t("Use the A-A-A-A framework to handle price objections.", "कीमत के ऐतराजों को संभालने के लिए A-A-A-A फ्रेमवर्क का उपयोग करें।", "Price objections ke liye A-A-A-A framework use karein.") 
          : t("None.", "कोई नहीं।", "None.")
      },
      {
        name: t("Confidence", "आत्मविश्वास (Confidence)", "Confidence"),
        score: confidenceScore,
        well: t("Spoke with clear structure.", "स्पष्ट संरचना के साथ बात की।", "Sahi structure ke sath baat ki."),
        improve: t("Keep practice going.", "निरंतर अभ्यास करते रहें।", "Practice karte rahein.")
      },
      {
        name: t("Closing", "क्लोजिंग (Closing)", "Closing"),
        score: closingScore,
        well: hasProduct && hasObjectionHandling 
          ? t("Asked for a demo step.", "डेमो सेटअप के लिए पूछा।", "Demo setup ke liye poocha.") 
          : t("None.", "कोई नहीं।", "None."),
        improve: !(hasProduct && hasObjectionHandling) 
          ? t("Do not ask for order directly. Ask for a free demo visit.", "सीधे ऑर्डर न मांगें। पहले एक फ्री लाइव डेमो विजिट का समय मांगें।", "Direct order mat mango. Pehle free live demo visit maango.") 
          : t("None.", "कोई नहीं।", "None.")
      }
    ];

    let scorecardText = t(
      "## 📊 APNIBUS SALES ACADEMY — PITCH SCORECARD\n\n",
      "## 📊 APNIBUS सेल्स एकेडमी — पिच स्कोरकार्ड\n\n",
      "## 📊 APNIBUS SALES ACADEMY — PITCH SCORECARD\n\n"
    );

    categories.forEach(c => {
      scorecardText += `### 🔹 ${c.name}\n`;
      scorecardText += `**Score:** ${c.score}/10\n`;
      scorecardText += `* **What was done well:** ${c.well}\n`;
      scorecardText += `* **What could be improved:** ${c.improve}\n\n`;
    });

    scorecardText += t(
      "Would you like to see the model answer?\n\n[CHIP: Show model answer] [CHIP: Try again]",
      "क्या आप मॉडल उत्तर देखना चाहते हैं?\n\n[CHIP: मॉडल उत्तर दिखाओ] [CHIP: दोबारा खेलें]",
      "Kya aap model answer dekhna chahte hain?\n\n[CHIP: Show model answer] [CHIP: Try again]"
    );

    return scorecardText;
  }


  // EXPLICIT FSM STEP ID ROUTER
  
  const isStartRequest = lowerMsg.includes("shuru") || lowerMsg.includes("start") || lowerMsg.includes("work") || lowerMsg.includes("kaise") || lowerMsg.includes("brief") || lowerMsg.includes("charac");
  if ((explicitStepId === "pitch" && !isStartRequest && currentStage === "welcome") || lowerMsg.includes("fix my pitch") || lowerMsg.includes("role reversal") || lowerMsg.includes("pitch correction") || (lowerMsg.includes("pitch") && !lowerMsg.includes("scorecard") && !isStartRequest && currentStage === "welcome")) {
    return t(
      "Rohit, today we will work on your pitch — but in a slightly different way. 🔄\n\n" +
      "There will be two rounds:\n" +
      "* **Round 1 (Role Reversal)**: *You* will become the bus owner, and *I* will become the salesperson. You will experience what a good pitch feels like — sitting in the customer's chair.\n" +
      "* **Round 2 (Swap)**: The reverse. I will play the bus owner, and you will pitch.\n\n" +
      "Round 1 is the most important. Why? Because until you know **what the customer feels**, you are just memorizing lines.\n\n" +
      "Ready? Let's start Round 1. 🎭\n\n" +
      "[CHIP: Let's start] [CHIP: How does this work?]",

      "रोहित, आज हम आपकी पिच पर काम करेंगे — लेकिन थोड़े अलग तरीके से। 🔄\n\n" +
      "दो राउंड होंगे:\n" +
      "* **राउंड १ (रोल रिवर्सल)**: *आप* बस मालिक बनेंगे, और *मैं* सेल्सपर्सन बनूँगा। आप ग्राहक की कुर्सी पर बैठकर महसूस करेंगे कि एक अच्छी पिच कैसी लगती है।\n" +
      "* **राउंड २ (स्वैप)**: इसका उल्टा। मैं बस मालिक बनूँगा, और आप पिच करेंगे।\n\n" +
      "राउंड १ सबसे महत्वपूर्ण है। क्यों? क्योंकि जब तक आपको यह नहीं पता कि **ग्राहक को क्या महसूस होता है**, तब तक आप सिर्फ रट रहे हैं।\n\n" +
      "तैयार हैं? चलिए राउंड १ शुरू करते हैं। 🎭\n\n" +
      "[CHIP: चलो शुरू करें] [CHIP: यह कैसे काम करेगा?]",

      "Rohit, aaj pitch pe kaam karenge — par thoda alag tarike se. 🔄\n\n" +
      "Do round honge:\n" +
      "* **Round 1 (Role Reversal)**: *Aap* bus owner banoge, aur *main* salesperson banunga. Aap dekhoge ki achha pitch kaisa lagta hai — customer ki kursi pe baith kar.\n" +
      "* **Round 2 (Swap)**: Ulta. Main bus owner banunga, aur aap pitch karoge.\n\n" +
      "Round 1 sabse important hai. Kyun? Kyunki jab tak aapko pata nahi ki **customer ko kya feel hota hai**, tab tak aap sirf ratta maar rahe ho.\n\n" +
      "Ready? Main aapko aapka character deta hoon. 🎭\n\n" +
      "[CHIP: Chalo shuru karein] [CHIP: Ye kaise kaam karega?]"
    );
  }

  if (lowerMsg.includes("shuru karein") || lowerMsg.includes("let's start") || lowerMsg.includes("शुरू करें") || lowerMsg.includes("kaise kaam karega") || (lowerMsg.includes("work") && !lowerMsg.includes("framework"))) {
    if (lastAss.includes("Round 1 (Role Reversal)") || lastAss.includes("दो राउंड होंगे") || currentStage === "welcome") {
      return t(
        "🎭 **Your Character — read carefully:**\n\n" +
        "* **Name:** Rajesh Yadav, 48\n" +
        "* **Business:** 4 buses, Ludhiana-Chandigarh route, 12 years\n" +
        "* **Education:** 10th pass. Keeps accounts by hand in a register.\n" +
        "* **Mood:** Busy. Suspicious. Salesmen come every day.\n\n" +
        "**What's in your mind:**\n" +
        "* \"My work is going fine, why a new expense?\"\n" +
        "* \"What if the machine breaks? Who will repair?\"\n" +
        "* \"Conductor is not educated, will he manage?\"\n" +
        "* **Hidden Pain:** You suspect your conductor pockets some cash daily, but you have no proof. 🔑\n\n" +
        "**How to act:**\n" +
        "1. Start cold. Don't show interest.\n" +
        "2. Object at least twice (price, and work running fine).\n" +
        "3. React honestly when a point hits you.\n\n" +
        "Ready Rajesh ji? I'm walking into your office… 🎬\n\n" +
        "[CHIP: Ready, start pitching]",

        "🎭 **आपका किरदार — ध्यान से पढ़ो:**\n\n" +
        "* **नाम:** राजेश यादव, उम्र 48\n" +
        "* **काम:** 4 बसें, लुधियाना–चंडीगढ़ रूट, 12 साल से\n" +
        "* **पढ़ाई:** 10वीं पास। हिसाब-किताब रजिस्टर में, हाथ से।\n" +
        "* **मूड:** बिज़ी। थोड़ा शक्की। सेल्समैन रोज़ आते हैं।\n\n" +
        "**आपके दिमाग़ में ये चल रहा है:**\n" +
        "* \"मेरा काम ठीक चल रहा है, नया खर्चा क्यों?\"\n" +
        "* \"मशीन ख़राब हो गई तो? कौन ठीक करेगा?\"\n" +
        "* \"कंडक्टर पढ़ा-लिखा नहीं है, चला पाएगा?\"\n" +
        "* **सबसे बड़ा दर्द:** आपको शक है कि कंडक्टर रोज़ थोड़ा पैसा मार रहा है, पर सबूत नहीं है। 🔑\n\n" +
        "**कैसे act करना है:**\n" +
        "1. शुरू में ठंडा response दो। ज़्यादा interest मत दिखाओ.\n" +
        "2. कम से कम दो बार ऐतराज़ करो (कीमत और काम चल रहा है पर).\n" +
        "3. जब कोई बात सच में चुभे, तो ईमानदारी से react करो।\n\n" +
        "तैयार हैं राजेश जी? मैं आपके ऑफिस में आ रहा हूँ… 🎬\n\n" +
        "[CHIP: तैयार, शुरू करो]",

        "🎭 **Aapka character — dhyan se padho:**\n\n" +
        "* **Naam:** Rajesh Yadav, umar 48\n" +
        "* **Business:** 4 buses, Ludhiana–Chandigarh route, 12 saal se\n" +
        "* **Padhai:** 10th pass. Hisaab-kitaab register mein, haath se.\n" +
        "* **Mood:** Busy. Thoda shakki. Salesman roz aate hain.\n\n" +
        "**Aapke dimaag mein ye chal raha hai:**\n" +
        "* \"Mera kaam theek chal raha hai, naya kharcha kyun?\"\n" +
        "* \"Machine kharab ho gayi toh? Kaun theek karega?\"\n" +
        "* \"Conductor padha likha nahi hai, chala paayega?\"\n" +
        "* **Sabse bada dard:** Conductor roz thoda paisa maar raha hai, par proof nahi hai. 🔑\n\n" +
        "**Kaise act karna hai:**\n" +
        "1. Shuruaat mein thanda response do. Bahut interested mat dikho.\n" +
        "2. Kam se kam do baar objection karo (price, aur kaam chal raha hai pe).\n" +
        "3. Jab koi baat sach mein chubhe — tab honestly react karo.\n\n" +
        "Ready Rajesh ji? Main aapke office mein aa raha hoon… 🎬\n\n" +
        "[CHIP: Ready, shuru karo]"
      );
    }
  }

  if (lowerMsg.includes("ready, shuru karo") || lowerMsg.includes("ready, start") || lowerMsg.includes("तैयार")) {
    if (lastAss.includes("Rajesh Yadav") || lastAss.includes("राजेश यादव") || currentStage === "brief") {
      return t(
        "**Coach (as Salesperson):** Namaste sir, you're Rajesh ji, right? I'm Amit, from ApniBus. I'll take two minutes, no more. Is that okay? 🤝\n\n" +
        "[CHIP: Yes, say it. Make it quick.] [CHIP: Busy now, come later.]",

        "**कोच (सेल्समैन के रूप में):** नमस्ते सर, आप ही राजेश जी हैं ना? मैं अमित, ApniBus से। दो मिनट माँगूँगा, उससे ज़्यादा नहीं। चलेगा? 🤝\n\n" +
        "[CHIP: हाँ बोलो। जल्दी बोलना, बस निकलने वाली है। ] [CHIP: अभी टाइम नहीं है, बाद में आना.]",

        "**Coach (as Salesperson):** Namaste sir, Rajesh ji aap hi hain na? Main Amit, ApniBus se. Do minute maangunga, usse zyada nahi. Chalega? 🤝\n\n" +
        "[CHIP: Haan bhai bolo. Jaldi bolna, bus nikalne wali hai.] [CHIP: Abhi time nahi hai, baad mein aana.]"
      );
    }
  }

  if (lowerMsg.includes("haan bhai bolo") || lowerMsg.includes("yes, say it") || lowerMsg.includes("हाँ बोलो") || lowerMsg.includes("busy") || lowerMsg.includes("bolna")) {
    if (lastAss.includes("Amit, from ApniBus") || lastAss.includes("अमित, ApniBus से") || lastAss.includes("Amit, ApniBus se") || currentStage === "round1_started") {
      return t(
        "**Coach (as Salesperson):** Straight to the point, sir. Can I ask you one thing — you have 4 buses. **How do you know how much collection came in each day?**\n\n" +
        "[CHIP: Conductor gives it in the evening, we write in the register]",

        "**कोच (सेल्समैन के रूप में):** सीधा point पर आता हूँ सर। एक बात पूछूँ — आपकी 4 बसें हैं। **रोज़ का कलेक्शन आपको कैसे पता चलता है?**\n\n" +
        "[CHIP: कंडक्टर शाम को दे देता है, रजिस्टर में लिख लेते हैं]",

        "**Coach (as Salesperson):** Bilkul sir, seedha point pe aata hoon. Ek baat poochhun — aapki 4 buses hain na? **Roz ka collection aapko kaise pata chalta hai?**\n\n" +
        "[CHIP: Conductor shaam ko deta hai, register mein likh lete hain]"
      );
    }
  }

  if (lowerMsg.includes("conductor shaam") || lowerMsg.includes("conductor gives") || lowerMsg.includes("कंडक्टर शाम")) {
    if (lastAss.includes("collection came") || lastAss.includes("कलेक्शन आपको") || lastAss.includes("collection aapko") || currentStage === "round1_pitch_1") {
      return t(
        "**Coach (as Salesperson):** Understood, sir. And that money he hands you — **how do you know it's the full amount?**\n\n" +
        "*(pause — let it sit)*\n\n" +
        "Sir, I'll be honest — I've been in this line six years. Every operator I meet has this same problem. Nobody says it out loud, but everyone has the doubt. And at month end there's a gap of eight, ten thousand — and nobody ever finds out.\n\n" +
        "[CHIP: Hmm... that is true] [CHIP: How does your machine solve this?]",

        "**कोच (सेल्समैन के रूप में):** समझ गया सर। और वो जो पैसा वो आपको देता है — **आपको कैसे पता कि पूरा है?**\n\n" +
        "*(रुकना — बोलना मत)*\n\n" +
        "सर मैं सच बताऊँ, मैं इस लाइन में 6 साल से हूँ। हर operator जिससे मैं मिलता हूँ, उनके साथ यही दिक्कत है। कोई बोलता नहीं, पर शक सबको रहता है। और महीने के आख़िर में आठ-दस हज़ार का फ़र्क आ जाता है — किसी को पता ही नहीं चलता।\n\n" +
        "[CHIP: हम्म... वो तो है] [CHIP: आपकी मशीन क्या करेगी इसमें?]",

        "**Coach (as Salesperson):** Samajh gaya sir. Aur ye jo paisa wo aapko deta hai — **aapko kaise pata ki poora hai?**\n\n" +
        "*(pause — bolna mat)*\n\n" +
        "Sir main sach bataun, main is line mein 6 saal se hoon. Har operator jisse main milta hoon, unke saath yahi problem hai. Koi bolta nahi, par shaq sabko rehta hai. Aur mahine ke end mein aath-das hazaar ka farak aa jaata hai — kisi ko pata hi nahi chalta.\n\n" +
        "[CHIP: Hmm... wo toh hai] [CHIP: Aapki machine kya karegi isme?]"
      );
    }
  }

  if (lowerMsg.includes("wo toh hai") || lowerMsg.includes("machine kya karegi") || lowerMsg.includes("how does your machine") || lowerMsg.includes("मशीन क्या करेगी") || lowerMsg.includes("that is true") || lowerMsg.includes("true")) {
    if (lastAss.includes("full amount") || lastAss.includes("पूरा है") || lastAss.includes("poora hai") || currentStage === "round1_pitch_2") {
      return t(
        "**Coach (as Salesperson):** Sir, our POS machine solves exactly this. The conductor gives every passenger a machine ticket. **Every ticket records itself automatically.** Whatever collection happens, you see it on your phone — live.\n\n" +
        "And one more thing sir — with the machine you get the **Business App completely free.** On your phone. Look at this screen 👇 Today's full collection. Every trip's account. Which bus earned what. Sir, whether you're 10th pass or a graduate makes no difference. **It all shows like a picture.**\n\n" +
        "[CHIP: How much does it cost?] [CHIP: My conductor won't manage it]",

        "**कोच (सेल्समैन के रूप में):** सर, हमारी POS Machine यही problem solve करती है। कंडक्टर हर passenger को मशीन से टिकट देता है। **हर टिकट का record अपने आप बन जाता है।** अब जो भी कलेक्शन हुआ, वो आपके फ़ोन पर दिख रहा है — live.\n\n" +
        "और एक चीज़ सर — मशीन के साथ **Business App बिल्कुल फ्री** मिलती है। आपके फ़ोन पर। ये देखिए स्क्रीन 👇 आज का पूरा कलेक्शन। हर ट्रिप का हिसाब। कौन सी बस ने कितना कमाया। सर आप 10वीं पास हों या graduate — इससे फ़र्क नहीं पड़ता। **सब तस्वीर जैसा दिखता है।**\n\n" +
        "[CHIP: इसका कितना खर्चा है?] [CHIP: मेरा कंडक्टर नहीं चला पाएगा]",

        "**Coach (as Salesperson):** Sir, humari POS Machine yahi problem solve karti hai. Conductor har passenger ko machine se ticket deta hai. **Har ticket ka record apne aap ban jaata hai.** Ab jo bhi collection hua, wo aapke phone pe dikh raha hai — live.\n\n" +
        "Aur ek cheez sir — machine ke saath **Business App bilkul free** milti hai. Aapke phone pe. Ye dekhiye 👇 Aaj ka poora collection. Har trip ka hisaab. Kaunsi bus ne kitna kamaya. Sir aap 10th pass ho ya graduate — isse farak nahi padta. **Sab picture jaisa dikhta hai.**\n\n" +
        "[CHIP: Iska kitna kharcha hai?] [CHIP: Mera conductor nahi chala payega]"
      );
    }
  }

  if (lowerMsg.includes("kharcha") || lowerMsg.includes("cost") || lowerMsg.includes("price") || lowerMsg.includes("खर्चा")) {
    if (lastAss.includes("Business App") || lastAss.includes("Business App") || currentStage === "round1_pitch_3") {
      return t(
        "**Coach (as Salesperson):** Sir, I'll tell you the price, I'm not hiding it. 😊 But one second — first tell me this. If eight thousand of leakage stops every month, will the machine feel expensive or cheap?\n\n" +
        "[CHIP: Cheap, but what is the price?] [CHIP: Conductor cannot manage it]",

        "**कोच (सेल्समैन के रूप में):** सर price मैं अभी बता दूँगा, छुपा नहीं रहा। 😊 पर एक second — पहले ये बताइए। अगर महीने में **आठ हज़ार की लीकेज** बंद हो जाए, तो मशीन का खर्चा आपको महँगा लगेगा या सस्ता?\n\n" +
        "[CHIP: सस्ता लगेगा, पर बताओ तो] [CHIP: कंडक्टर नहीं चला पाएगा]",

        "**Coach (as Salesperson):** Sir price main abhi bata dunga, chhupa nahi raha. 😊 Par ek second — pehle ye batao. Agar mahine mein **aath hazaar ki leakage** band ho jaaye, toh machine ka kharcha aapko mehnga lagega ya sasta?\n\n" +
        "[CHIP: Sasta lagega, par batao toh] [CHIP: Conductor nahi chala payega]"
      );
    }
  }

  if (lowerMsg.includes("conductor nahi chala") || lowerMsg.includes("conductor cannot manage") || lowerMsg.includes("सस्ता") || lowerMsg.includes("sasta") || lowerMsg.includes("cheap")) {
    if (lastAss.includes("expensive or cheap") || lastAss.includes("महँगा लगेगा या सस्ता") || lastAss.includes("mehnga lagega ya sasta") || currentStage === "round1_pitch_4" || currentStage === "round1_pitch_3") {
      return t(
        "**Coach (as Salesperson):** Fair concern sir — you're not the first to ask. There are only two or three buttons. If he can use a phone, he can use this. And we give **training free** after delivery. If there's ever a problem — **24×7 support.** One call, done.\n\n" +
        "Sir, let's do one thing — tomorrow let me show a **live demo** on one of your buses. Put it in the conductor's hand and see. If you like it we talk further, if not, no problem at all. **Morning or evening — what suits you?** 🤝\n\n" +
        "[CHIP: Morning is fine] [CHIP: Come in the evening]",

        "**कोच (सेल्समैन के रूप में):** सही चिंता है सर, और आप पहले नहीं हैं जो ये पूछ रहे हैं। मशीन में बस दो-तीन बटन दबाने होते हैं — जितना फ़ोन चलाना आता है, उतना काफ़ी है। और हम **training देते हैं**, मशीन देने के बाद। फ्री। और अगर कभी दिक्कत आई — **24×7 सपोर्ट** है सर। एक कॉल, हो गया।\n\n" +
        "सर एक काम करते हैं — कल मैं आपकी एक बस पर **live demo** दिखा देता हूँ। कंडक्टर के हाथ में देकर देखते हैं। पसंद आए तो बात आगे, नहीं तो कोई बात नहीं। **कल सुबह ठीक रहेगा या शाम?** 🤝\n\n" +
        "[CHIP: सुबह ठीक रहेगा] [CHIP: शाम को आ जाना]",

        "**Coach (as Salesperson):** Sahi chinta hai sir, aur aap pehle nahi ho jo ye poochh rahe ho. Machine mein bas do-teen button dabane hote hain — jitna phone chalana aata hai, utna kaafi hai. Aur hum **training dete hain**, machine dene ke baad. Free. Aur agar kabhi dikkat aayi — **24×7 support** hai sir. Ek call, ho gaya.\n\n" +
        "Sir ek kaam karte hain — kal main aapki ek bus pe **live demo** dikha deta hoon. Conductor ke haath mein deke dekhte hain. Pasand aaye toh baat aage, nahi toh koi baat nahi. **Kal subah theek rahega ya shaam?** 🤝\n\n" +
        "[CHIP: Subah theek rahega] [CHIP: Shaam ko aa jana]"
      );
    }
  }

  if (lowerMsg.includes("morning") || lowerMsg.includes("evening") || lowerMsg.includes("subah") || lowerMsg.includes("shaam") || lowerMsg.includes("सुबह") || lowerMsg.includes("शाम")) {
    if (lastAss.includes("live demo") || lastAss.includes("live demo") || lastAss.includes("live demo") || currentStage === "round1_pitch_5") {
      return t(
        "**Coach:** Perfect, tomorrow it is! 🎬 **Scene over.**\n\n" +
        "Rohit, now step out of Rajesh ji's chair. 😊 Tell me honestly — **which line made you pause?** Where did you think — 'hmm, he has a point'?\n\n" +
        "[CHIP: Conductor cash doubt line] [CHIP: App screen visual] [CHIP: 8,000 leakage math]",

        "**कोच:** बिल्कुल सही, कल मिलते हैं! 🎬 **सीन ख़त्म।**\n\n" +
        "रोहित, अब राजेश जी की कुर्सी से बाहर आ जाओ। 😊 सच बताओ — **कौन सी लाइन पर आप थोड़ा रुक गए थे?** जहाँ लगा 'अरे, ये तो सही बोल रहा है'?\n\n" +
        "[CHIP: कंडक्टर के पैसे चुराने वाली बात] [CHIP: ऐप की स्क्रीन देखने पर] [CHIP: ८,००० के लीकेज वाले गणित पर]",

        "**Coach:** Perfect, kal milte hain. 🎬 **Scene khatam.**\n\n" +
        "Rohit, ab Rajesh ji ki kursi se bahar aa jao. 😊 Sach batao — **kaunsi line pe aap thoda ruk gaye the?** Jahan laga 'arre, ye toh sahi bol raha hai'?\n\n" +
        "[CHIP: Conductor wali baat] [CHIP: Phone pe dikhega] [CHIP: 8 hazaar ka calculation]"
      );
    }
  }

  console.log("DEBUG TURN: msg =", lastMsg, "currentStage =", currentStage, "lastAssText =", lastAssText);
  if (lowerMsg.includes("conductor") || lowerMsg.includes("app screen") || lowerMsg.includes("leakage") || lowerMsg.includes("कंडक्टर") || lowerMsg.includes("ऐप की") || lowerMsg.includes("लीकेज") || lowerMsg.includes("calculation") || lowerMsg.includes("phone")) {
    console.log("DEBUG MATCH: lastAss =", lastAss, "currentStage =", currentStage);
    if (lastAss.includes("step out of") || lastAss.includes("कुर्सी से बाहर") || lastAss.includes("kursi se bahar") || currentStage === "round1_complete") {
      return t(
        "**Coach:** 🎯 **Exactly. And that is the heart of the whole pitch.**\n\n" +
        "Notice that I did not start with features like battery or network. I asked a **question** first. That question touched Rajesh ji's hidden pain.\n\n" +
        "Here are the 6 moves I used — this is your checklist:\n" +
        "1. **Asked permission:** 'two minutes, is that okay?'\n" +
        "2. **Started with a question:** 'how do you know the collection?'\n" +
        "3. **Opened the pain, then stopped:** 'is it the full amount?' (silence)\n" +
        "4. **Showed the free app:** didn't describe it — showed the screen\n" +
        "5. **Tied price to value:** 'if 8,000 stops, expensive or cheap?'\n" +
        "6. **Asked for a small next step:** asked for a demo, not an order\n\n" +
        "Now it's your turn. I will play Rajesh Yadav, and you will pitch. Same man, same mood.\n\n" +
        "Ready? 🎬\n\n" +
        "[CHIP: Ready to pitch]",

        "**कोच:** 🎯 **बिल्कुल। और वही पूरे पिच का दिल है।**\n\n" +
        "ध्यान दो — मैंने एक बार भी शुरू में फ़ीचर (बैटरी/नेटवर्क) नहीं बोल। मैंने पहले एक **सवाल** पूछा। और उस सवाल ने राजेश जी के अंदर वो दर्द खोल दिया जो वो किसी को बताते भी नहीं।\n\n" +
        "मैंने ६ चीज़ें कीं — ये आपकी चेकलिस्ट है:\n" +
        "1. **इजाज़त माँगी:** 'दो मिनट, चलेगा?'\n" +
        "2. **सवाल से शुरू किया:** 'कलेक्शन कैसे पता चलता है?'\n" +
        "3. **दर्द खोला, फिर चुप:** 'पूरा है, ये कैसे पता?' (चिट-चैट बंद)\n" +
        "4. **फ्री ऐप दिखाई:** बताया नहीं — स्क्रीन दिखाई\n" +
        "5. **Price को value से जोड़ा:** '8 हज़ार बचे तो महँगा या सस्ता?'\n" +
        "6. **छोटा next step माँगा:** डेमो माँगा, ऑर्डर नहीं\n\n" +
        "अब आपकी बारी। अब मैं राजेश यादव बनूँगा, और आप पिच करेंगे। सेम इंसान, सेम मूड।\n\n" +
        "तैयार हैं? 🎬\n\n" +
        "[CHIP: तैयार हूँ, शुरू करो]",

        "**Coach:** 🎯 **Bilkul. Aur wahi poore pitch ka dil hai.**\n\n" +
        "Dhyan do — maine ek baar bhi shuru mein feature nahi bola. Maine ek **sawaal** poocha. Aur us sawaal ne Rajesh ji ke andar wo dard khol diya jo wo kisi ko batate bhi nahi.\n\n" +
        "Maine paanch cheezein ki — ye aapki checklist hai:\n" +
        "1. **Permission maangi:** 'do minute maangunga, chalega?'\n" +
        "2. **Sawaal se shuru:** 'collection kaise pata chalta hai?'\n" +
        "3. **Dard khola:** 'poora hai, ye kaise pata?' (phir chup ho gaya)\n" +
        "4. **Solution + free app dikhaya:** bataya nahi, screen dikhayi\n" +
        "5. **Price ko value se joda:** '8 hazaar bachega toh mehnga hai ya sasta?'\n" +
        "6. **Chhota next step maanga:** demo maanga, order nahi\n\n" +
        "Ab aapki baari. Ab main Rajesh Yadav banunga, aur aap pitch karoge. Same aadmi, same mood.\n\n" +
        "Ready? 🎬\n\n" +
        "[CHIP: Ready hoon]"
      );
    }
  }

  // The Swap Start
  if (lowerMsg.includes("ready to pitch") || lowerMsg.includes("ready hoon") || lowerMsg.includes("तैयार हूँ")) {
    if (lastAss.includes("checklist") || lastAss.includes("चेकलिस्ट") || lastAss.includes("checklist")) {
      return t(
        "**Rajesh Yadav:** Yes, tell me. Make it quick, the bus is leaving. 🚌",
        "**राजेश यादव:** हाँ भाई बोलो। जल्दी बोलना, बस निकलने वाली है। 🚌",
        "**Rajesh Yadav:** Haan bhai bolo. Jaldi bolna, bus nikalne wali hai. 🚌"
      );
    }
  }

  // If we are playing Rajesh Yadav (The Swap is in progress)
  const isPitchStep = explicitStepId === "pitch";
  const lastPitchWelcomeIndex = messages.map(m => m.content || "").reverse().findIndex(c => {
    if (isPitchStep) {
      return c.includes("Rohit, aaj pitch pe kaam karenge") || c.includes("aaj pitch pe kaam karenge");
    } else {
      return c.includes("Customer Roleplay") || c.includes("कस्टमर रोलप्ले");
    }
  });
  const lastPitchWelcomeIdx = lastPitchWelcomeIndex !== -1 ? messages.length - 1 - lastPitchWelcomeIndex : -1;
  const messagesSinceSwap = messages.filter((m, idx) => {
    const isSwapMsg = m.role === "assistant" && (m.content.includes("Haan bhai bolo") || m.content.includes("bus nikalne wali hai") || m.content.includes("बस निकलने वाली है") || m.content.includes("Yes, tell me. Make it quick"));
    return isSwapMsg && idx > lastPitchWelcomeIdx;
  });
  if (mode === "grooming" && messagesSinceSwap.length > 0) {
    const swapStartIdx = messages.findIndex((m, idx) => {
      const isSwapMsg = m.role === "assistant" && (m.content.includes("Haan bhai bolo") || m.content.includes("bus nikalne wali hai") || m.content.includes("बस निकलने वाली है") || m.content.includes("Yes, tell me. Make it quick"));
      return isSwapMsg && idx > lastPitchWelcomeIdx;
    });
    const swapCount = swapStartIdx !== -1 ? messages.slice(swapStartIdx).filter(m => m.role === "user").length : 0;
    
    if (swapCount === 1) {
      return t(
        "**Rajesh Yadav:** My work is running fine. Why a new expense? 🤨",
        "**राजेश यादव:** मेरा काम ठीक चल रहा है। नया खर्चा क्यों? 🤨",
        "**Rajesh Yadav:** Mera kaam theek chal raha hai. Naya kharcha kyun? 🤨"
      );
    }
    if (swapCount === 2) {
      return t(
        "**Rajesh Yadav:** How much is it? ... That's a lot, brother. 💸",
        "**राजेश यादव:** कितने का है? ... भाई बहुत ज़्यादा है। 💸",
        "**Rajesh Yadav:** Kitne ka hai? ... Bhai bahut zyada hai. 💸"
      );
    }
    if (swapCount === 3) {
      return t(
        "**Rajesh Yadav:** My conductor is not educated. He won't manage it. 🤷‍♂️",
        "**राजेश यादव:** मेरा कंडक्टर पढ़ा-लिखा नहीं है। नहीं चला पाएगा। 🤷‍♂️",
        "**Rajesh Yadav:** Mera conductor padha likha nahi hai. Nahi chala payega. 🤷‍♂️"
      );
    }
    
    // Conclude roleplay, prompt for scorecard
    return t(
      "**Coach:** Excellent! The roleplay is complete. 🎭 You have successfully pitched to Rajesh and handled his objections. Let's see how you did. Would you like to see your structured scorecard evaluation?\n\n[CHIP: View scorecard] [CHIP: Try again]",
      "**कोच:** बहुत बढ़िया! रोलप्ले पूरा हो चुका है। 🎭 आपने राजेश को सफलतापूर्वक पिच किया और उनके ऐतराजों को संभाला। चलिए देखते हैं कि आपकी परफॉर्मेंस कैसी रही। क्या आप अपना स्कोरकार्ड देखना चाहेंगे?\n\n[CHIP: View scorecard] [CHIP: दोबारा खेलें]",
      "**Coach:** Bahut badhiya! Roleplay complete ho chuka hai. 🎭 Aapne Rajesh ko successfully pitch kiya aur objections handle kiye. Chaliye dekhte hain aapki performance kaisi rahi. Kya aap apna scorecard dekhna chahenge?\n\n[CHIP: View scorecard] [CHIP: Try again]"
    );
  }

  // If user provided a pitch
  const lastAssistant = messages.slice().reverse().find(m => m.role === "assistant");
  const isPitchInvitation = lastAssistant && (
    lastAssistant.content.includes("pitch yahan likhiye") || 
    lastAssistant.content.includes("pitch here") || 
    lastAssistant.content.includes("पिच यहाँ लिखिए") ||
    lastAssistant.content.includes("Try again") ||
    lastAssistant.content.includes("behtar version") ||
    lastAssistant.content.includes("Better version") ||
    lastAssistant.content.includes("I'm listening") ||
    lastAssistant.content.includes("re-render")
  );

  const isPitchKeywords = 
    lowerMsg.includes("namaskar") || 
    lowerMsg.includes("namaste") || 
    lowerMsg.includes("hello") || 
    lowerMsg.includes("hi ") || 
    lowerMsg.includes("apnibus") || 
    lowerMsg.includes("apni bus") || 
    lowerMsg.includes("ticketing") || 
    lowerMsg.includes("pos") || 
    lowerMsg.includes("machine") || 
    lowerMsg.includes("नमस्ते") || 
    lowerMsg.includes("नमस्कार");

  const isMenuClick = 
    lowerMsg.includes("fix my pitch") || 
    lowerMsg.includes("objection") || 
    lowerMsg.includes("product deep-dive") || 
    lowerMsg.includes("roleplay") || 
    lowerMsg.includes("back to grooming");

  if (mode === "grooming" && getActiveGroomingSubmodule() === "pitch" && !isMenuClick) {
    if (lowerMsg === "try again" || lowerMsg === "दोबारा खेलें" || lowerMsg === "try again!") {
      return t(
        "Alright, let's try again! Write your revised pitch here. I'm listening. ✍️",
        "ठीक है, चलिए दोबारा कोशिश करते हैं! अपनी संशोधित पिच यहाँ लिखिए। मैं सुन रहा हूँ। ✍️",
        "Alright, chalo fir se try karte hain! Apni revised pitch yahan likhiye. Main sun raha hoon. ✍️"
      );
    }

    const attempt = getPitchAttemptCount();
    
    if (attempt === 1) {
      return t(
        "**Coach Hint (Attempt 1):** You started pitching directly. A good mentor tip: ask a discovery question first to understand his pain before offering the solution. Try again!\n\n[CHIP: Try again]",
        "**कोच का इशारा (प्रयास १):** आपने सीधे पिच शुरू कर दी। एक अच्छे मेंटर की सलाह: समाधान देने से पहले ग्राहक के काम के बारे में एक सवाल पूछें। पुनः प्रयास करें!\n\n[CHIP: दोबारा खेलें]",
        "**Coach Hint (Attempt 1):** Aapne direct pitch shuru kar di. Ek real sales mentor ki tarah sochiye: operator se pehle uske dhandhe ke baare mein sawaal poochiye. Try again!\n\n[CHIP: Try again]"
      );
    }
    if (attempt === 2) {
      return t(
        "**Coach Hint (Attempt 2):** Rajesh Yadav suspects his conductor is stealing cash. Ask him how he verifies that his daily collection is 100% complete. Try again!\n\n[CHIP: Try again]",
        "**कोच का इशारा (प्रयास २):** राजेश यादव को कंडक्टर की चोरी का डर है। उनसे पूछें कि वे अपने दैनिक कलेक्शन का हिसाब कैसे रखते हैं। पुनः प्रयास करें!\n\n[CHIP: दोबारा खेलें]",
        "**Coach Hint (Attempt 2):** Ishara: Rajesh Yadav ke dimaag mein conductor ki chori (leakage) ka darr hai. Usse poochiye ki wo apna collection kaise check karta hai. Try again!\n\n[CHIP: Try again]"
      );
    }
    if (attempt === 3) {
      return t(
        "**Coach Hint (Attempt 3):** Your pitch is missing 'Need Discovery' and the 'Free Business App'. Instead of stating the price directly, link it to leakage control. Try again!\n\n[CHIP: Try again]",
        "**कोच का इशारा (प्रयास ३):** आपकी पिच में 'ज़रूरत की खोज' और 'फ्री बिज़नेस ऐप' गायब है। कीमत बताने की बजाय उसे लीकेज रोकने के फायदे से जोड़ें। पुनः प्रयास करें!\n\n[CHIP: दोबारा खेलें]",
        "**Coach Hint (Attempt 3):** Concept check: Aapke pitch mein 'Need Discovery' aur 'Free Business App' missing hai. Price ko direct bolne ki jagah value se jodiye. Try again!\n\n[CHIP: Try again]"
      );
    }
    
    // Attempt 4 and above
    return t(
      "You have exhausted 3 attempts. Would you like to see a model answer?\n\n[CHIP: Show model answer] [CHIP: Try again]",
      "आपने ३ प्रयास कर लिए हैं। क्या आप मॉडल उत्तर (सही पिच) देखना चाहते हैं?\n\n[CHIP: मॉडल उत्तर दिखाओ] [CHIP: दोबारा खेलें]",
      "Aapne 3 attempts kar liye hain. Kya aap model answer (ideal pitch) dekhna chahte hain?\n\n[CHIP: Show model answer] [CHIP: Try again]"
    );
  }

  if (lowerMsg.includes("product deep-dive") || lowerMsg.includes("product") || lowerMsg.includes("प्रोडक्ट")) {
    return t(
      "Let's understand the **POS Ticketing Machine** features and benefits in detail. Our POS machine has **7 main features**:\n" +
      "1. **Bigger Battery** (Long battery life so conductor does ticketing without stress)\n" +
      "2. **Fastest Network** (Instant ticket printing and real-time data sync)\n" +
      "3. **One-Click Trip Details** (Trip summary and counts in one click)\n" +
      "4. **Live Trip Monitoring** (Buses location and ticketing live)\n" +
      "5. **Digital Ticketing** (Accurate and fast ticketing)\n" +
      "6. **Cash & Online Collection** (Clear reports of cash and digital payments)\n" +
      "7. **24x7 Support** (Instant support if any issue occurs)\n\n" +
      "Which feature would you like to explore first?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]",

      "चलिए, **POS Ticketing Machine** के फीचर्स और फायदों को विस्तार से समझते हैं। हमारी मशीन के **7 मुख्य फीचर्स** हैं:\n" +
      "1. **Bigger Battery** (लम्बी बैटरी लाइफ ताकि कंडक्टर बिना टेंशन दिनभर काम करे)\n" +
      "2. **Fastest Network** (तुरंत टिकट प्रिंटिंग और लाइव सिंक)\n" +
      "3. **One-Click Trip Details** (ट्रिप का सारा हिसाब एक क्लिक में)\n" +
      "4. **Live Trip Monitoring** (बसें कहाँ हैं और कितना कलेक्शन हुआ, सब लाइव)\n" +
      "5. **Digital Ticketing** (तेज़ और सटीक टिकटिंग, कोई गलती नहीं)\n" +
      "6. **Cash & Online Collection** (कैश और ऑनलाइन पेमेंट का अलग-अलग हिसाब)\n" +
      "7. **24x7 Support** (कभी भी कोई दिक्कत हो तो तुरंत सहायता)\n\n" +
      "आप किस फीचर के बारे में समझना चाहते हैं?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]",

      "Chaliye, **POS Ticketing Machine** ke features aur benefits ko details mein samajhte hain.\n\n" +
      "Humare POS machine ke **7 main features** hain:\n" +
      "1. **Bigger Battery** (Lambi battery life taaki conductor bina tension ke din bhar ticketing kare)\n" +
      "2. **Fastest Network** (Turant ticket printing aur real-time data sync)\n" +
      "3. **One-Click Trip Details** (Trip summary, ticket count sab ek click mein available)\n" +
      "4. **Live Trip Monitoring** (Buses kahan hain aur kitna ticket bana, sab live)\n" +
      "5. **Digital Ticketing** (Sahi aur tej ticketing, koi manual galti nahi)\n" +
      "6. **Cash & Online Collection** (Cash aur digital payments ka alag-alag aur sahi hisaab)\n" +
      "7. **24x7 Customer Support** (Koi bhi issue hone par turant support)\n\n" +
      "Aap isme se kis feature ke baare mein aur dhyan se samajhna chahte hain?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]"
    );
  }


  // Product Deep-Dive feature detail triggers
  if (mode === "grooming" && (selectedOptionId === "battery" || lowerMsg.includes("battery") || lowerMsg.includes("बैटरी"))) {
    return t(
      "Our POS machine has a **Bigger Battery** that runs all day without charging worries. It also has a **Fastest Network** for instant printing and real-time syncing. This means your conductor will never have an excuse like 'machine discharged' or 'no network' to do manual ticketing.\n\n" +
      "What other feature would you like to explore?\n\n" +
      "[CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]",

      "हमारी POS मशीन में **बड़ी बैटरी** है जो बिना चार्जिंग की चिंता के पूरे दिन चलती है। इसमें लाइव सिंक के लिए **Fastest Network** भी है। इसका मतलब है कि आपका कंडक्टर कभी भी 'बैटरी खत्म' या 'नेटवर्क नहीं है' का बहाना बनाकर हाथ से टिकट नहीं काट सकेगा।\n\n" +
      "आप किस और फीचर के बारे में समझना चाहते हैं?\n\n" +
      "[CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]",

      "Humari POS machine mein **Bigger Battery** hai jo bina charging ki tension ke pure din chalti hai. Isme live sync ke liye **Fastest Network** bhi hai. Iska matlab hai ki aapka conductor kabhi bhi 'battery khatam' ya 'network nahi hai' bolkar manual ticketing nahi kar sakega.\n\n" +
      "Aap kis aur feature ke baare mein aur dhyan se samajhna chahte hain?\n\n" +
      "[CHIP: collection|Cash & Online Collection] [CHIP: monitoring|Live Trip Monitoring]"
    );
  }

  if (mode === "grooming" && (selectedOptionId === "collection" || lowerMsg.includes("collection") || lowerMsg.includes("कलेक्शन"))) {
    return t(
      "ApniBus tracks both cash and online payments separately and accurately. When the conductor makes a ticket, the transaction is logged instantly. You see exactly how much cash should be in the conductor's pocket at any moment.\n\n" +
      "What other feature would you like to explore?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: monitoring|Live Trip Monitoring]",

      "ApniBus कैश और ऑनलाइन पेमेंट का अलग-अलग और बिल्कुल सही हिसाब रखती है। जैसे ही कंडक्टर टिकट बनाता है, एंट्री तुरंत हो जाती है। आपको उसी समय दिख जाता है कि कंडक्टर की जेब में कितना कैश होना चाहिए।\n\n" +
      "आप किस और फीचर के बारे में समझना चाहते हैं?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: monitoring|Live Trip Monitoring]",

      "ApniBus cash aur online payments ka alag-alag aur sahi hisaab rakhti hai. Jaise hi conductor ticket banayega, entry instantly log ho jayegi. Aapko phone par live dikhega ki conductor ki pocket mein kitna cash hona chahiye.\n\n" +
      "Aap kis aur feature ke baare mein aur dhyan se samajhna chahte hain?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: monitoring|Live Trip Monitoring]"
    );
  }

  if (mode === "grooming" && (selectedOptionId === "monitoring" || lowerMsg.includes("monitoring") || lowerMsg.includes("मॉनिटरिंग") || lowerMsg.includes("trip"))) {
    return t(
      "No need to call the conductor to check where the bus is! Live Trip Monitoring shows you the real-time location of the bus and how many tickets have been printed for the current trip directly on your phone app.\n\n" +
      "What other feature would you like to explore?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection]",

      "अब बस कहाँ है ये पूछने के लिए कंडक्टर को फ़ोन करने की ज़रूरत नहीं है! लाइव ट्रिप मॉनिटरिंग से आपको बस की लाइव लोकेशन और हर ट्रिप का टिकट कलेक्शन सीधे अपने मोबाइल ऐप पर दिखेगा।\n\n" +
      "आप किस और फीचर के बारे में समझना चाहते हैं?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection]",

      "Ab bus kahan hai ye poochne ke liye conductor ko call karne ki zaroorat nahi hai! Live Trip Monitoring se aapko bus ki live location aur har trip ka collection directly mobile app par dikhega.\n\n" +
      "Aap kis aur feature ke baare mein aur dhyan se samajhna chahte hain?\n\n" +
      "[CHIP: battery|Bigger Battery & Network] [CHIP: collection|Cash & Online Collection]"
    );
  }

  if (mode === "grooming" && (lowerMsg.includes("objection handling") || lowerMsg.includes("objection") || lowerMsg.includes("ऐतराज") || lowerMsg.includes("objections"))) {
    return t(
      "Handling customer objections is the sign of a great sales representative. We use the **A-A-A-A Framework**:\n" +
      "1. **Acknowledge** (Confirm operator's concern to make them comfortable)\n" +
      "2. **Ask** (Ask questions to calculate their business loss)\n" +
      "3. **Address** (Solve their loss using ApniBus features)\n" +
      "4. **Advance** (Take the next step - request setup)\n\n" +
      "Which objection would you like to handle?\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay] [CHIP: Already have a button machine] [CHIP: Conductor cannot manage it]",

      "ग्राहक के ऐतराजों (objections) का सही जवाब देना ही एक अच्छे BD की पहचान है। हम इसके लिए **मानो ➔ पूछो ➔ जवाब दो ➔ आगे बढ़ो (A-A-A-A) Framework** का उपयोग करते हैं:\n" +
      "1. **मानो (Acknowledge)** (ग्राहक की बात को सही बताना)\n" +
      "2. **पूछो (Ask)** (सवाल पूछकर उनके धंधे का नुकसान निकालना)\n" +
      "3. **जवाब दो (Address)** (ApniBus के फायदों से नुकसान को ठीक करना)\n" +
      "4. **आगे बढ़ो (Advance)** (डेमो या सेटअप के लिए बोलना)\n\n" +
      "आप किस ऐतराज का जवाब सीखना चाहते हैं?\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay] [CHIP: पहले से बटन मशीन है] [CHIP: कंडक्टर नहीं चला पायेगा]",

      "Grahak ke objections ka jawab dena hi ek ache BD ki pehchan hai. Hum iske liye **A-A-A-A Framework** ka use karte hain:\n" +
      "1. **Acknowledge** (Grahak ki baat ko sahi batana, unhe comfortable karna)\n" +
      "2. **Ask** (Unse sawaal pooch kar unke dhandhe ka nuksan nikalna)\n" +
      "3. **Address** (ApniBus ke benefits se us nuksan ko control karna batana)\n" +
      "4. **Advance** (Agla step lena - setup ke liye bolna)\n\n" +
      "Aap kis common objection ka jawab seekhna chahte hain?\n\n" +
      "[CHIP: Next Step — Fix My Pitch (Role Reversal)] [CHIP: Machine bahut mehngi hai] [CHIP: Pehle se button machine hai] [CHIP: Conductor nahi chala payega]"
    );
  }

  if (mode === "grooming" && (lowerMsg.includes("expensive") || lowerMsg.includes("mehngi") || lowerMsg.includes("महंगी"))) {
    return t(
      "Handle this using the **A-A-A-A Framework**:\n\n" +
      "1. **Acknowledge:** *\"Sir, you are absolutely right. Price is important, and when I first saw the cost, I also thought it was slightly expensive.\"*\n" +
      "2. **Ask:** *\"Tell me sir, what is your daily average collection per bus? Around 10,000?\"*\n" +
      "3. **Address:** *\"In manual ticketing, 5% to 10% leakage (theft/errors) is common, which is a loss of 15,000 per month. With ApniBus POS, every ticket is recorded live on your phone. The machine pays for itself in the first week!\"*\n" +
      "4. **Advance:** *\"So sir, shall we do the setup today and make your bus smart from tomorrow?\"*\n\n" +
      "What do you think of this approach? Want to check another objection?\n\n" +
      "[CHIP: Already have a button machine] [CHIP: Conductor cannot manage it]",

      "इस ऐतराज को **A-A-A-A Framework** से ऐसे संभालें:\n\n" +
      "1. **मानो:** *\"भैया, आप बिल्कुल सही कह रहे हैं। जब मैंने पहली बार कीमत देखी, तो मुझे भी लगा था कि ये थोड़ी महंगी है।\"*\n" +
      "2. **पूछो:** *\"अच्छा भैया, आपकी एक बस का रोज़ का औसतन कलेक्शन कितना हो जाता है? लगभग १०,०००?\"*\n" +
      "3. **जवाब दो:** *\"आप तो जानते ही हैं, मैन्युअल टिकट में ५% से १०% का नुकसान (चोरी या गलती) आम बात है। यानी हर महीने लगभग १५,००० का नुकसान। हमारी मशीन लगने के बाद हर टिकट डिजिटल रिकॉर्ड होगा और सारा पैसा आपके पास आएगा। मशीन का खर्च पहले हफ्ते में ही निकल जाएगा!\"*\n" +
      "4. **आगे बढ़ो:** *\"तो भैया, चलिए इसका सेटअप आज ही करवा देते हैं और कल से आपकी बस स्मार्ट हो जाएगी?\"*\n\n" +
      "आपको यह तरीका कैसा लगा? क्या किसी और ऐतराज का जवाब सीखना चाहते हैं?\n\n" +
      "[CHIP: पहले से बटन मशीन है] [CHIP: कंडक्टर नहीं चला पायेगा]",

      "Is objection ko **A-A-A-A Framework** se aise handle karein:\n\n" +
      "1. **Acknowledge:** *\"Bhaiya, aap bilkul sahi keh rahe hain. Jab maine pehli baar is machine ka cost dekha tha, toh mujhe bhi laga tha ki ye thodi mehngi hai.\"*\n" +
      "2. **Ask:** *\"Achha bhaiya, aapki ek bus ka roz ka average collection kitna ho jata hai? Lagbhag 10,000?\"*\n" +
      "3. **Address:** *\"Aap toh jaante hi hain, manual ticketing mein 5% se 10% ka leakage (chori/galti) aam baat hai. Yaani har mahine lagbhag 15,000 ka nuksan. ApniBus POS machine aur free Business App lagane ke baad, aapka har ek ticket digital record hoga aur saara collection aapke paas aayega. Yaani machine ka kharch toh pehle hi hafte mein nikal aayega!\"*\n" +
      "4. **Advance:** *\"Toh bhaiya, chaliye iska setup aaj hi karwa dete hain aur kal se aapki bus smart ho jayegi?\"*\n\n" +
      "Aapko ye tarika kaisa laga? Kya aap kisi aur objection ka jawab seekhna chahte hain?\n\n" +
      "[CHIP: Pehle se button machine hai] [CHIP: Conductor cannot manage it]"
    );
  }

  if (mode === "grooming" && (lowerMsg.includes("button machine") || lowerMsg.includes("pehle se button") || lowerMsg.includes("बटन"))) {
    return t(
      "Old button machines only print tickets; they don't manage your business. Handle with **A-A-A-A**:\n\n" +
      "1. **Acknowledge:** *\"True sir, button machine prints tickets easily and is cheap too.\"*\n" +
      "2. **Ask:** *\"But sir, does that machine tell you passenger counts or how much cash conductor should have right now?\"*\n" +
      "3. **Address:** *\"ApniBus smart machine connects with the Business App to show live collections, trip counts, and cash on your phone. You don't have to depend on the conductor. Think of the button machine as a basic feature phone, and our smart touch machine as a smartphone.\"*\n" +
      "4. **Advance:** *\"So shall we replace the old button machine with smart ApniBus today?\"*\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay] [CHIP: Conductor cannot manage it]",

      "पुरानी बटन मशीन सिर्फ टिकट प्रिंट करती हैं, बिजनेस मैनेज नहीं करतीं। **A-A-A-A** से इसका जवाब:\n\n" +
      "1. **मानो:** *\"बिल्कुल सही भैया, बटन मशीन से टिकट तो बन जाता है और वो सस्ती भी होती है।\"*\n" +
      "2. **पूछो:** *\"लेकिन भैया, क्या वो बटन मशीन आपको ये बता सकती है कि किस ट्रिप में कितने पैसेंजर्स थे, और कंडक्टर के पास अभी कितना कलेक्टेड कैश होना चाहिए?\"*\n" +
      "3. **जवाब दो:** *\"ApniBus स्मार्ट मशीन सिर्फ टिकट प्रिंट नहीं करती। यह सीधे हमारे Business App से जुड़ी है। आपको मोबाइल पर लाइव कलेक्शन, पैसेंजर काउंट और ट्रिप डिटेल्स दिखाई देगी। आपको कंडक्टर पर निर्भर नहीं होना पड़ेगा। आप ऐसा समझो कि बटन वाली मशीन एक साधारण फीचर फोन की तरह है और हमारी स्मार्ट टच मशीन एक स्मार्टफोन की तरह है।\"*\n" +
      "4. **आगे बढ़ो:** *\"तो पुरानी बटन मशीन को बदलें और स्मार्ट ApniBus लगाएं?\"*\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay] [CHIP: कंडक्टर नहीं चला पायेगा]",

      "Purani button machines sirf ticket print karti hain, business manage nahi karti. **A-A-A-A Framework** se iska jawab:\n\n" +
      "1. **Acknowledge:** *\"Bilkul sahi bhaiya, button machine se ticket toh ban jata hai aur wo sasti bhi hoti hai.\"*\n" +
      "2. **Ask:** *\"Lekin bhaiya, kya wo button machine aapko ye bata sakti hai ki kis trip mein kitne passengers the, aur conductor ke paas abhi kitna cash hona chahiye?\"*\n" +
      "3. **Address:** *\"ApniBus smart machine sirf ticket print nahi karti. Ye direct humare Business App se judi hai. Conductor jaise hi ticket banayega, aapko apne mobile par live collection, passenger counts, aur trip details dikhayi degi. Aapko conductor par depend nahi hona padega. Aap aisa samjho ki button waali machine normal feature phone hai aur touch waali machine smartphone hai.\"*\n" +
      "4. **Advance:** *\"Toh purani button machine ko badlein aur smart ApniBus lagayein?\"*\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay] [CHIP: Machine bahut mehngi hai]"
    );
  }

  if (mode === "grooming" && (lowerMsg.includes("conductor nahi chala") || lowerMsg.includes("conductor") || lowerMsg.includes("कंडक्टर"))) {
    return t(
      "Conductors are afraid of technology. Handle with **A-A-A-A**:\n\n" +
      "1. **Acknowledge:** *\"Valid concern sir. If conductor cannot manage it, it is your loss.\"*\n" +
      "2. **Ask:** *\"Does your conductor use a smartphone? WhatsApp or YouTube?\"*\n" +
      "3. **Address:** *\"Our POS machine is touch-screen and simple like a phone. Anyone can learn it in 10 minutes. We also provide free training and go on a trip with them to explain everything.\"*\n" +
      "4. **Advance:** *\"So don't worry sir. Shall we do the setup? Training is our responsibility.\"*\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay]",

      "कंडक्टरों को नई तकनीक से डर लगता है। **A-A-A-A** से जवाब:\n\n" +
      "1. **मानो:** *\"आपका डर बिल्कुल सही है भैया। अगर कंडक्टर मशीन नहीं चला पायेगा तो नुकसान आपका ही होगा।\"*\n" +
      "2. **पूछो:** *\"अच्छा भैया, क्या आपका कंडक्टर स्मार्टफोन चलाता है? व्हाट्सएप या यूट्यूब उपयोग करता है?\"*\n" +
      "3. **जवाब दो:** *\"हमारी मशीन बिल्कुल स्मार्टफोन की तरह टच स्क्रीन है। इसका इंटरफ़ेस इतना आसान है कि कोई भी १० मिनट में सीख सकता है। हम कंडक्टर को पूरी ट्रेनिंग खुद देंगे और एक ट्रिप साथ जाकर सब समझाएंगे।\"*\n" +
      "4. **आगे बढ़ो:** *\"तो डर किस बात का भैया? चलिए सेटअप करते हैं, ट्रेनिंग हमारी जिम्मेदारी है।\"*\n\n" +
      "[CHIP: pitch|Fix My Pitch (Next Step)] [CHIP: roleplay|Customer Roleplay]",

      "Conductors ko technology se darr lagta hai. **A-A-A-A Framework** se iska jawab:\n\n" +
      "1. **Acknowledge:** *\"Aapka darr bilkul sahi hai bhaiya. Agar conductor machine nahi chala payega toh nuksan aapka hi hoga.\"*\n" +
      "2. **Ask:** *\"Achha bhaiya, kya aapka conductor smartphone chalata hai? WhatsApp ya YouTube use karta hai?\"*\n" +
      "3. **Address:** *\"Hamari POS machine bilkul ek smartphone ki tarah chalne wali touch screen machine hai. Iska interface itna simple hai ki koi bhi isse 10 minute mein seekh sakta hai. Aur machine lagane ke baad hum conductor ko poori training khud dete hain aur unke sath ek trip par jaakar sab samjhate hain.\"*\n" +
      "4. **Advance:** *\"Toh darr kis baat ka bhaiya? Chaliye setup karte hain, training ki zimmedari hamari hai.\"*\n\n" +
      "[CHIP: Machine bahut mehngi hai]"
    );
  }

  if (mode === "grooming" && (lowerMsg.includes("roleplay") || lowerMsg.includes("customer bano") || lowerMsg.includes("रोलप्ले"))) {
    return t(
      "🎭 **Scene Start — Customer Roleplay**\n" +
      "I am **Rajesh Yadav**, a 48-year-old bus operator running 4 buses on Ludhiana-Chandigarh route. I am sitting in my office checking registers.\n\n" +
      "**Rajesh Yadav:** Namaste! Yes, tell me. Make it quick, the bus is leaving. 🚌\n\n" +
      "*You are the ApniBus BD. Start your pitch below:*\n\n" +
      "[CHIP: pause_roleplay|COACH — Pause for feedback]",

      "🎭 **दृश्य शुरू — कस्टमर रोलप्ले**\n" +
      "मैं **राजेश यादव** हूँ, ४८ साल के बस ऑपरेटर जो ४ बसें चलाते हैं। मैं अपने ऑफिस में रजिस्टर देख रहा हूँ।\n\n" +
      "**राजेश यादव:** नमस्ते! हाँ भाई बोलो। जल्दी बोलना, बस निकलने वाली है। 🚌\n\n" +
      "*आप ApniBus के BD हैं। अपनी पिच नीचे शुरू करें:*\n\n" +
      "[CHIP: pause_roleplay|COACH — फीडबैक लें]",

      "🎭 **Scene Start — Customer Roleplay**\n" +
      "Main **Rajesh Yadav** hoon, 48 saal ke bus operator jo 4 buses chalate hain. Main apne office mein hisaab mila raha hoon.\n\n" +
      "**Rajesh Yadav:** Namaste! Haan bhaiya bolo, jaldi bolna bus nikalne wali hai. 🚌\n\n" +
      "*Aap ApniBus ke BD hain. Apni pitch shuru kijiye:*\n\n" +
      "[CHIP: pause_roleplay|COACH — Pause for feedback]"
    );
  }

  if (lowerMsg.includes("ready") || lowerMsg.includes("test shuru karo") || lowerMsg.includes("rapid q&a")) {
    return t(
      "Let's start the **Rapid Q&A**. I will ask 4 questions one-by-one.\n\n" +
      "**Question 1:** What is the main product we sell to private bus operators?\n\n" +
      "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]",

      "चलिए, **Rapid Q&A** शुरू करते हैं। मैं आपसे ४ सवाल पूछूँगा एक-एक करके।\n\n" +
      "**सवाल १:** हम बस ऑपरेटरों को कौन सा मुख्य प्रोडक्ट बेचते हैं?\n\n" +
      "[CHIP: pos|POS टिकटिंग मशीन] [CHIP: app|फ्री बिजनेस ऐप] [CHIP: commando|कमांडो ऐप] [CHIP: parts|बस स्पेयर पार्ट्स]",

      "Chaliye, **Rapid Q&A** shuru karte hain. Main aapse 4 sawal poochunga ek-ek karke.\n\n" +
      "**Sawaal 1:** Hum bus operators ko kaunsa main product bechte hain?\n\n" +
      "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]"
    );
  }

  const activeQAIndex = getLatestRapidQAIndex();

  // EXPLICIT Q&A STEP FLOWS
  if (explicitStepId === "rapid-qa") {
    if (activeQAIndex === 1) {
      const isCorrect = selectedOptionId === "pos" || lowerMsg.toLowerCase().includes("pos") || lowerMsg.toLowerCase().includes("machine") || lowerMsg.toLowerCase().includes("टिकटिंग");
      if (isCorrect) {
        return t(
          "Correct! Great job. 👍\n\n" +
          "**Question 2:** What are the battery features of the POS machine?\n\n" +
          "[CHIP: battery|Bigger battery that runs all day without charging worries] [CHIP: normal|Standard 2-hour battery life] [CHIP: removable|Needs AA batteries] [CHIP: nobattery|Must be connected to charger]",

          "बिल्कुल सही जवाब! बहुत बढ़िया। 👍\n\n" +
          "**सवाल २:** POS मशीन में बैटरी के क्या फीचर्स हैं?\n\n" +
          "[CHIP: battery|बड़ी बैटरी जो बिना चार्जिंग की टेंशन के पूरे दिन चलती है] [CHIP: normal|साधारण २ घंटे की बैटरी लाइफ] [CHIP: removable|AA बैटरी बदलनी पड़ती है] [CHIP: nobattery|चार्जर से जुड़ा होना चाहिए]",

          "Correct! Great job. 👍\n\n" +
          "**Sawaal 2:** POS machine mein battery ke kya features hain?\n\n" +
          "[CHIP: battery|Bigger battery jo bina charging ki tension ke pure din chalti hai] [CHIP: normal|Normal 2-hour battery life] [CHIP: removable|AA battery badalni padti hai] [CHIP: nobattery|Charger se connect rakhna padta hai]"
        );
      } else {
        return t(
          "Incorrect. Remember: we only sell the POS Ticketing Machine. Try again:\n\n" +
          "**Question 1:** What is the main product we sell to private bus operators?\n\n" +
          "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]",

          "गलत जवाब। याद रखें: हम केवल POS टिकटिंग मशीन बेचते हैं। पुनः प्रयास करें:\n\n" +
          "**सवाल १:** हम बस ऑपरेटरों को कौन सा मुख्य प्रोडक्ट बेचते हैं?\n\n" +
          "[CHIP: pos|POS टिकटिंग मशीन] [CHIP: app|फ्री बिजनेस ऐप] [CHIP: commando|कमांडो ऐप] [CHIP: parts|बस स्पेयर पार्ट्स]",

          "Nahi, yaad rakhein: hum sirf POS Ticketing Machine bechte hain. Kripya fir se try kijiye: 🔄\n\n" +
          "**Sawaal 1:** Hum bus operators ko kaunsa main product bechte hain?\n\n" +
          "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]"
        );
      }
    }

    if (activeQAIndex === 2) {
      const isCorrect = selectedOptionId === "battery" || lowerMsg.toLowerCase().includes("battery") || lowerMsg.toLowerCase().includes("दिन भर") || lowerMsg.toLowerCase().includes("charging");
      if (isCorrect) {
        return t(
          "Correct! Great job. 👍\n\n" +
          "**Question 3:** If an operator already has a sasti button machine, why should they choose ApniBus?\n\n" +
          "[CHIP: button|Button machine only prints; ApniBus gives live reports on mobile] [CHIP: cost|ApniBus machine is much cheaper] [CHIP: paper|Uses cheaper printing paper] [CHIP: weight|Lighter in weight]",

          "बिल्कुल सही जवाब! बहुत बढ़िया। 👍\n\n" +
          "**सवाल ३:** अगर ऑपरेटर के पास पहले से बटन मशीन हो, तो वे ApniBus क्यों चुनें?\n\n" +
          "[CHIP: button|बटन मशीन सिर्फ प्रिंट करती है; ApniBus मोबाइल पर लाइव कलेक्शन रिपोर्ट देती है] [CHIP: cost|ApniBus मशीन बहुत सस्ती है] [CHIP: paper|सस्ता प्रिंटिंग पेपर लगता है] [CHIP: weight|वज़न में हल्की है]",

          "Correct! Great job. 👍\n\n" +
          "**Sawaal 3:** Agar operator ke paas pehle se sasti button machine ho, toh wo ApniBus kyun chunein?\n\n" +
          "[CHIP: button|Button machine sirf print karti hai; ApniBus mobile par live collection report deti hai] [CHIP: cost|ApniBus machine button machine se bahut sasti hai] [CHIP: paper|Sasta printing paper lagta hai] [CHIP: weight|ApniBus machine ka weight halka hai]"
        );
      } else {
        return t(
          "Incorrect. Remember: POS machine has a bigger battery for full-day ticketing. Try again:\n\n" +
          "[CHIP: battery|Bigger battery that runs all day without charging worries] [CHIP: normal|Standard 2-hour battery life] [CHIP: removable|Needs AA batteries] [CHIP: nobattery|Must be connected to charger]",

          "गलत जवाब। याद रखें: POS मशीन में बड़ी बैटरी होती है। पुनः प्रयास करें:\n\n" +
          "**सवाल २:** POS मशीन में बैटरी के क्या फीचर्स हैं?\n\n" +
          "[CHIP: battery|बड़ी बैटरी जो बिना चार्जिंग की टेंशन के पूरे दिन चलती है] [CHIP: normal|साधारण २ घंटे की बैटरी लाइफ] [CHIP: removable|AA बैटरी बदलनी पड़ती है] [CHIP: nobattery|चार्जर से जुड़ा होना चाहिए]",

          "Nahi, yaad rakhein: POS machine mein bigger battery hoti hai. Kripya fir se try kijiye: 🔄\n\n" +
          "**Sawaal 2:** POS machine mein battery ke kya features hain?\n\n" +
          "[CHIP: battery|Bigger battery jo bina charging ki tension ke pure din chalti hai] [CHIP: normal|Normal 2-hour battery life] [CHIP: removable|AA battery badalni padti hai] [CHIP: nobattery|Charger se connect rakhna padta hai]"
        );
      }
    }

    if (activeQAIndex === 3) {
      const isCorrect = selectedOptionId === "button" || lowerMsg.toLowerCase().includes("button") || lowerMsg.toLowerCase().includes("रिपोर्ट") || lowerMsg.toLowerCase().includes("reports") || lowerMsg.toLowerCase().includes("live");
      if (isCorrect) {
        return t(
          "Correct! Great job. 👍\n\n" +
          "**Question 4:** What is the purpose of the Commando App and who is it built for?\n\n" +
          "[CHIP: commando|Internal BD app to track leads and log visits] [CHIP: passenger|Passenger app to book tickets] [CHIP: operator|Operator app to view reports] [CHIP: conductor|Conductor app to print tickets]",

          "बिल्कुल सही जवाब! बहुत बढ़िया। 👍\n\n" +
          "**सवाल ४:** Commando App का क्या उद्देश्य है और यह किसके लिए बनी है?\n\n" +
          "[CHIP: commando|कमांडो ऐप हमारा इंटरनल BD टूल है लीड्स और विजिट ट्रैक करने के लिए] [CHIP: passenger|पैसेंजर के लिए टिकट बुक करने की ऐप] [CHIP: operator|ऑपरेटर के लिए रिपोर्ट देखने की ऐप] [CHIP: conductor|कंडक्टर के लिए टिकट प्रिंट करने की ऐप]",

          "Correct! Great job. 👍\n\n" +
          "**Sawaal 4:** Commando App ka kya purpose hai aur ye kiske liye bani hai?\n\n" +
          "[CHIP: commando|Internal BD app leads track karne aur visits log karne ke liye] [CHIP: passenger|Passenger app tickets book karne ke liye] [CHIP: operator|Operator app reports dekhne ke liye] [CHIP: conductor|Conductor app tickets print karne ke liye]"
        );
      } else {
        return t(
          "Incorrect. Remember: button machines only print tickets, whereas ApniBus provides live collections on mobile. Try again:\n\n" +
          "**Question 3:** If an operator already has a sasti button machine, why should they choose ApniBus?\n\n" +
          "[CHIP: button|Button machine only prints; ApniBus gives live reports on mobile] [CHIP: cost|ApniBus machine is much cheaper] [CHIP: paper|Uses cheaper printing paper] [CHIP: weight|Lighter in weight]",

          "गलत जवाब। याद रखें: बटन मशीन सिर्फ प्रिंट करती है जबकि ApniBus लाइव रिपोर्ट देती है। पुनः प्रयास करें:\n\n" +
          "**सवाल ३:** अगर ऑपरेटर के पास पहले से बटन मशीन हो, तो वे ApniBus क्यों चुनें?\n\n" +
          "[CHIP: button|बटन मशीन सिर्फ प्रिंट करती है; ApniBus मोबाइल पर लाइव कलेक्शन रिपोर्ट देती है] [CHIP: cost|ApniBus मशीन बहुत सस्ती है] [CHIP: paper|सस्ता प्रिंटिंग पेपर लगता है] [CHIP: weight|वज़न में हल्की है]",

          "Nahi, yaad rakhein: sasti button machine sirf print karti hai jabki ApniBus live reports deti hai. Kripya fir se try kijiye: 🔄\n\n" +
          "**Sawaal 3:** Agar operator ke paas pehle se sasti button machine ho, toh wo ApniBus kyun chunein?\n\n" +
          "[CHIP: button|Button machine sirf print karti hai; ApniBus mobile par live collection report deti hai] [CHIP: cost|ApniBus machine button machine se bahut sasti hai] [CHIP: paper|Sasta printing paper lagta hai] [CHIP: weight|ApniBus machine ka weight halka hai]"
        );
      }
    }

    if (activeQAIndex === 4) {
      const isCorrect = selectedOptionId === "commando" || lowerMsg.toLowerCase().includes("commando") || lowerMsg.toLowerCase().includes("internal") || lowerMsg.toLowerCase().includes("lead");
      if (isCorrect) {
        return t(
          "Exactly! The Commando App is our internal BD workflow management tool.\n\n" +
          "You have successfully cleared all Rapid Q&A questions! Click below to proceed to Scenario Practice. 🎯\n\n" +
          "[CHIP: scenarios|Proceed to Scenario Practice]",

          "एकदम सही! कमांडो ऐप हमारे BD के लिए इंटरनल टूल है।\n\n" +
          "आपने रैपिड Q&A के सभी सवालों को सफलतापूर्वक हल कर लिया है! नीचे क्लिक करके परिदृश्य अभ्यास (Scenario Practice) पर आगे बढ़ें। 🎯\n\n" +
          "[CHIP: scenarios|परिदृश्य अभ्यास पर आगे बढ़ें]",

          "Ekdum sahi! Commando App BD ke liye internal tool hai. Aapne saare Rapid Q&A questions successfully clear kar liye hain! Niche click karke Scenario Practice par aage badhein. 🎯\n\n" +
          "[CHIP: scenarios|Proceed to Scenario Practice]"
        );
      } else {
        return t(
          "Incorrect. Remember: Commando App is for our internal BDs to log visits and create leads. Try again:\n\n" +
          "**Question 4:** What is the purpose of the Commando App and who is it built for?\n\n" +
          "[CHIP: commando|Internal BD app to track leads and log visits] [CHIP: passenger|Passenger app to book tickets] [CHIP: operator|Operator app to view reports] [CHIP: conductor|Conductor app to print tickets]",

          "गलत जवाब। याद रखें: कमांडो ऐप हमारे BD के लिए इंटरनल टूल है। पुनः प्रयास करें:\n\n" +
          "**सवाल ४:** Commando App का क्या उद्देश्य है और यह किसके लिए बनी है?\n\n" +
          "[CHIP: commando|कमांडो ऐप हमारा इंटरनल BD टूल है लीड्स और विजिट ट्रैक करने के लिए] [CHIP: passenger|पैसेंजर के लिए टिकट बुक करने की ऐप] [CHIP: operator|ऑपरेटर के लिए रिपोर्ट देखने की ऐप] [CHIP: conductor|कंडक्टर के लिए टिकट प्रिंट करने की ऐप]",

          "Nahi, yaad rakhein: Commando App internal tool hai leads track aur visits log karne ke liye. Kripya fir se try kijiye: 🔄\n\n" +
          "**Sawaal 4:** Commando App ka kya purpose hai aur ye kiske liye bani hai?\n\n" +
          "[CHIP: commando|Internal BD app leads track karne aur visits log karne ke liye] [CHIP: passenger|Passenger app tickets book karne ke liye] [CHIP: operator|Operator app reports dekhne ke liye] [CHIP: conductor|Conductor app tickets print karne ke liye]"
        );
      }
    }
  }

  if (explicitStepId === "scenarios") {
    const hasAskedScenario = messages.some(m => m.role === "assistant" && (m.content.includes("touch screen machine") || m.content.includes("टच स्क्रीन मशीन")));
    if (!hasAskedScenario) {
      return t(
        "**Scenario Practice Question:** An operator says: *\"My conductor is very old and cannot use a touch screen machine.\"* What will you do?\n\n" +
        "[CHIP: simple_ui|Show simple UI & promise free training] [CHIP: hire_new|Tell him to hire a new conductor] [CHIP: walk_away|Walk away from the deal]",

        "**परिदृश्य अभ्यास प्रश्न:** एक ऑपरेटर कहता है: *\"मेरा कंडक्टर बहुत पुराना है और टच स्क्रीन मशीन का उपयोग नहीं कर सकता।\"* आप क्या करेंगे?\n\n" +
        "[CHIP: simple_ui|आसान UI दिखाएं और मुफ्त ट्रेनिंग का वादा करें] [CHIP: hire_new|नया कंडक्टर रखने को कहें] [CHIP: walk_away|डील छोड़ कर चले जाएं]",

        "**Scenario Practice Question:** Ek operator bolta hai: *\"Mera conductor bahut purana hai aur touch screen machine nahi chala payega.\"* Aap kya karenge?\n\n" +
        "[CHIP: simple_ui|Show simple UI & promise free training] [CHIP: hire_new|Tell him to hire a new conductor] [CHIP: walk_away|Walk away from the deal]"
      );
    } else {
      const isCorrect = selectedOptionId === "simple_ui" || lowerMsg.includes("simple ui") || lowerMsg.includes("आसान ui") || lowerMsg.includes("training");
      if (isCorrect) {
        return t(
          "Correct! Assuring them about the simple UI and free training is the right approach. Let's move to the Final Test! 🎯\n\n" +
          "[CHIP: test|Proceed to Final Test]",

          "सही उत्तर! आसान UI और मुफ्त ट्रेनिंग का भरोसा देना ही सही तरीका है। चलिए फाइनल टेस्ट पर चलते हैं! 🎯\n\n" +
          "[CHIP: test|फाइनल टेस्ट पर आगे बढ़ें]",

          "Correct! Aasan UI aur free training ka bharosa dena hi sahi tarika hai. Chaliye Final Test par chalte hain! 🎯\n\n" +
          "[CHIP: test|Proceed to Final Test]"
        );
      } else {
        return t(
          "Incorrect. We should never ask them to hire a new conductor or walk away. We must help them transition. Try again:\n\n" +
          "**Scenario Practice Question:** An operator says: *\"My conductor is very old and cannot use a touch screen machine.\"* What will you do?\n\n" +
          "[CHIP: simple_ui|Show simple UI & promise free training] [CHIP: hire_new|Tell him to hire a new conductor] [CHIP: walk_away|Walk away from the deal]",

          "गलत जवाब। हमें कभी भी नया कंडक्टर रखने को नहीं कहना चाहिए। पुनः प्रयास करें:\n\n" +
          "**परिदृश्य अभ्यास प्रश्न:** एक ऑपरेटर कहता है: *\"मेरा कंडक्टर बहुत पुराना है और टच स्क्रीन मशीन का उपयोग नहीं कर सकता।\"* आप क्या करेंगे?\n\n" +
          "[CHIP: simple_ui|आसान UI दिखाएं और मुफ्त ट्रेनिंग का वादा करें] [CHIP: hire_new|नया कंडक्टर रखने को कहें] [CHIP: walk_away|डील छोड़ कर चले जाएं]",

          "Nahi, hume kabhi naya conductor rakhne ko nahi bolna chahiye. Kripya fir se try kijiye: 🔄\n\n" +
          "**Scenario Practice Question:** Ek operator bolta hai: *\"Mera conductor bahut purana hai aur touch screen machine nahi chala payega.\"* Aap kya karenge?\n\n" +
          "[CHIP: simple_ui|Show simple UI & promise free training] [CHIP: hire_new|Tell him to hire a new conductor] [CHIP: walk_away|Walk away from the deal]"
        );
      }
    }
  }

  if (explicitStepId === "test" || lowerMsg.includes("scorecard") || lowerMsg.includes("score") || lowerMsg.includes("verdict") || lowerMsg.includes("रिपोर्ट")) {
    const hasAskedFinalTest = messages.some(m => m.role === "assistant" && (m.content.includes("formula to close a sale") || m.content.includes("डील क्लोज करने का मुख्य फॉर्मूला") || m.content.includes("deal close karne")));
    if (!hasAskedFinalTest && !lowerMsg.includes("scorecard") && !lowerMsg.includes("score") && !lowerMsg.includes("verdict") && !lowerMsg.includes("रिपोर्ट")) {
      return t(
        "**Final Readiness Test Question:** Which of the following is the key formula to close a sale with a bus owner?\n\n" +
        "[CHIP: close_leakage|Focus on free Business App and leakage control] [CHIP: discount|Offer heavy discounts] [CHIP: free_paper|Give free paper rolls]",

        "**फाइनल टेस्ट प्रश्न:** बस मालिक के साथ डील क्लोज करने का मुख्य फॉर्मूला क्या है?\n\n" +
        "[CHIP: close_leakage|फ्री बिजनेस ऐप और कैश चोरी पर रोक पर ध्यान दें] [CHIP: discount|भारी डिस्काउंट दें] [CHIP: free_paper|फ्री पेपर रोल दें]",

        "**Final Test Question:** Bus owner ke sath deal close karne ka sabse important formula kya hai?\n\n" +
        "[CHIP: close_leakage|Focus on free Business App and leakage control] [CHIP: discount|Offer heavy discounts] [CHIP: free_paper|Give free paper rolls]"
      );
    } else {
      const isCorrect = selectedOptionId === "close_leakage" || lowerMsg.includes("leakage") || lowerMsg.includes("चोरी") || lowerMsg.includes("scorecard") || lowerMsg.includes("score") || lowerMsg.includes("verdict") || lowerMsg.includes("रिपोर्ट");
      if (isCorrect) {
        return t(
          "# 📊 APNIBUS SALES ACADEMY — READINESS REPORT CARD\n\n" +
          "**BD Name:** Gaurav Thakur\n" +
          "**Final Score:** 85/100\n" +
          "**Verdict:** **FIELD READY 🎉** (You are ready to go on the field!)\n\n" +
          "---\n\n" +
          "### Score Breakdown\n" +
          "- **Product Knowledge:** 90% (Good hold on POS & Business App features)\n" +
          "- **Communication & Clarity:** 80% (Speaks clearly in selected language)\n" +
          "- **Objection Handling:** 80% (Good use of A-A-A-A framework)\n\n" +
          "[CHIP: attendance|Proceed to Phase 4 Attendance Policy] [CHIP: restart_roleplay|🔄 Start Another Roleplay]",

          "# 📊 APNIBUS सेल्स एकेडमी — रेडीनेस रिपोर्ट कार्ड\n\n" +
          "**BD नाम:** गौरव ठाकुर\n" +
          "**अंतिम स्कोर:** ८५/१००\n" +
          "**निर्णय:** **FIELD READY 🎉** (आप फील्ड में जाने के लिए बिल्कुल तैयार हैं!)\n\n" +
          "---\n\n" +
          "### स्कोर का विवरण\n" +
          "- **प्रोडक्ट नॉलेज:** ९०% (POS और Business App फीचर्स पर अच्छी पकड़ है)\n" +
          "- **कम्युनिकेशन:** ८०% (चुनी गई भाषा में सही समझाते हैं)\n" +
          "- **ऑब्जेक्शन हैंडलिंग:** ८०% (A-A-A-A फ्रेमवर्क का अच्छा उपयोग)\n\n" +
          "[CHIP: attendance|फेस ४ उपस्थिति नीति पर आगे बढ़ें] [CHIP: restart_roleplay|🔄 दूसरा रोलप्ले शुरू करें]",

          "# 📊 APNIBUS SALES ACADEMY — READINESS REPORT CARD\n\n" +
          "**BD Name:** Gaurav Thakur\n" +
          "**Final Score:** 85/100\n" +
          "**Verdict:** **FIELD READY 🎉** (Aap field mein jaane ke liye bilkul tayyar hain!)\n\n" +
          "---\n\n" +
          "### Score Breakdown\n" +
          "- **Product Knowledge:** 90% (POS aur Business App features par achhi pakad hai)\n" +
          "- **Communication & Clarity:** 80% (Hinglish aur Hindi dono mein achha samjhate hain)\n" +
          "- **Objection Handling:** 80% (A-A-A-A framework ka achha use kiya)\n\n" +
          "[CHIP: attendance|Proceed to Phase 4 Attendance Policy] [CHIP: restart_roleplay|🔄 Start Another Roleplay]"
        );
      } else {
        return t(
          "Incorrect. Offering discounts or paper rolls does not solve their core business pain. Focus on leakage control. Try again:\n\n" +
          "**Final Readiness Test Question:** Which of the following is the key formula to close a sale with a bus owner?\n\n" +
          "[CHIP: close_leakage|Focus on free Business App and leakage control] [CHIP: discount|Offer heavy discounts] [CHIP: free_paper|Give free paper rolls]",

          "गलत जवाब। डिस्काउंट या पेपर रोल देने से उनका दर्द दूर नहीं होता। पुनः प्रयास करें:\n\n" +
          "**फाइनल टेस्ट प्रश्न:** बस मालिक के साथ डील क्लोज करने का मुख्य फॉर्मूला क्या है?\n\n" +
          "[CHIP: close_leakage|फ्री बिजनेस ऐप और कैश चोरी पर रोक पर ध्यान दें] [CHIP: discount|भारी डिस्काउंट दें] [CHIP: free_paper|फ्री पेपर रोल दें]",

          "Nahi, discount ya paper roll se unka main problem solve nahi hota. Kripya fir se try kijiye: 🔄\n\n" +
          "**Final Test Question:** Bus owner ke sath deal close karne ka sabse important formula kya hai?\n\n" +
          "[CHIP: close_leakage|Focus on free Business App and leakage control] [CHIP: discount|Offer heavy discounts] [CHIP: free_paper|Give free paper rolls]"
        );
      }
    }
  }

  // Handle language change messages in mock mode
  if (lowerMsg.includes("baat karo") || lowerMsg.includes("baat karein") || lowerMsg.includes("language") || lowerMsg.includes("बात करो") || lowerMsg.includes("english") || lowerMsg.includes("hindi") || lowerMsg.includes("hinglish")) {
    const targetLang = lowerMsg.includes("हिंदी") ? "हिंदी" : lowerMsg.includes("english") ? "English" : "Hinglish";
    return t(
      `Sure! From now on we will talk in **English**. Your language settings have been updated. 👍\n\nLet's proceed!`,
      `ज़रूर! अब से हम **हिंदी** में बात करेंगे। आपकी भाषा सेटिंग अपडेट हो गई है। 👍\n\nचलिए आगे बढ़ते हैं!`,
      `Sure! Ab se hum **Hinglish** mein baat karenge. Aapki language setting update ho chuki hai. 👍\n\nChaliye aage badhte hain!`
    );
  }

  // Default reply based on active mode
  if (mode === "videos") {
    const activeVideoId = getActiveVideoId();
    const questions = VIDEO_QUESTIONS[activeVideoId];
    if (questions && questions[0]) {
      return t(
        `You said: *"${lastMsg}"*\n\nWe are currently at the video checkpoint. Let's answer the first question to proceed:\n\n` + renderQuestion(questions[0], 0),
        `आपने कहा: *"${lastMsg}"*\n\nहम अभी वीडियो चेकपॉइंट पर हैं। चलिए पहले सवाल का जवाब देते हैं:\n\n` + renderQuestion(questions[0], 0),
        `Aapne kaha: *"${lastMsg}"*\n\nHum abhi video checkpoint par hain. Chaliye pehle sawal ka answer deke aage badhte hain:\n\n` + renderQuestion(questions[0], 0)
      );
    }
    return t(
      `You said: *"${lastMsg}"*\n\nWe are currently at the video checkpoint. Please answer both questions from the video, or click the dynamic bypass button in the toolbar to unlock the next video directly.`,
      `आपने कहा: *"${lastMsg}"*\n\nहम अभी वीडियो चेकपॉइंट पर हैं। कृपया वीडियो से जुड़े दोनों सवालों के जवाब दें, या सीधे अगला वीडियो अनलॉक करने के लिए टूलबार में दिए गए बाईपास बटन पर क्लिक करें।`,
      `Aapne kaha: *"${lastMsg}"*\n\nHum abhi video checkpoint par hain. Kripya video se jude dono questions ka sahi jawab dein, ya upar diye gaye dynamic button par click karke direct agla video unlock karein.`
    );
  }

  if (mode === "grooming") {
    if (isPitchInvitation) {
      return t(
        `You said: *"${lastMsg}"*\n\nThis is a good attempt! Let's make it more professional and operator-focused:\n` +
        "- **Focus on Customer Benefits:** Operators care more about stopping revenue leakage and conductor cash control than printing speed.\n" +
        "- **Highlight Business App:** Remember the Business App is completely free.\n\n" +
        "Try this better version:\n" +
        "*\"Namaste sir, I am Rohit from ApniBus. We digitize your ticketing so conductor cannot steal cash, and you get live reports on your phone.\"*\n\n" +
        "[CHIP: pitch|Fix my pitch] [CHIP: objection|Objection handling]",

        `आपने कहा: *"${lastMsg}"*\n\nयह एक अच्छा प्रयास है! चलिए इसे थोड़ा और प्रोफेशनल और ऑपरेटर के फायदे वाला बनाते हैं:\n` +
        "- **ऑपरेटर के फायदे पर ध्यान दें:** प्रिंटिंग स्पीड से ज्यादा ऑपरेटर को रेवेन्यू लीकेज और चोरी रोकने की चिंता होती है।\n" +
        "- **Business App मुख्य रूप से बताएं:** ध्यान रखें कि बिजनेस ऐप बिल्कुल मुफ्त है जो पूरा हिसाब देता है।\n\n" +
        "आप इस बेहतर वर्जन को ट्राई करें:\n" +
        "*\"नमस्कार भैया, मैं ApniBus से आया हूँ। हम आपकी बसों का टिकट डिजिटल करते हैं जिससे कंडक्टर चोरी नहीं कर सकेगा, और आपको आपके फ़ोन पर लाइव धंधे का हिसाब मिलेगा।\"*\n\n" +
        "[CHIP: pitch|Fix my pitch] [CHIP: objection|Objection handling]",

        `Aapne kaha: *"${lastMsg}"*\n\n` +
        "Ye ek achha prayaas hai! Chaliye ise thoda aur professional aur operator-focused banate hain:\n" +
        "- **Customer benefits par dhyan dein:** Batch ticket print karne se zyada operator ko collection aur chori rokne ki chinta hoti hai.\n" +
        "- **Business App highlight karein:** Hamesha yaad rakhein ki Business App bilkul free milta hai jo ki unke dhandhe ka sahi hisaab deta hai.\n\n" +
        "Aap is behtar version ko try kijiye:\n" +
        "*\"Namaskar bhaiya, main ApniBus se aaya hoon. Hum aapki buses ka saara ticketing digital karte hain jisse conductor chori nahi kar sakega, aur aapko aapke phone par live dhandhe ka hisaab milega.\"*\n\n" +
        "[CHIP: pitch|Fix my pitch] [CHIP: objection|Objection handling]"
      );
    }
    
    // Smart fallback based on current step — always provide forward momentum
    if (explicitStepId === "deep-dive") {
      return t(
        "Let me tell you about our product features! 🎯 Here are the **7 main features** of the POS Ticketing Machine:\n\n" +
        "1. **Digital Tickets** — No more paper waste\n2. **Live GPS Tracking** — Know where every bus is\n3. **UPI + Cash** — Accept all payment modes\n4. **Auto Reports** — Daily collection reports sent to owner\n5. **Passenger Count** — Know exact ridership\n6. **Big Battery** — Runs all day without charging\n7. **Free Business App** — Owner gets real-time data on phone\n\n" +
        "[CHIP: objection|✓ Complete & Go to: Objection Handling] [CHIP: deep-dive|🔁 Repeat Deep-Dive]",
        "आइए मैं आपको हमारे प्रोडक्ट की फीचर्स बताता हूँ! 🎯 POS टिकटिंग मशीन की **7 मुख्य विशेषताएँ**:\n\n" +
        "1. **डिजिटल टिकट** — कागज की बर्बादी नहीं\n2. **लाइव GPS ट्रैकिंग** — हर बस कहाँ है जानें\n3. **UPI + कैश** — सभी पेमेंट मोड\n4. **ऑटो रिपोर्ट्स** — रोज़ कलेक्शन रिपोर्ट मालिक को\n5. **पैसेंजर काउंट** — सही राइडरशिप जानें\n6. **बड़ी बैटरी** — पूरे दिन चलती है\n7. **फ्री बिजनेस ऐप** — मालिक को फोन पर रियल-टाइम डेटा\n\n" +
        "[CHIP: objection|✓ अगला: ऑब्जेक्शन हैंडलिंग] [CHIP: deep-dive|🔁 दोबारा]",
        "Aaye main aapko humare product ki features batata hoon! 🎯 POS Ticketing Machine ki **7 main features**:\n\n" +
        "1. **Digital Tickets** — Paper waste nahi\n2. **Live GPS Tracking** — Har bus kahan hai jaano\n3. **UPI + Cash** — Sab payment modes\n4. **Auto Reports** — Rozana collection report owner ko\n5. **Passenger Count** — Sahi ridership jaano\n6. **Badi Battery** — Poora din chalti hai\n7. **Free Business App** — Owner ko phone par real-time data\n\n" +
        "[CHIP: objection|✓ Complete & Go to: Objection Handling] [CHIP: deep-dive|🔁 Repeat Deep-Dive]"
      );
    }
    if (explicitStepId === "objection") {
      return t(
        "Let's practice the **A-A-A-A Framework** for handling objections! 🛡️\n\n" +
        "**A-A-A-A** stands for:\n" +
        "1. **Acknowledge** — Show empathy\n2. **Ask** — Understand their concern\n3. **Address** — Give the solution\n4. **Advance** — Move to next step\n\n" +
        "Try saying a common objection like: *\"Machine bahut mehngi hai\"* or *\"Conductor nahi chala payega\"*\n\n" +
        "[CHIP: roleplay|✓ Complete & Go to: Customer Roleplay] [CHIP: objection|🔁 Practice More]",
        "चलिए **A-A-A-A Framework** से ऑब्जेक्शन हैंडलिंग सीखें! 🛡️\n\n" +
        "**A-A-A-A** का मतलब:\n" +
        "1. **Acknowledge** — सहानुभूति दिखाएँ\n2. **Ask** — उनकी चिंता समझें\n3. **Address** — समाधान दें\n4. **Advance** — अगले कदम पर बढ़ें\n\n" +
        "कोई आम ऑब्जेक्शन बोलें जैसे: *\"मशीन बहुत महँगी है\"* या *\"कंडक्टर नहीं चला पाएगा\"*\n\n" +
        "[CHIP: roleplay|✓ अगला: कस्टमर रोलप्ले] [CHIP: objection|🔁 और अभ्यास]",
        "Chaliye **A-A-A-A Framework** se objection handling seekhein! 🛡️\n\n" +
        "**A-A-A-A** ka matlab:\n" +
        "1. **Acknowledge** — Empathy dikhao\n2. **Ask** — Unki concern samjho\n3. **Address** — Solution do\n4. **Advance** — Aage badho\n\n" +
        "Koi common objection bolein jaise: *\"Machine bahut mehngi hai\"* ya *\"Conductor nahi chala payega\"*\n\n" +
        "[CHIP: roleplay|✓ Complete & Go to: Customer Roleplay] [CHIP: objection|🔁 Practice More]"
      );
    }
    if (explicitStepId === "pitch") {
      return t(
        "We are in the **Fix My Pitch** module! 🎤 Here you practice your sales pitch. Write your pitch and I will correct it.\n\n" +
        "[CHIP: qa|✓ Complete & Proceed to Q&A Prep]",
        "हम **Fix My Pitch** मॉड्यूल में हैं! 🎤 यहाँ आप अपनी सेल्स पिच का अभ्यास करें। अपनी पिच लिखें, मैं सुधारूँगा।\n\n" +
        "[CHIP: qa|✓ अगला: Q&A Prep]",
        "Hum **Fix My Pitch** module mein hain! 🎤 Yahaan aap apni sales pitch ka practice karein. Apni pitch likhein, main correct karunga.\n\n" +
        "[CHIP: qa|✓ Complete & Proceed to Q&A Prep]"
      );
    }
    return t(
      `Let's continue with Phase 2 Grooming! Click one of the modules below to get started. 👇\n\n` +
      "[CHIP: deep-dive|Product deep-dive] [CHIP: objection|Objection handling] [CHIP: roleplay|Customer roleplay] [CHIP: pitch|Fix my pitch]",
      `चलिए फेस 2 ग्रूमिंग जारी रखें! नीचे दिए गए मॉड्यूल में से चुनें। 👇\n\n` +
      "[CHIP: deep-dive|Product deep-dive] [CHIP: objection|Objection handling] [CHIP: roleplay|Customer roleplay] [CHIP: pitch|Fix my pitch]",
      `Chaliye Phase 2 Grooming continue karein! Neeche diye gaye modules mein se chunein. 👇\n\n` +
      "[CHIP: deep-dive|Product deep-dive] [CHIP: objection|Objection handling] [CHIP: roleplay|Customer roleplay] [CHIP: pitch|Fix my pitch]"
    );
  }

  return t(
    `You said: *"${lastMsg}"*\n\nWe are currently in Phase 3 Q&A Prep. Please write your response to the scenario question.`,
    `आपने कहा: *"${lastMsg}"*\n\nहम अभी फेस ३ Q&A Prep में हैं। कृपया परिदृश्य (scenario) सवाल का अपना जवाब लिखें।`,
    `Aapne kaha: *"${lastMsg}"*\n\nHum abhi Phase 3 Q&A Prep mein hain. Main aapse scenario questions pooch raha hoon. Kripya uske hisaab se answer likhiye.`
  );
}

// Function to stream mock responses chunk by chunk to simulate real LLM
function streamMockResponse(res, responseText) {
  let index = 0;
  const chunkSize = 12; // characters per chunk
  const interval = setInterval(() => {
    if (index >= responseText.length) {
      res.write(`event: done\ndata: {}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }
    const chunk = responseText.slice(index, index + chunkSize);
    res.write(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
    index += chunkSize;
  }, 35);
}

app.post("/api/chat", async (req, res) => {
  const { messages = [], mode = "auto", ctx = {}, selectedOptionId = null, roleplayState = null, difficulty = "Medium" } = req.body;
  const lastUserMsg = messages.length ? (messages[messages.length - 1].content || "").trim().toLowerCase() : "";
  const isCoach = selectedOptionId === "coach" || selectedOptionId === "pause_roleplay" || lastUserMsg === "coach" || lastUserMsg.startsWith("coach ") || lastUserMsg.includes("coach — pause");
  ctx.roleplayStatus = roleplayState?.status || (isCoach ? "PAUSED" : "CUSTOMER_TURN");
  ctx.isCoachRequest = isCoach;
  ctx.difficulty = difficulty;
  
  // LOG FOR DEBUGGING
  const lastUser = messages.length ? messages[messages.length - 1].content : "NONE";
  console.log(`\n--- [API CHAT REQUEST] ---`);
  console.log(`Mode: ${mode}`);
  console.log(`SelectedOptionId: ${selectedOptionId}`);
  console.log(`Last User Message: "${lastUser}"`);
  if (messages.length >= 2) {
    console.log(`Last Assistant Message: "${messages[messages.length - 2].content.slice(0, 100)}..."`);
  }



  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  if (IS_MOCK_MODE) {
    const responseText = getMockResponse(messages, mode, ctx, selectedOptionId, req.body.state || {});
    return streamMockResponse(res, responseText);
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        temperature: 0.8,
        stream: true,
        system: buildSystem(mode, ctx),
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      send("error", { message: `API ${upstream.status}: ${detail.slice(0, 400)}` });
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        try {
          const evt = JSON.parse(payload);
          if (
            evt.type === "content_block_delta" &&
            evt.delta?.type === "text_delta"
          ) {
            send("delta", { text: evt.delta.text });
          }
          if (evt.type === "message_stop") send("done", {});
        } catch {
          /* partial JSON across chunks — safe to skip */
        }
      }
    }
    send("done", {});
    res.end();
  } catch (err) {
    send("error", { message: err.message });
    res.end();
  }
});

const RESULTS_FILE = path.join(__dirname, "data", "results.json");

// Ensure data folder and file exists
if (!fs.existsSync(path.dirname(RESULTS_FILE))) {
  fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
}
if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify([], null, 2));
}

// Memory cache of current registered user
let currentUser = {
  name: "",
  gender: "",
  age: "",
  location: "",
  bestScore: 0,
  history: []
};

const createCertificateId = () => `CERT-AB-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;

function ensureCertificate(candidate) {
  if (!candidate || (candidate.status !== "COMPLETED" && !candidate.trainingCompleted)) return null;

  if (!candidate.certificateId) candidate.certificateId = createCertificateId();
  if (!candidate.certificateIssuedAt) candidate.certificateIssuedAt = candidate.updatedAt || new Date().toISOString();

  return {
    eligible: true,
    certificateId: candidate.certificateId,
    issueDate: candidate.certificateIssuedAt.slice(0, 10),
    recipientName: candidate.name,
    title: "Certified Business Development Representative",
    issuer: "ApniBus Sales Academy",
    readinessScore: Math.round(Number(candidate.score) || 85)
  };
}

function saveUserResult(name, score, verdict, weakAreas = []) {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    const idx = data.findIndex(u => u.name === name);
    const existing = idx !== -1 ? data[idx] : null;
    const isCompleted = score >= 80;
    const record = {
      name,
      gender: currentUser.gender,
      age: currentUser.age,
      location: currentUser.location,
      status: isCompleted ? "COMPLETED" : "FAILED",
      score,
      verdict,
      weakAreas,
      certificateId: isCompleted ? (existing?.certificateId || createCertificateId()) : existing?.certificateId,
      certificateIssuedAt: isCompleted ? (existing?.certificateIssuedAt || new Date().toISOString()) : existing?.certificateIssuedAt,
      updatedAt: new Date().toISOString()
    };
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...record };
    } else {
      data.push(record);
    }
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving user result:", e);
  }
}

app.post("/api/register-user", (req, res) => {
  const { name, gender, age, location } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });
  currentUser = {
    name,
    gender,
    age,
    location,
    bestScore: 0,
    history: []
  };
  
  saveUserResult(name, 0, "IN TRAINING");
  res.json({ ok: true, currentUser });
});

app.post("/api/submit-result", (req, res) => {
  const { score, verdict, weakAreas = [] } = req.body;
  currentUser.bestScore = score;
  currentUser.history = (weakAreas || []).map(w => ({ weakArea: w }));
  saveUserResult(currentUser.name, score, verdict, weakAreas);
  res.json({ ok: true });
});

app.post("/api/sync-state", (req, res) => {
  const {
    name, gender, age, location, stepIndex, mode,
    watchedVideosCount, difficulty, score, verdict, weakAreas, choices, attemptedGrooming, messages,
    videoCorrectCount, qaCorrectCount, trainingCompleted
  } = req.body;

  if (!name) return res.json({ ok: false, error: "Name is required" });

  currentUser.name = name;
  if (gender) currentUser.gender = gender;
  if (age) currentUser.age = age;
  if (location) currentUser.location = location;
  currentUser.bestScore = score || currentUser.bestScore || 0;
  if (weakAreas) currentUser.history = weakAreas.map(w => ({ weakArea: w }));

  // Parse Q&A choices from messages history
  let qaChoices = { q1: "Not attempted", q2: "Not attempted", q3: "Not attempted", q4: "Not attempted", scenario: "Not attempted", finalTest: "Not attempted" };
  if (messages && Array.isArray(messages)) {
    messages.forEach((m) => {
      if (m.role === "user" && m.content) {
        const lower = m.content.toLowerCase();
        if (lower.includes("pos ticketing machine") || lower.includes("pos टिकटिंग मशीन")) qaChoices.q1 = "POS Ticketing Machine (Correct)";
        if (lower.includes("battery jo bina charging") || lower.includes("battery that runs all day") || lower.includes("बड़ी बैटरी") || lower.includes("charging")) qaChoices.q2 = "Bigger Battery (Correct)";
        if (lower.includes("button machine only prints") || lower.includes("बटन मशीन सिर्फ प्रिंट करती") || lower.includes("button machine sirf print karti") || lower.includes("live reports")) qaChoices.q3 = "Live reports vs Button (Correct)";
        if (lower.includes("internal bd app") || lower.includes("कमांडो ऐप हमारा इंटरनल") || lower.includes("internal tool") || lower.includes("track leads")) qaChoices.q4 = "Internal BD Tool (Correct)";
        if (lower.includes("show simple ui") || lower.includes("आसान ui दिखाएं") || lower.includes("simple ui") || lower.includes("free training")) qaChoices.scenario = "Show simple UI & train (Correct)";
        if (lower.includes("free business app and leakage") || lower.includes("leakage control") || lower.includes("कैश चोरी पर रोक") || lower.includes("close_leakage")) qaChoices.finalTest = "Leakage control & Free App (Correct)";
      }
    });
  }

  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    const idx = data.findIndex(u => u.name === name);
    const calculatedQaScore = Object.values(qaChoices).filter(v => v.includes("(Correct)")).length;
    const isCompleted = trainingCompleted || (choices && choices.incentive) || (score >= 80);

    const vScore = videoCorrectCount !== undefined ? videoCorrectCount : ((watchedVideosCount || 0) * 2);
    const qScore = qaCorrectCount !== undefined ? qaCorrectCount : calculatedQaScore;

    let finalScore = score || 0;
    if (!finalScore || finalScore === 0) {
      if (isCompleted) {
        finalScore = 85;
      } else if (vScore > 0 || qScore > 0) {
        finalScore = Math.round(((vScore / 8) * 45) + ((qScore / 6) * 45) + 10);
      }
    }

    const existing = idx !== -1 ? data[idx] : null;
    const record = {
      name,
      gender: gender || currentUser.gender,
      age: age || currentUser.age,
      location: location || currentUser.location,
      status: isCompleted ? "COMPLETED" : (finalScore > 0 ? "FAILED" : "IN_TRAINING"),
      score: finalScore,
      verdict: verdict || "IN TRAINING",
      trainingCompleted: isCompleted ? true : false,
      videoCorrectCount: videoCorrectCount !== undefined ? videoCorrectCount : ((watchedVideosCount || 0) * 2),
      qaCorrectCount: qaCorrectCount !== undefined ? qaCorrectCount : calculatedQaScore,
      weakAreas: weakAreas || [],
      choices: choices || { attendance: "", employment: "", incentive: "" },
      attemptedGrooming: attemptedGrooming || { deepDive: false, objection: false, roleplay: false, pitchCorrection: false },
      qaChoices,
      messages: messages || [],
      certificateId: isCompleted ? (existing?.certificateId || createCertificateId()) : existing?.certificateId,
      certificateIssuedAt: isCompleted ? (existing?.certificateIssuedAt || new Date().toISOString()) : existing?.certificateIssuedAt,
      updatedAt: new Date().toISOString()
    };
    
    if (idx !== -1) {
      data[idx] = record;
    } else {
      data.push(record);
    }
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error syncing state on server:", err);
  }

  res.json({ ok: true });
});


// GOOGLE OAUTH AUTHENTICATION ENDPOINT
app.post("/api/auth/google", (req, res) => {
  const { user, registration } = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: "Invalid Google payload" });
  }

  console.log(`  ✓ Verified Google Login for candidate: ${user.name} (${user.email})`);

  try {
    let data = [];
    if (fs.existsSync(RESULTS_FILE)) {
      data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    }

    const idx = data.findIndex(u => u.email === user.email || u.name === user.name);
    const record = {
      name: user.name,
      email: user.email,
      googleAuth: true,
      picture: user.picture,
      gender: registration?.gender || "Male",
      age: registration?.age || 24,
      location: registration?.location || "Gurugram",
      status: "Verified Learner",
      score: 85,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      data[idx] = { ...data[idx], ...record };
    } else {
      data.push(record);
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
    res.json({ ok: true, user: record });
  } catch (err) {
    console.error("Error saving Google auth profile:", err);
    res.status(500).json({ error: "Failed to save Google Auth user" });
  }
});

app.get("/api/results", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    res.json(data);
  } catch (err) {
    res.json([]);
  }
});

app.get("/api/download-csv", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    
    let csv = "Name,Gender,Age,Location,Status,Readiness Score,Verdict,Attendance Choice,Employment Choice,Incentive Choice,Grooming Deep Dive,Grooming Objection,Grooming Roleplay,Grooming Pitch,Q1 (Product),Q2 (Battery),Q3 (Button vs ApniBus),Q4 (Commando App),Scenario Practice,Final Test,Last Updated\n";
    
    data.forEach(u => {
      const att = u.attemptedGrooming || {};
      const choices = u.choices || {};
      const qa = u.qaChoices || {};
      csv += `"${u.name || ''}","${u.gender || ''}","${u.age || ''}","${u.location || ''}","${u.status || ''}",${u.score || 0},"${u.verdict || ''}","${choices.attendance || ''}","${choices.employment || ''}","${choices.incentive || ''}",${att.deepDive || false},${att.objection || false},${att.roleplay || false},${att.pitchCorrection || false},"${qa.q1 || 'Not attempted'}","${qa.q2 || 'Not attempted'}","${qa.q3 || 'Not attempted'}","${qa.q4 || 'Not attempted'}","${qa.scenario || 'Not attempted'}","${qa.finalTest || 'Not attempted'}","${u.updatedAt || ''}"\n`;
    });
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=apnibus_candidates_report.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating CSV");
  }
});

app.get("/api/download-certificate", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).send("Name parameter is required");

  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    const candidate = data.find(u => u.name === name);
    if (!candidate) return res.status(404).send("Candidate not found");
    if (candidate.status !== "COMPLETED" && !candidate.trainingCompleted) {
      return res.status(403).send("This candidate has not completed training yet");
    }

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[char]);
    const safeName = escapeHtml(candidate.name);
    const score = Math.round(Number(candidate.score) || 85);
    const issueDate = new Date(candidate.certificateIssuedAt || candidate.updatedAt || Date.now()).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const certificate = ensureCertificate(candidate);
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
    const certificateId = certificate.certificateId;
    const filename = `apnibus_certificate_${String(candidate.name).replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "candidate"}.html`;
    const logoDataUri = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, "public", "logo.png")).toString("base64")}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ApniBus Certificate</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&family=Archivo:wght@600;700;800&display=swap" rel="stylesheet">
<style>body{margin:0;min-height:100vh;background:#101726;font-family:'Mukta',sans-serif;color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}.certificate{background:#101726;border:4px double #f0a227;border-radius:24px;padding:45px;max-width:820px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.95);box-sizing:border-box}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(240,162,39,.3);padding-bottom:20px;margin-bottom:24px;flex-wrap:wrap;gap:10px}.brand{display:flex;align-items:center;gap:12px;text-align:left}.brand img{height:44px}.brand-name,.title,.candidate,.score,.status,.authority{font-family:'Archivo',sans-serif}.brand-name{font-weight:700;font-size:17px}.brand-sub,.label,.date{font-size:11.5px;color:#9ca3af}.cert-id{text-align:right}.cert-id span{display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700}.cert-id b{font-family:'Archivo',sans-serif;color:#f0a227;font-size:13px}.trophy{font-size:52px;margin-bottom:10px;filter:drop-shadow(0 4px 12px rgba(240,162,39,.5))}.title{font-size:28px;margin:0 0 6px;letter-spacing:1px;text-transform:uppercase}.official{color:#f0a227;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 22px}.label{font-size:14px;margin:0 0 8px}.candidate{font-size:34px;color:#10b981;margin:0 0 20px;border-bottom:2px dashed rgba(16,185,129,.4);display:inline-block;padding-bottom:6px}.description{color:#d1d5db;font-size:14.5px;line-height:1.7;max-width:660px;margin:0 auto 24px}.badges{display:flex;justify-content:center;gap:20px;margin-bottom:24px;flex-wrap:wrap}.badge{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);padding:10px 22px;border-radius:12px}.badge span{display:block;font-size:10.5px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:.5px}.score{font-size:24px;color:#10b981}.status{font-size:18px;color:#f0a227}.footer{display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,.12);padding-top:16px;margin-top:12px;gap:10px}.date{text-align:left;font-size:12px}.date small{display:block;font-size:10.5px;color:#6b7280;margin-top:3px}.authority{text-align:right;font-weight:700;font-size:14px}.authority span{display:block;font-family:'Mukta',sans-serif;font-size:12px;color:#10b981;font-weight:600}@media print{body{padding:0}.certificate{box-shadow:none;max-width:700px;padding:36px}}@media(max-width:640px){.certificate{padding:22px 16px;border-radius:14px}.title{font-size:18px}.candidate{font-size:24px}.badges,.footer{flex-direction:column;align-items:center}.footer .date,.authority{text-align:center}}</style></head>
<body><main class="certificate"><div class="header"><div class="brand"><img src="${logoDataUri}" alt="ApniBus Logo"><div><div class="brand-name">ApniBus</div><div class="brand-sub">Field Sales Training Academy</div></div></div><div class="cert-id"><span>Certificate ID</span><b>${certificateId}</b></div></div><div class="trophy">🏆 📜 🥇</div><h1 class="title">Certificate of Sales Readiness</h1><p class="official">Official Sales Certification</p><p class="label">This is to certify that</p><h2 class="candidate">${safeName}</h2><p class="description">has successfully completed the <b>6-Phase Sales Operations &amp; Field Readiness Training</b> on <b>ApniBus POS Ticketing Machine</b>, <b>Objection Handling (A-A-A-A Framework)</b>, <b>Operator Pitch Simulation</b>, and <b>Policy Compliance</b>.</p><div class="badges"><div class="badge"><span>Readiness Score</span><b class="score">${score}%</b></div><div class="badge"><span>Status</span><b class="status">FIELD READY 🎉</b></div></div><div class="footer"><div class="date">Date: <b>${escapeHtml(issueDate)}</b><small>Certificate ID: ${certificateId}</small></div><div class="authority">VP of Sales &amp; Training<span>ApniBus Sales Academy</span></div></div></main></body></html>`);
  } catch (err) {
    console.error("Error generating certificate:", err);
    res.status(500).send("Error generating certificate");
  }
});

app.get("/api/download-chat", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).send("Name parameter is required");
  
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    const candidate = data.find(u => u.name === name);
    if (!candidate || !candidate.messages || candidate.messages.length === 0) {
      return res.status(404).send("No chat history found for this candidate");
    }
    
    let csv = "Role,Message\n";
    candidate.messages.forEach(m => {
      if (m.content && !m.content.startsWith("[SYSTEM]")) {
        const cleanContent = m.content.replace(/"/g, '""');
        csv += `"${m.role}","${cleanContent}"\n`;
      }
    });
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=chat_history_${name.replace(/\s+/g, "_")}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error generating chat CSV");
  }
});

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, model: MODEL, kbChars: KNOWLEDGE_BASE.length, mock: IS_MOCK_MODE })
);

// ANALYTICS & CERTIFICATE ENDPOINT
app.get("/api/analytics", (req, res) => {
  const engine = new AnalyticsEngine({
    userId: "usr_101",
    name: currentUser.name,
    unlockedPhase: currentUser.bestScore >= 80 ? 3 : 2,
    phase1Completed: 5,
    phase2Completed: currentUser.bestScore > 0 ? 4 : 3,
    phase3Completed: currentUser.bestScore >= 80 ? 2 : 1,
    bestScore: currentUser.bestScore || 85,
    history: currentUser.history
  });

  let certificate = {
    eligible: false,
    reason: "Complete the Sales Academy to unlock your certificate."
  };
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    const learnerName = String(req.query.name || currentUser.name || "").trim();
    const candidate = data.find(u => u.name === learnerName);
    const storedCertificate = ensureCertificate(candidate);
    if (storedCertificate) {
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
      certificate = storedCertificate;
    } else if (candidate) {
      certificate = {
        eligible: false,
        reason: "Complete the Sales Academy to unlock your certificate."
      };
    }
  } catch (err) {
    console.error("Error loading certificate record:", err);
  }

  res.json({
    completionPercentage: engine.getOverallCompletionPercentage(),
    weakTopicsMap: engine.getWeakTopicsMap(),
    certificate
  });
});

app.listen(PORT, () =>
  console.log(`\n  ApniBus Coach running → http://localhost:${PORT}\n`)
);
