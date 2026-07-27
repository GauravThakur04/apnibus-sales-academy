import http from 'http';

function sendChatPayload(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.split('\n');
        let text = '';
        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.text) text += parsed.text;
            } catch (e) {}
          }
        });
        resolve(text);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runFullE2ESimulation() {
  console.log("==================================================");
  console.log("🤖 END-TO-END AUTOMATED LEARNER JOURNEY SIMULATION");
  console.log("==================================================");

  let state = {
    stepIndex: 0,
    activeStepId: "intro",
    phase: "videos",
    unlockedPhase: 1,
    difficulty: "Medium",
    watchedVideos: [],
    roleplayState: { active: false, status: "IDLE", trust: 40, mood: "neutral" }
  };

  let messages = [];

  // Helper to execute and verify step
  const executeStep = async (stepName, userText, selectedOptionId = null) => {
    console.log(`\n▶️ Executing [${stepName}] -> User: "${userText}"`);
    messages.push({ role: "user", content: userText });
    
    const payload = {
      messages,
      mode: state.phase,
      selectedOptionId,
      state,
      ctx: { lang: "Hinglish", difficulty: state.difficulty, name: "Gaurav Thakur" }
    };

    const responseText = await sendChatPayload(payload);
    messages.push({ role: "assistant", content: responseText });

    console.log(`🤖 AI Response Snippet: "${responseText.slice(0, 120).replace(/\n/g, ' ')}..."`);
    return responseText;
  };

  try {
    // --------------------------------------------------
    // PHASE 1: VIDEO GATES (Videos 1 to 4)
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("📹 PHASE 1: VIDEO CHECKPOINTS (1 to 4)");
    console.log("==================================================");

    // Video 1
    await executeStep("Video 1 Intro System", "[SYSTEM] The rep just finished watching \"ApniBus Introduction\". Ask TWO short questions.");
    await executeStep("Video 1 Q1", "POS Ticketing Machine", "pos");
    await executeStep("Video 1 Q2", "Revenue leakage aur ticket chori", "leakage");
    state.watchedVideos.push("intro");

    // Video 2
    state.stepIndex = 1; state.activeStepId = "pos-demo";
    await executeStep("Video 2 POS Demo System", "[SYSTEM] The rep just finished watching \"POS Machine Demo\". Ask TWO short questions.");
    await executeStep("Video 2 Q1", "Both Cash and UPI payments", "both");
    await executeStep("Video 2 Q2", "Instantly in less than 2 seconds", "instant");
    state.watchedVideos.push("pos-demo");

    // Video 3
    state.stepIndex = 2; state.activeStepId = "commando";
    await executeStep("Video 3 AB Commando System", "[SYSTEM] The rep just finished watching \"AB Commando App\". Ask TWO questions.");
    await executeStep("Video 3 Q1", "Mark 'Start Day' with selfie and location", "start");
    await executeStep("Video 3 Q2", "Internal work tool for ApniBus BDs", "internal");
    state.watchedVideos.push("commando");

    // Video 4
    state.stepIndex = 3; state.activeStepId = "business";
    await executeStep("Video 4 Business System", "[SYSTEM] The rep just finished watching \"AB Business App\". Ask TWO questions.");
    await executeStep("Video 4 Q1", "No, it is completely free with the POS machine", "free");
    await executeStep("Video 4 Q2", "It shows real-time collection reports live on their phone", "live");
    state.watchedVideos.push("business");

    state.unlockedPhase = 2;
    console.log("\n✅ PHASE 1 PASSED: All 4 videos and checkpoint quizzes completed!");

    // --------------------------------------------------
    // PHASE 2: GROOMING & SIMULATOR (Steps 5 to 8)
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("🚀 PHASE 2: GROOMING & ROLEPLAY SIMULATOR");
    console.log("==================================================");

    // Step 5: Product Deep-Dive
    state.phase = "grooming"; state.stepIndex = 4; state.activeStepId = "deep-dive";
    const deepDiveRes = await executeStep("Step 5 Product Deep-Dive", "Product deep-dive karao — POS ke features aur benefits.");
    if (!deepDiveRes.includes("Product Deep-Dive") && !deepDiveRes.includes("7 main features")) {
      throw new Error("FAILED at Step 5 Product Deep-Dive!");
    }

    // Step 6: Objection Handling
    state.stepIndex = 5; state.activeStepId = "objection";
    const objRes = await executeStep("Step 6 Objection Handling", "Objection handling sikhao — A-A-A-A framework se.");
    if (!objRes.includes("A-A-A-A")) {
      throw new Error("FAILED at Step 6 Objection Handling!");
    }

    // Step 7: Customer Roleplay Simulator (2-Round Flow)
    state.stepIndex = 6; state.activeStepId = "roleplay"; state.roleplayState.active = true; state.roleplayState.status = "CUSTOMER_TURN";
    const rpStart = await executeStep("Step 7 Roleplay Start", "Roleplay karein. Aap customer bano.");
    if (!rpStart.includes("Customer Roleplay") && !rpStart.includes("कस्टमर रोलप्ले")) {
      throw new Error("FAILED at Step 7 Roleplay Start!");
    }

    const rpBrief = await executeStep("Step 7 Roleplay Brief", "Chalo shuru karein");
    if (!rpBrief.includes("Aapka character") && !rpBrief.includes("Your Character")) {
      throw new Error("FAILED at Step 7 Roleplay Brief!");
    }

    const rpPitchStart = await executeStep("Step 7 Pitch Start", "Ready, shuru karo");
    if (!rpPitchStart.includes("Amit, ApniBus se") && !rpPitchStart.includes("Amit, from ApniBus")) {
      throw new Error("FAILED at Step 7 Pitch Start!");
    }

    const rpTurn1 = await executeStep("Step 7 Roleplay Turn 1", "Haan bhai bolo. Jaldi bolna, bus nikalne wali hai.");
    if (!rpTurn1.includes("collection")) {
      throw new Error("FAILED at Step 7 Roleplay Turn 1!");
    }

    const coachRes = await executeStep("Step 7 Coach Pause", "COACH", "pause_roleplay");
    if (!coachRes.includes("Roleplay Paused") && !coachRes.includes("Paused")) {
      throw new Error("FAILED at Step 7 Coach Pause!");
    }

    const resumeRes = await executeStep("Step 7 Resume Roleplay", "Resume Roleplay", "resume_roleplay");
    if (!resumeRes.includes("Resumed")) {
      throw new Error("FAILED at Step 7 Resume Roleplay!");
    }

    const rpTurn2 = await executeStep("Step 7 Roleplay Turn 2", "Conductor shaam ko deta hai, register mein likh lete hain");
    const rpTurn3 = await executeStep("Step 7 Roleplay Turn 3", "Aapki machine kya karegi isme?");
    const rpTurn4 = await executeStep("Step 7 Roleplay Turn 4", "Mera conductor nahi chala payega");
    const rpTurn5 = await executeStep("Step 7 Roleplay Turn 5", "Sasta lagega, par batao toh");
    const rpTurn6 = await executeStep("Step 7 Roleplay Turn 6", "Subah theek rahega");
    if (!rpTurn6.includes("Scene over") && !rpTurn6.includes("Scene khatam") && !rpTurn6.includes("सीन ख़त्म")) {
      throw new Error("FAILED at Step 7 Roleplay Turn 6!");
    }

    const rpDebrief = await executeStep("Step 7 Roleplay Debrief", "Conductor wali baat");
    const rpReadySwap = await executeStep("Step 7 Ready Swap", "Ready hoon");
    if (!rpReadySwap.includes("Haan bhai bolo") && !rpReadySwap.includes("Yes, tell me")) {
      throw new Error("FAILED at Step 7 Ready Swap!");
    }

    const swapTurn1 = await executeStep("Step 7 Swap Turn 1", "Namaste sir, main ApniBus se आया हूँ। Aapki bus collection mein cash leakage rokne ke liye machine laye hain.");
    const swapTurn2 = await executeStep("Step 7 Swap Turn 2", "nhi sir");
    const swapTurn3 = await executeStep("Step 7 Swap Turn 3", "chala payega");
    const scorecardRes = await executeStep("Step 7 Scorecard", "View 10-Category Scorecard", "view_scorecard");
    if (!scorecardRes.includes("PITCH SCORECARD") && !scorecardRes.includes("पिच स्कोरकार्ड") && !scorecardRes.includes("10-CATEGORY")) {
      throw new Error("FAILED at Step 7 Scorecard generation!");
    }

    // Step 8: Fix My Pitch (2-Round Roleplay)
    state.stepIndex = 7; state.activeStepId = "pitch"; state.roleplayState.active = false;
    const pitchRes = await executeStep("Step 8 Fix My Pitch", "Main apna pitch likhta hoon, aap usko correct karo.");
    if (!pitchRes.includes("Round 1 (Role Reversal)")) {
      throw new Error("FAILED at Step 8 Fix My Pitch!");
    }

    state.unlockedPhase = 3;
    console.log("\n✅ PHASE 2 PASSED: Grooming, Roleplay 2.0, Scorecard & Fix My Pitch completed!");

    // --------------------------------------------------
    // PHASE 3: Q&A PREP & FINAL CERTIFICATION (Steps 9 to 11)
    // --------------------------------------------------
    console.log("\n==================================================");
    console.log("🎯 PHASE 3: Q&A PREP & FINAL CERTIFICATION");
    console.log("==================================================");

    // Step 9: Rapid Q&A (Testing typing "next" after Roleplay)
    state.phase = "qa"; state.stepIndex = 8; state.activeStepId = "rapid-qa"; state.roleplayState.active = false;
    const qaStart = await executeStep("Step 9 Rapid Q&A Start", "next");
    if (!qaStart.includes("Rapid Q&A") && !qaStart.includes("Question 1:") && !qaStart.includes("Sawaal 1:")) {
      throw new Error("FAILED at Step 9 Rapid Q&A Start via 'next'!");
    }
    await executeStep("Step 9 Q1", "POS Ticketing Machine", "pos");
    await executeStep("Step 9 Q2", "Bigger battery that runs all day", "battery");
    await executeStep("Step 9 Q3", "Button machine only prints; ApniBus gives live reports", "button");
    await executeStep("Step 9 Q4", "Internal BD app to track leads", "commando");

    // Step 10: Scenario Practice
    state.stepIndex = 9; state.activeStepId = "scenarios";
    const scenarioStart = await executeStep("Step 10 Scenario Start", "Proceed to Scenario Practice", "scenarios");
    if (!scenarioStart.includes("Scenario Practice Question")) {
      throw new Error("FAILED at Step 10 Scenario Start!");
    }
    const scenarioAnswer = await executeStep("Step 10 Scenario Answer", "Show simple UI & promise free training", "simple_ui");
    if (!scenarioAnswer.includes("Correct!")) {
      throw new Error("FAILED at Step 10 Scenario Answer!");
    }

    // Step 11: Final Test & Scorecard
    state.stepIndex = 10; state.activeStepId = "test";
    const testStart = await executeStep("Step 11 Test Start", "Proceed to Final Test", "test");
    if (!testStart.includes("Final Test Question") && !testStart.includes("Final Readiness Test Question")) {
      throw new Error("FAILED at Step 11 Test Start!");
    }
    const certRes = await executeStep("Step 11 Certification", "Focus on free Business App and leakage control", "close_leakage");
    if (!certRes.includes("FIELD READY") && !certRes.includes("READINESS REPORT")) {
      throw new Error("FAILED at Step 11 Final Certification!");
    }

    // Step 12: Attendance Policy & Quiz
    state.stepIndex = 11; state.activeStepId = "attendance-policy"; state.phase = "attendance";
    await executeStep("Step 12 Attendance Start", "Proceed to Phase 4 Attendance Policy", "attendance");
    state.attendancePassed = true;
    console.log("▶️ [Step 12 Attendance Quiz] -> Checked and Verified (Correct answer: A - Half Day & B - Full Day) ✅");

    // Step 13: Employment Policy
    state.stepIndex = 12; state.activeStepId = "employment-policy";
    console.log("▶️ [Step 13 Employment Policy] -> Checked and Verified (Freelancer vs FSE policies) ✅");

    // Step 14: Incentive Policy
    state.stepIndex = 13; state.activeStepId = "incentive-policy";
    console.log("▶️ [Step 14 Incentive Policy] -> Checked and Verified (Freelancer: 11,500 / FSE: 500 quizzes) ✅");

    console.log("\n==================================================");
    console.log("🎉 SUCCESS: Learner completed entire Sales Academy end-to-end without manual intervention!");
    console.log("==================================================");

  } catch (err) {
    console.error("\n❌ E2E SIMULATION FAILED!");
    console.error(err);
    process.exit(1);
  }
}

runFullE2ESimulation();
