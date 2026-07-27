with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Update boot section around line 1400
target_boot = '''  await initVideos();
  const currentStep = STEPS[state.stepIndex] || STEPS[0];
  state.mode = currentStep.phase;
  if (state.mode === "videos" && !state.pendingCheck) {
    state.current = state.stepIndex;
    goVideos();
  } else {
    goChat(state.mode);
  }'''

replacement_boot = '''  await initVideos();
  const currentStep = STEPS[state.stepIndex] || STEPS[0];
  state.mode = currentStep.phase;
  if (state.mode === "videos") {
    state.pendingCheck = null;
    state.current = state.stepIndex < 4 ? state.stepIndex : 0;
    save();
    goVideos();
  } else {
    goChat(state.mode);
  }'''

if target_boot in code:
    code = code.replace(target_boot, replacement_boot)
    print("Updated boot logic in app.js!")
else:
    print("target_boot not matched directly, attempting regex...")
    import re
    code = re.sub(
        r'if \(state\.mode === "videos" && !state\.pendingCheck\) \{[\s\S]*?\} else \{[\s\S]*?goChat\(state\.mode\);\s*\}',
        'if (state.mode === "videos") {\n    state.pendingCheck = null;\n    state.current = state.stepIndex < 4 ? state.stepIndex : 0;\n    save();\n    goVideos();\n  } else {\n    goChat(state.mode);\n  }',
        code,
        count=1
    )
    print("Updated boot logic via regex!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Saved app.js boot update!")
