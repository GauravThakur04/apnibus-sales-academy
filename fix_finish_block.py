with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

target_block = '''  if (acc) {
    const isDuplicate = state.messages.some(m => m.role === "assistant" && m.content === acc);
    if (!isDuplicate) {
      state.messages.push({ role: "assistant", content: acc });
      syncRoleplay(acc);
      checkpointPassed(acc);
      setChips(acc);
      save();
    }
  }'''

replacement_block = '''  if (acc) {
    assMsgObj.content = acc;
    syncRoleplay(acc);
    checkpointPassed(acc);
    setChips(acc);
    save();
  }'''

if target_block in code:
    code = code.replace(target_block, replacement_block)
    print("Replaced finish block cleanly!")
else:
    print("target_block not found...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Saved app.js!")
