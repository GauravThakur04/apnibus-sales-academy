with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# 1. Update renderVList() to call goVideos() on video click
code = code.replace(
    'b.onclick = () => { state.current = +b.dataset.i; save(); showVideo(state.current); };',
    'b.onclick = () => { state.current = +b.dataset.i; save(); goVideos(); };'
)

# 2. Update render() to handle pending questions gracefully
target_render = '''function render() {
  thread.innerHTML = "";
  state.messages
    .filter((m) => !m.content.startsWith("[SYSTEM]"))
    .forEach((m) => {
      // Strip [CHIP:...] tags from history message rendering
      const cleanContent = m.role === "assistant" ? m.content.replace(/\\[CHIP:[^\\]]+\\]/g, "") : m.content;
      bubble(m.role, md(cleanContent));
    });
  // thread.scrollTop = thread.scrollHeight;

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
    print("Replaced render() in app.js")
else:
    print("target_render not matched exactly, checking regex...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js!")
