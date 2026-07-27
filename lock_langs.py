with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

target_lang_click = '''document.querySelectorAll("#langs button").forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll("#langs button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    state.lang = b.dataset.lang; save();
    if (state.messages.length) send(`Ab se ${state.lang} mein baat karo.`);
  };
});'''

replacement_lang_click = '''document.querySelectorAll("#langs button").forEach((b) => {
  b.onclick = () => {
    if (state.langLocked) {
      toast(`🔒 Training language is locked to **${state.lang}** (selected during onboarding).`);
      return;
    }
    document.querySelectorAll("#langs button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    state.lang = b.dataset.lang; save();
    if (state.messages.length) send(`Ab se ${state.lang} mein baat karo.`);
  };
});'''

if target_lang_click in code:
    code = code.replace(target_lang_click, replacement_lang_click)
    print("Locked language switcher click handler in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js!")
