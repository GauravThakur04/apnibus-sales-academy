with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Update send() streaming logic in app.js so assistant message is part of state.messages during streaming
target_send_start = '''  streaming = true;
  $("send").disabled = true;
  input.disabled = true;
  $("status").className = "status busy";
  $("status").innerHTML = '<span class="dot"></span> Coach is thinking';

  const watchdog = setTimeout(() => {
    if (streaming) {
      console.warn("Stream safety watchdog triggered!");
      streaming = false;
      $("send").disabled = false;
      input.disabled = false;
      $("status").className = "status";
      $("status").innerHTML = '<span class="dot"></span> Ready';
      toast("⚠️ Connection timed out. Please try sending again.");
    }
  }, 20000);

  const target = bubble("assistant", '<div class="typing"><i></i><i></i><i></i></div>');
  let acc = "";'''

replacement_send_start = '''  streaming = true;
  $("send").disabled = true;
  input.disabled = true;
  $("status").className = "status busy";
  $("status").innerHTML = '<span class="dot"></span> Coach is thinking';

  const watchdog = setTimeout(() => {
    if (streaming) {
      console.warn("Stream safety watchdog triggered!");
      streaming = false;
      $("send").disabled = false;
      input.disabled = false;
      $("status").className = "status";
      $("status").innerHTML = '<span class="dot"></span> Ready';
      toast("⚠️ Connection timed out. Please try sending again.");
    }
  }, 20000);

  const assMsgObj = { role: "assistant", content: '<div class="typing"><i></i><i></i><i></i></div>' };
  state.messages.push(assMsgObj);
  
  const target = bubble("assistant", '<div class="typing"><i></i><i></i><i></i></div>');
  let acc = "";'''

if target_send_start in code:
    code = code.replace(target_send_start, replacement_send_start)
    print("Replaced send start in app.js!")
else:
    print("target_send_start not matched directly...")

# Update streaming delta loop to update assMsgObj.content
target_delta = '''        if (ev === "delta") {
          acc += data.text;
          target.innerHTML = md(acc.replace(/\\[CHIP:[^\\]]+\\]/g, ""));
        }'''

replacement_delta = '''        if (ev === "delta") {
          acc += data.text;
          assMsgObj.content = acc;
          target.innerHTML = md(acc.replace(/\\[CHIP:[^\\]]+\\]/g, ""));
        }'''

if target_delta in code:
    code = code.replace(target_delta, replacement_delta)
    print("Replaced delta loop in app.js!")
else:
    print("target_delta not matched directly...")

# Update streaming completion so we don't double-push assistant message
target_finish = '''  streaming = false;
  clearTimeout(watchdog);
  $("send").disabled = false;
  input.disabled = false;
  $("status").className = "status";
  $("status").innerHTML = '<span class="dot"></span> Ready';

  if (acc) {
    const isDuplicate = state.messages.some(m => m.role === "assistant" && m.content === acc);
    if (!isDuplicate) {
      state.messages.push({ role: "assistant", content: acc });
      syncRoleplay(acc);
      checkpointPassed(acc);
      setChips(acc);
      save();
    }
  }'''

replacement_finish = '''  streaming = false;
  clearTimeout(watchdog);
  $("send").disabled = false;
  input.disabled = false;
  $("status").className = "status";
  $("status").innerHTML = '<span class="dot"></span> Ready';

  if (acc) {
    assMsgObj.content = acc;
    syncRoleplay(acc);
    checkpointPassed(acc);
    setChips(acc);
    save();
  }'''

if target_finish in code:
    code = code.replace(target_finish, replacement_finish)
    print("Replaced finish loop in app.js!")
else:
    print("target_finish not matched directly...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js for persistent streaming rendering!")
