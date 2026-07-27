with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Define lowerMsg at top of send() in app.js
target = '''async function send(text, hidden = false, selectedOptionId = null) {
  const msg = (text ?? input.value).trim();
  if (!msg || streaming) return;'''

replacement = '''async function send(text, hidden = false, selectedOptionId = null) {
  const msg = (text ?? input.value).trim();
  if (!msg || streaming) return;
  const lowerMsg = msg.toLowerCase();'''

if target in code:
    code = code.replace(target, replacement)
    print("Fixed lowerMsg definition in app.js!")
else:
    print("target not found...")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js cleanly!")
