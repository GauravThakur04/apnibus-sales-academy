with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# 1. Simplify doneBtn.onclick so it NEVER blocks with alert and ALWAYS opens chat with questions
target_done = '''$("doneBtn").onclick = () => {
  const v = VIDEOS[state.current];
  if (!v) return;

  const hasVideo = state.viewedVideo[v.id];
  const hasPPT = state.viewedPPT[v.id] || !v.ppt;

  if (!hasVideo || !hasPPT) {
    alert("⚠️ Please view both the Video and the Presentation Slides (PPT) sections before proceeding to the checkpoint questions!\\n\\n(Note: On mobile, switch between 'Watch Video' and 'View Slides (PPT)' tabs at the top to open both sections.)");
    return;
  }

  state.pendingCheck = v.id;
  save();
  goChat("videos");
  send(
    `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
    true
  );
};'''

replacement_done = '''$("doneBtn").onclick = () => {
  const v = VIDEOS[state.current];
  if (!v) return;

  state.viewedVideo[v.id] = true;
  state.viewedPPT[v.id] = true;
  state.pendingCheck = v.id;
  save();
  goChat("videos");
  send(
    `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
    true
  );
};'''

if target_done in code:
    code = code.replace(target_done, replacement_done)
    print("Replaced doneBtn.onclick in app.js")
else:
    print("target_done not found directly, checking regex...")

# 2. Update goChat to auto-trigger questions if pendingCheck is active and no assistant question is showing
target_gochat = '''function goChat(mode) {
  state.mode = mode; save();
  $("videoView").hidden = true;
  $("chatView").hidden = false;
  $("attendanceView").hidden = true;
  setPhaseUI(mode);
  renderToolbar(); updateSidebarStep();
  render();
}'''

replacement_gochat = '''function goChat(mode) {
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

if target_gochat in code:
    code = code.replace(target_gochat, replacement_gochat)
    print("Replaced goChat in app.js")
else:
    print("target_gochat not found directly...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js for instant video questions!")
