with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Fix send() in app.js: do NOT push assistant typing message to state.messages before fetch
target_send = '''  const assMsgObj = { role: "assistant", content: '<div class="typing"><i></i><i></i><i></i></div>' };
  state.messages.push(assMsgObj);
  
  const target = bubble("assistant", '<div class="typing"><i></i><i></i><i></i></div>');
  let acc = "";'''

replacement_send = '''  const target = bubble("assistant", '<div class="typing"><i></i><i></i><i></i></div>');
  let acc = "";'''

if target_send in code:
    code = code.replace(target_send, replacement_send)
    print("Fixed send() payload in app.js!")

# Update delta loop in app.js
target_delta = '''        if (ev === "delta") {
          acc += data.text;
          assMsgObj.content = acc;
          target.innerHTML = md(acc.replace(/\\[CHIP:[^\\]]+\\]/g, ""));
        }'''

replacement_delta = '''        if (ev === "delta") {
          acc += data.text;
          target.innerHTML = md(acc.replace(/\\[CHIP:[^\\]]+\\]/g, ""));
        }'''

if target_delta in code:
    code = code.replace(target_delta, replacement_delta)
    print("Fixed delta loop in app.js!")

# Update finish block in app.js
target_finish = '''  if (acc) {
    assMsgObj.content = acc;
    syncRoleplay(acc);
    checkpointPassed(acc);
    setChips(acc);
    save();
  }'''

replacement_finish = '''  if (acc) {
    state.messages.push({ role: "assistant", content: acc });
    syncRoleplay(acc);
    checkpointPassed(acc);
    setChips(acc);
    save();
  }'''

if target_finish in code:
    code = code.replace(target_finish, replacement_finish)
    print("Fixed finish block in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js cleanly!")
