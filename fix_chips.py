import re

# 1. Update server.js
with open('server.js', 'rb') as f:
    server_code = f.read().decode('utf-8', errors='replace')

# Fix explicitStepId logic in getMockResponse
old_explicit = 'const explicitStepId = ctx?.activeStepId || state?.activeStepId || (selectedOptionId === "pitch" ? "pitch" : selectedOptionId === "objection" ? "objection" : selectedOptionId === "deep-dive" ? "deep-dive" : null);'

new_explicit = '''let explicitStepId = null;
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
  }'''

if old_explicit in server_code:
    server_code = server_code.replace(old_explicit, new_explicit)
    print("Replaced explicitStepId logic in server.js")

# Fix un-keyed chips in server.js fallback
server_code = server_code.replace('[CHIP: Fix my pitch] [CHIP: Objection handling]', '[CHIP: pitch|Fix my pitch] [CHIP: objection|Objection handling]')
server_code = server_code.replace('[CHIP: Product deep-dive] [CHIP: Objection handling] [CHIP: Roleplay karein. Aap customer bano.] [CHIP: Fix my pitch]', '[CHIP: deep-dive|Product deep-dive] [CHIP: objection|Objection handling] [CHIP: roleplay|Customer roleplay] [CHIP: pitch|Fix my pitch]')

with open('server.js', 'wb') as f:
    f.write(server_code.encode('utf-8'))
print("Saved server.js updates")

# 2. Update public/app.js
with open('public/app.js', 'rb') as f:
    app_code = f.read().decode('utf-8', errors='replace')

# Ensure send() updates stepIndex whenever selectedOptionId maps to a step
target_send = '// Intercept navigation commands from chips or "next" / "ok" after roleplay'
replacement_send = '''  // Auto-sync stepIndex on selectedOptionId chip click
  if (selectedOptionId) {
    const optStepIdx = STEPS.findIndex(s => 
      s.id === selectedOptionId || 
      (selectedOptionId === "qa" && s.id === "rapid-qa") ||
      (selectedOptionId === "roleplay" && s.id === "roleplay") ||
      (selectedOptionId === "pitch" && s.id === "pitch") ||
      (selectedOptionId === "objection" && s.id === "objection") ||
      (selectedOptionId === "deep-dive" && s.id === "deep-dive")
    );
    if (optStepIdx !== -1) {
      state.stepIndex = optStepIdx;
      state.mode = STEPS[optStepIdx].phase;
      renderToolbar(); updateSidebarStep();
      save();
    }
  }

  // Intercept navigation commands from chips or "next" / "ok" after roleplay'''

if target_send in app_code and "Auto-sync stepIndex on selectedOptionId chip click" not in app_code:
    app_code = app_code.replace(target_send, replacement_send)
    print("Replaced send() navigation logic in app.js")

with open('public/app.js', 'wb') as f:
    f.write(app_code.encode('utf-8'))
print("Saved app.js updates")
