import { AppStateMachine, PHASES, STEPS } from '../domain/stateMachine.js';

function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING STATE MACHINE ENGINE & PROGRESSION GATES");
  console.log("==================================================");

  const machine = new AppStateMachine();

  // Test 1: Phase 1 initially unlocked, Phase 2 locked
  console.log("\n--- TEST 1: Initial Phase Unlocks ---");
  const p1Unlocked = machine.isPhaseUnlocked(PHASES.PHASE_1);
  const p2Unlocked = machine.isPhaseUnlocked(PHASES.PHASE_2);
  console.log(`Phase 1 Unlocked: ${p1Unlocked} (Expected: true)`);
  console.log(`Phase 2 Unlocked: ${p2Unlocked} (Expected: false)`);
  if (!p1Unlocked || p2Unlocked) throw new Error("Initial phase unlocks failed!");

  // Test 2: Watching all 5 videos unlocks Phase 2
  console.log("\n--- TEST 2: Completing 5 Videos Unlocks Phase 2 ---");
  machine.completeVideo("intro");
  machine.completeVideo("business");
  machine.completeVideo("commando-lead");
  machine.completeVideo("commando-meeting");
  machine.completeVideo("commando-replacement");

  const p2NowUnlocked = machine.isPhaseUnlocked(PHASES.PHASE_2);
  console.log(`Phase 2 Unlocked after 5 videos: ${p2NowUnlocked} (Expected: true)`);
  if (!p2NowUnlocked) throw new Error("Phase 2 unlocking failed!");

  // Test 3: Advancing steps sequentially
  console.log("\n--- TEST 3: Sequential Step Advancement ---");
  const initialStep = machine.getCurrentStep();
  machine.advanceStep();
  const nextStep = machine.getCurrentStep();
  console.log(`Initial Step: ${initialStep.title} -> Next Step: ${nextStep.title}`);
  if (initialStep.id === nextStep.id) throw new Error("Step advancement failed!");

  console.log("\n==================================================");
  console.log("🎉 ALL STATE MACHINE TESTS PASSED!");
  console.log("==================================================");
}

runTests();
