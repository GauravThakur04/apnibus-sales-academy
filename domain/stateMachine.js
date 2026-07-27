/**
 * Deterministic State Machine Engine
 * Controls module transitions, locks, unlocks, and progression gating.
 */

export const PHASES = {
  PHASE_1: "videos",
  PHASE_2: "grooming",
  PHASE_3: "qa"
};

export const STEPS = [
  // Phase 1 - Videos (0 to 4)
  { phase: "videos", id: "intro", title: "Video 1: ApniBus Introduction", next: "business" },
  { phase: "videos", id: "business", title: "Video 2: ApniBus Business App", next: "commando-lead" },
  { phase: "videos", id: "commando-lead", title: "Video 3: Lead & Orders", next: "commando-meeting" },
  { phase: "videos", id: "commando-meeting", title: "Video 4: Add Meeting", next: "commando-replacement" },
  { phase: "videos", id: "commando-replacement", title: "Video 5: POS Replacement", next: "deep-dive" },

  // Phase 2 - Grooming (5 to 8)
  { phase: "grooming", id: "deep-dive", title: "Product Deep-Dive", say: "Product deep-dive karao — POS ke features aur benefits.", next: "objection" },
  { phase: "grooming", id: "objection", title: "Objection Handling", say: "Objection handling sikhao — A-A-A-A framework se.", next: "pitch" },
  { phase: "grooming", id: "pitch", title: "Fix My Pitch", say: "Main apna pitch likhta hoon, aap usko correct karo. Pehle mujhe batao kaise likhun.", next: "roleplay" },
  { phase: "grooming", id: "roleplay", title: "Customer Roleplay", say: "Roleplay karein. Aap customer bano.", next: "rapid-qa" },

  // Phase 3 - Q&A Prep (9 to 11)
  { phase: "qa", id: "rapid-qa", title: "Rapid Q&A", say: "Rapid Q&A shuru karo — operator ke asli sawaal poocho.", next: "scenarios" },
  { phase: "qa", id: "scenarios", title: "Scenario Practice", say: "Scenario questions poocho.", next: "test" },
  { phase: "qa", id: "test", title: "Final Test & Score", say: "Final roleplay lo aur mujhe readiness score do.", next: null }
];

export class AppStateMachine {
  constructor(initialState = {}) {
    this.state = {
      activePhase: initialState.activePhase || PHASES.PHASE_1,
      stepIndex: initialState.stepIndex || 0,
      watchedVideos: initialState.watchedVideos || [],
      unlockedPhase: initialState.unlockedPhase || 1,
      difficulty: initialState.difficulty || "Medium"
    };
  }

  getCurrentStep() {
    return STEPS[this.state.stepIndex] || STEPS[0];
  }

  isPhaseUnlocked(phase) {
    if (phase === PHASES.PHASE_1) return true;
    if (phase === PHASES.PHASE_2) return this.state.unlockedPhase >= 2;
    if (phase === PHASES.PHASE_3) return this.state.unlockedPhase >= 3;
    return false;
  }

  completeVideo(videoId) {
    if (!this.state.watchedVideos.includes(videoId)) {
      this.state.watchedVideos.push(videoId);
    }
    if (this.state.watchedVideos.length >= 5) {
      this.state.unlockedPhase = Math.max(this.state.unlockedPhase, 2);
    }
    return this.state;
  }

  advanceStep() {
    if (this.state.stepIndex < STEPS.length - 1) {
      this.state.stepIndex++;
      const next = this.getCurrentStep();
      this.state.activePhase = next.phase;
    }
    return this.state;
  }
}
