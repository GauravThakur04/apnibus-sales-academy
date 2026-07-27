with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

target_boot = '''/* boot */
(async () => {
  // Onboarding registration check
  if (!state.userRegistration) {
    $("registrationModal").style.display = "flex";
  }'''

replacement_boot = '''/* boot */
(async () => {
  // URL Query Param auto-resume check (e.g. ?user=Rahul or ?candidate=Rahul)
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get("user") || urlParams.get("candidate") || urlParams.get("name");

  if (userParam && (!state.userRegistration || state.name.toLowerCase() !== userParam.toLowerCase())) {
    try {
      const res = await fetch("/api/results");
      const results = await res.json();
      const existing = results.find(u => u.name && u.name.toLowerCase() === userParam.toLowerCase());
      if (existing) {
        state.name = existing.name;
        state.userRegistration = {
          name: existing.name,
          gender: existing.gender || "Male",
          age: existing.age || "25",
          location: existing.location || "Default",
          lang: existing.choices?.lang || state.lang || "Hinglish"
        };
        if (existing.stepIndex !== undefined) state.stepIndex = existing.stepIndex;
        if (existing.score !== undefined) state.score = existing.score;
        save();
      }
    } catch (e) {
      console.log("Could not auto-resume from URL param", e);
    }
  }

  // Onboarding registration check
  if (!state.userRegistration) {
    $("registrationModal").style.display = "flex";
  }'''

if target_boot in code:
    code = code.replace(target_boot, replacement_boot)
    print("Added URL param auto-resume to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js!")
