/**
 * Analytics & Readiness Certificate Engine
 * Tracks user progress, streaks, weak area heatmaps, and readiness certificates.
 */

export class AnalyticsEngine {
  constructor(userProfile = {}) {
    this.profile = {
      userId: userProfile.userId || "usr_default",
      name: userProfile.name || "Gaurav Thakur",
      unlockedPhase: userProfile.unlockedPhase || 1,
      phase1Completed: userProfile.phase1Completed || 0,
      phase2Completed: userProfile.phase2Completed || 0,
      phase3Completed: userProfile.phase3Completed || 0,
      bestScore: userProfile.bestScore || 87,
      history: userProfile.history || []
    };
  }

  getOverallCompletionPercentage() {
    const p1Weight = (this.profile.phase1Completed / 5) * 33;
    const p2Weight = (this.profile.phase2Completed / 4) * 33;
    const p3Weight = (this.profile.phase3Completed / 3) * 34;
    return Math.round(p1Weight + p2Weight + p3Weight);
  }

  getWeakTopicsMap() {
    const counts = {};
    this.profile.history.forEach(session => {
      if (session.weakArea) {
        counts[session.weakArea] = (counts[session.weakArea] || 0) + 1;
      }
    });
    return counts;
  }

  generateCertificate() {
    const isEligible = this.profile.bestScore >= 80 && this.profile.unlockedPhase >= 2;
    if (!isEligible) {
      return {
        eligible: false,
        reason: "Achieve 80%+ Readiness Score in Roleplay to unlock your Sales Certificate."
      };
    }

    return {
      eligible: true,
      certificateId: `CERT-AB-${Date.now().toString(36).toUpperCase()}`,
      issueDate: new Date().toISOString().split("T")[0],
      recipientName: this.profile.name,
      title: "Certified Business Development Representative",
      issuer: "ApniBus Sales Academy",
      readinessScore: Math.round(this.profile.bestScore)
    };
  }
}
