# Workspace Context & Guidelines

Welcome to the **ApniBus Sales Academy** workspace! This document provides context, architectural details, and developer instructions for modifying the codebase.

## 📋 Project Overview
ApniBus Sales Academy is an interactive AI-powered training platform for field Business Development (BD) representatives who sell **POS Ticketing Machines** to private bus operators.

The application guides BDs through a sequential, gated 3-phase training program:
1. **Phase 1 — Videos**: Watch 3 core training videos. BDs must answer 2 checkpoint questions after each video before unlocking the next phases.
2. **Phase 2 — Grooming**: Interactive learning including:
   - **Fix My Pitch**: A 2-Round Roleplay Script (Round 1: Role Reversal where user plays operator and AI pitches; Debrief; Round 2: Swap where user pitches and AI objects).
   - **Product Deep-Dive**: Detailed exploration of features.
   - **Objection Handling**: Structured scripts handling common operator concerns.
   - **Roleplay**: Real-time sales simulation with operator Rajesh Yadav.
3. **Phase 3 — Q&A Prep**: Rapid-fire scenario questions and readiness assessment scoring (/100).

---

## 🛠️ Technology Stack
* **Backend**: Node.js, Express, Server-Sent Events (SSE) for streaming LLM responses.
* **Frontend**: Single Page Application (SPA) using Vanilla HTML, CSS, and JS (`public/app.js`).
* **LLM Integration**: Anthropic Claude-3-5-Sonnet (Streamed).
* **Demo/Mock Mode**: Local rule-based simulation engine (`server.js`'s `getMockResponse()`) that functions fully without an API key, supporting complete trilingual flows.

---

## 🗂️ Core Project Structure
* [server.js](file:///Users/gauravthakur/Downloads/app%202/server.js): Entry point. Builds consolidated prompts, manages server endpoints, and runs the mock engine.
* [public/app.js](file:///Users/gauravthakur/Downloads/app%202/public/app.js): Handles routing, frontend state, progression gates, and language selectors.
* [public/index.html](file:///Users/gauravthakur/Downloads/app%202/public/index.html) & [public/index.css](file:///Users/gauravthakur/Downloads/app%202/public/index.css): UI layouts and styles.
* [prompts/grooming-trilingual-module.md](file:///Users/gauravthakur/Downloads/app%202/prompts/grooming-trilingual-module.md): Modular trilingual guidelines, glossary, objection handling frameworks, and character scripts.
* [prompts/pitch-correction-roleplay-script.md](file:///Users/gauravthakur/Downloads/app%202/prompts/pitch-correction-roleplay-script.md): Rules for conducting the 2-Round Roleplay.
* `public/videos.json`: Video specifications, titles, descriptions, and gate questions.

---

## 🌍 Trilingual Settings & Rules
The app supports **English**, **हिंदी (Devanagari)**, and **Hinglish (Roman transliteration)**.
* The frontend passes the active selection (`ctx.lang`) inside every chat payload.
* The mock simulation resolves language selection dynamically using the `t(en, hi, hgl)` helper.
* The system prompt aggregates all trilingual templates ensuring Claude aligns natively.

---

## 🔒 Progression Gate Logic
* **Gated Progression**: Phase 2 and Phase 3 are locked until all 3 videos in Phase 1 are watched and verified.
* **Question Gate**: For each video, the coach must ask 2 questions. Progression is intercepted by `checkpointPassed()` in `public/app.js` which blocks progression if keywords indicating Question 2 (`sawal 2`, `question 2`) are detected in the coach's message. Both questions must be successfully completed to unlock the next video.
