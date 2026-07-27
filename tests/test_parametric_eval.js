import { evaluateSessionParametric } from '../domain/evaluationEngine.js';

function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING 12-RUBRIC PARAMETRIC EVALUATION ENGINE");
  console.log("==================================================");

  // Test 1: Excellent Pitch
  console.log("\n--- TEST 1: Excellent Pitch Evaluation ---");
  const excelHistory = [
    { role: "user", content: "Namaste sir, I am Gaurav from ApniBus. Can I take two minutes? Sir, how do you track your daily collection and conductor cash leakage?" },
    { role: "assistant", content: "Conductor brings cashbox." },
    { role: "user", content: "Sir, with our POS machine you get the Business App completely free on your phone to track live trips and passenger tickets. Can I set up a live demo on one bus tomorrow?" }
  ];

  const excelEval = evaluateSessionParametric(excelHistory);
  console.log(`Overall Score: ${excelEval.overallPct}% | Verdict: ${excelEval.verdict}`);
  console.log("Rubric Breakdown:", excelEval.rubrics);
  console.log("Recommendation:", excelEval.recommendation);

  if (excelEval.overallPct < 75) throw new Error("Excellent pitch score too low!");

  // Test 2: Poor Pitch
  console.log("\n--- TEST 2: Poor Pitch Evaluation ---");
  const poorHistory = [
    { role: "user", content: "Buy machine." },
    { role: "user", content: "Because it is good." }
  ];

  const poorEval = evaluateSessionParametric(poorHistory);
  console.log(`Overall Score: ${poorEval.overallPct}% | Verdict: ${poorEval.verdict}`);
  console.log("Recommendation:", poorEval.recommendation);

  if (poorEval.overallPct > 65) throw new Error("Poor pitch score too high!");

  console.log("\n==================================================");
  console.log("🎉 ALL PARAMETRIC EVALUATION TESTS PASSED!");
  console.log("==================================================");
}

runTests();
