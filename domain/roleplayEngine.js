/**
 * Roleplay Engine 2.0 — Deterministic State Machine Engine
 * Controls customer trust (0-100), mood transitions, objection selection, and progressive hints.
 */

import fs from 'fs';
import path from 'path';

let OBJECTION_POOL = {};
try {
  const fileData = fs.readFileSync(path.resolve('./data/objections_library.json'), 'utf-8');
  OBJECTION_POOL = JSON.parse(fileData).objections;
} catch (e) {
  console.warn("Using fallback objection pool");
}

export class RoleplaySessionEngine {
  constructor(options = {}) {
    this.difficulty = options.difficulty || "Medium";
    this.language = options.language || "Hinglish";
    
    // Set initial trust based on difficulty level
    const initialTrust = {
      Easy: 60,
      Medium: 40,
      Hard: 30,
      Expert: 20,
      Master: 15
    }[this.difficulty] || 40;

    this.session = {
      sessionId: options.sessionId || `sess_${Date.now()}`,
      scenarioId: options.scenarioId || "ludhiana_rajesh",
      difficulty: this.difficulty,
      language: this.language,
      currentStage: "GREETING",
      currentObjectionKey: "greeting_rush",
      customerMood: this.calculateMood(initialTrust),
      customerTrust: initialTrust,
      confidenceScore: 70,
      learnerScore: 0,
      completed: false,
      coachMode: false,
      hintAttempt: 0,
      waitingForLearner: true,
      waitingForCustomer: false,
      conversationHistory: []
    };
  }

  calculateMood(trust) {
    if (trust >= 80) return "convinced";
    if (trust >= 65) return "interested";
    if (trust >= 40) return "neutral";
    if (trust >= 20) return "skeptical";
    return "frustrated";
  }

  evaluateReply(userMsg) {
    const lower = (userMsg || "").toLowerCase();
    let trustDelta = 0;

    const hasQuestion = lower.includes("?") || lower.includes("kaise") || lower.includes("how") || lower.includes("kya") || lower.includes("kitna") || lower.includes("pooch");
    const hasApp = lower.includes("app") || lower.includes("business app") || lower.includes("free");
    const hasLeakage = lower.includes("leakage") || lower.includes("chori") || lower.includes("hisaab") || lower.includes("collection") || lower.includes("paisa");
    const hasDemo = lower.includes("demo") || lower.includes("kal") || lower.includes("bus pe") || lower.includes("setup");
    const isRude = lower.includes("chup") || lower.includes("pagal") || lower.includes("nonsense") || lower.includes("shut up");

    if (isRude) {
      trustDelta = -20;
    } else if (hasQuestion && hasLeakage) {
      trustDelta = this.difficulty === "Easy" ? 15 : this.difficulty === "Master" ? 8 : 12;
    } else if (hasApp || hasDemo) {
      trustDelta = this.difficulty === "Easy" ? 10 : this.difficulty === "Master" ? 5 : 8;
    } else if (lower.length > 25) {
      trustDelta = 3;
    } else {
      trustDelta = -6;
    }

    this.session.customerTrust = Math.max(0, Math.min(100, this.session.customerTrust + trustDelta));
    this.session.customerMood = this.calculateMood(this.session.customerTrust);

    if (this.session.customerTrust >= 80) {
      this.session.completed = true;
      this.session.currentObjectionKey = "demo_decision";
    } else if (this.session.customerTrust <= 20) {
      this.session.completed = true;
      this.session.currentObjectionKey = "greeting_cold";
    } else {
      this.session.currentObjectionKey = this.pickNextObjectionKey(lower);
    }

    return {
      trust: this.session.customerTrust,
      trustDelta,
      mood: this.session.customerMood,
      objectionKey: this.session.currentObjectionKey,
      completed: this.session.completed
    };
  }

  pickNextObjectionKey(lowerUserMsg) {
    if (!lowerUserMsg.includes("business app")) return "app_missing";
    if (!lowerUserMsg.includes("leakage") && !lowerUserMsg.includes("chori")) return "leakage_proof";
    if (!lowerUserMsg.includes("conductor")) return "conductor_literacy";
    if (!lowerUserMsg.includes("support")) return "support_247";
    
    const keys = Object.keys(OBJECTION_POOL);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex] || "need_register";
  }

  getCurrentObjectionText() {
    const obj = OBJECTION_POOL[this.session.currentObjectionKey] || OBJECTION_POOL.greeting_rush;
    const langKey = this.language === "हिंदी" ? "hi" : this.language === "English" ? "en" : "hgl";
    return obj[langKey] || obj.hgl;
  }
}
