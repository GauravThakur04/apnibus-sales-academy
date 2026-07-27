with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

target_gochat = '''function goChat(mode) {
  state.mode = mode; save();
  $("videoView").hidden = true;
  $("chatView").hidden = false;
  $("attendanceView").hidden = true;
  setPhaseUI(mode);
  renderToolbar(); updateSidebarStep();
  render();

  // If in video mode with a pendingCheck, ensure checkpoint question is asked
  if (mode === "videos" && state.pendingCheck && !streaming) {
    const count = getAssistantCountSinceLastSystem();
    if (count === 0) {
      const v = VIDEOS.find(vid => vid.id === state.pendingCheck);
      if (v) {
        send(
          `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
          true
        );
      }
    }
  }
}'''

replacement_gochat = '''function goChat(mode) {
  state.mode = mode; save();
  
  const visibleMsgs = state.messages.filter((m) => !m.content.startsWith("[SYSTEM]"));
  if (mode === "videos" && visibleMsgs.length === 0 && !state.pendingCheck) {
    goVideos();
    return;
  }

  $("videoView").hidden = true;
  $("chatView").hidden = false;
  $("attendanceView").hidden = true;
  setPhaseUI(mode);
  renderToolbar(); updateSidebarStep();
  render();

  // If in video mode with a pendingCheck, trigger question immediately if not already asked
  if (mode === "videos" && state.pendingCheck && !streaming) {
    const v = VIDEOS.find(vid => vid.id === state.pendingCheck) || VIDEOS[state.current] || VIDEOS[0];
    const lastAss = [...state.messages].reverse().find(m => m.role === "assistant" && !m.content.startsWith("[SYSTEM]"));
    if (!lastAss) {
      send(
        `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
        true
      );
    }
  }
}'''

if target_gochat in code:
    code = code.replace(target_gochat, replacement_gochat)
    print("Updated goChat in app.js!")
else:
    print("target_gochat not found directly...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Saved app.js!")
