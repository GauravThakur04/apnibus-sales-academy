with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Target lines 1136 to 1201 in app.js
pattern = r'// Auto-sync stepIndex when user clicks a chip or sends a step prompt[\s\S]*?if \(!msg\.startsWith\("\[SYSTEM\]"\)\) \{'

replacement = '''// Auto-sync stepIndex when selectedOptionId or explicit step trigger is passed
  if (selectedOptionId) {
    const optStepIdx = STEPS.findIndex(s => 
      s.id === selectedOptionId || 
      (selectedOptionId === "qa" && s.id === "rapid-qa") ||
      (selectedOptionId === "roleplay" && s.id === "roleplay") ||
      (selectedOptionId === "pitch" && s.id === "pitch") ||
      (selectedOptionId === "objection" && s.id === "objection") ||
      (selectedOptionId === "deep-dive" && s.id === "deep-dive") ||
      (selectedOptionId === "scenarios" && s.id === "scenarios") ||
      (selectedOptionId === "test" && s.id === "test") ||
      (selectedOptionId === "attendance" && s.id === "attendance-policy") ||
      (selectedOptionId === "employment" && s.id === "employment-policy") ||
      (selectedOptionId === "incentive" && s.id === "incentive-policy")
    );
    if (optStepIdx !== -1) {
      state.stepIndex = optStepIdx;
      state.mode = STEPS[optStepIdx].phase;
      renderToolbar(); updateSidebarStep();
      save();
    }
  } else if (msg) {
    // Match exact step say phrase only
    const exactStepIdx = STEPS.findIndex(s => s.say && s.say.toLowerCase() === lowerMsg);
    if (exactStepIdx !== -1) {
      state.stepIndex = exactStepIdx;
      state.mode = STEPS[exactStepIdx].phase;
      renderToolbar(); updateSidebarStep();
      save();
    }
  }

  // Intercept navigation commands from chips or "next" / "ok" after roleplay
  if (!msg.startsWith("[SYSTEM]")) {'''

import re
new_code = re.sub(pattern, replacement, code, count=1)

# Now target attendance navigation intercept block
att_pattern = r'if \(selectedOptionId === "attendance" \|\| lower\.includes\("attendance"\) \|\| lower\.includes\("proceed to phase 4"\) \|\| lower\.includes\("policy"\)\) \{[\s\S]*?return;\s*\}'
att_replacement = '''if (selectedOptionId === "attendance" || lower.includes("attendance") || lower.includes("proceed to phase 4") || lower.includes("policy")) {
      input.value = "";
      const attStepIdx = STEPS.findIndex(s => s.phase === "attendance");
      if (attStepIdx !== -1) {
        state.stepIndex = attStepIdx;
        state.mode = "attendance";
        save();
        goAttendance();
        return;
      }
      advanceStep();
      return;
    }'''

new_code = re.sub(att_pattern, att_replacement, new_code, count=1)

with open('public/app.js', 'wb') as f:
    f.write(new_code.encode('utf-8'))

print("Applied precision step sync and attendance navigation fix to app.js!")
