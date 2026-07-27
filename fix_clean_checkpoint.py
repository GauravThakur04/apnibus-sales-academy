with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# 1. Update doneBtn.onclick to clear previous chat clutter and launch clean checkpoint
target_done = '''$("doneBtn").onclick = () => {
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

replacement_done = '''$("doneBtn").onclick = () => {
  const v = VIDEOS[state.current];
  if (!v) return;

  state.viewedVideo[v.id] = true;
  state.viewedPPT[v.id] = true;
  state.pendingCheck = v.id;
  state.messages = []; // Clear old chat clutter for a clean checkpoint view
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
    print("target_done not found directly...")

# 2. Update render() to scroll to top/bottom cleanly and ensure chips render
target_render = '''function render() {
  thread.innerHTML = "";
  const visibleMsgs = state.messages.filter((m) => !m.content.startsWith("[SYSTEM]"));
  
  visibleMsgs.forEach((m) => {
    const cleanContent = m.role === "assistant" ? m.content.replace(/\\[CHIP:[^\\]]+\\]/g, "") : m.content;
    bubble(m.role, md(cleanContent));
  });

  // If chat is empty but a system question was requested, show loading state
  if (visibleMsgs.length === 0 && state.messages.some(m => m.content.startsWith("[SYSTEM]"))) {
    bubble("assistant", "<i>Loading checkpoint question... Please wait a moment. ⏳</i>");
  }

  // Render chips for the last assistant message
  const assistantMsgs = state.messages.filter(m => m.role === "assistant" && !m.content.startsWith("[SYSTEM]"));
  if (assistantMsgs.length) {
    setChips(assistantMsgs[assistantMsgs.length - 1].content);
  } else {
    setChips("");
  }
}'''

replacement_render = '''function render() {
  thread.innerHTML = "";
  const visibleMsgs = state.messages.filter((m) => !m.content.startsWith("[SYSTEM]"));
  
  visibleMsgs.forEach((m) => {
    const cleanContent = m.role === "assistant" ? m.content.replace(/\\[CHIP:[^\\]]+\\]/g, "") : m.content;
    bubble(m.role, md(cleanContent));
  });

  // If chat is empty but a system question was requested, show loading state
  if (visibleMsgs.length === 0 && state.messages.some(m => m.content.startsWith("[SYSTEM]"))) {
    bubble("assistant", "<i>Loading checkpoint question... Please wait a moment. ⏳</i>");
  }

  // Scroll thread to top if only 1-2 messages, else scroll to bottom
  if (visibleMsgs.length <= 2) {
    thread.scrollTop = 0;
  } else {
    thread.scrollTop = thread.scrollHeight;
  }

  // Render chips for the last assistant message
  const assistantMsgs = state.messages.filter(m => m.role === "assistant" && !m.content.startsWith("[SYSTEM]"));
  if (assistantMsgs.length) {
    setChips(assistantMsgs[assistantMsgs.length - 1].content);
  } else {
    setChips("");
  }
}'''

if target_render in code:
    code = code.replace(target_render, replacement_render)
    print("Replaced render in app.js")
else:
    print("target_render not found directly...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js!")
