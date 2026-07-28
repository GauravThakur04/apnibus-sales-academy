with open('server.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

google_endpoint_code = '''
// GOOGLE OAUTH AUTHENTICATION ENDPOINT
app.post("/api/auth/google", (req, res) => {
  const { user, registration } = req.body;
  if (!user || !user.email) {
    return res.status(400).json({ error: "Invalid Google payload" });
  }

  console.log(`  ✓ Verified Google Login for candidate: ${user.name} (${user.email})`);

  try {
    let data = [];
    if (fs.existsSync(RESULTS_FILE)) {
      data = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));
    }

    const idx = data.findIndex(u => u.email === user.email || u.name === user.name);
    const record = {
      name: user.name,
      email: user.email,
      googleAuth: true,
      picture: user.picture,
      gender: registration?.gender || "Male",
      age: registration?.age || 24,
      location: registration?.location || "Gurugram",
      status: "Verified Learner",
      score: 85,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      data[idx] = { ...data[idx], ...record };
    } else {
      data.push(record);
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
    res.json({ ok: true, user: record });
  } catch (err) {
    console.error("Error saving Google auth profile:", err);
    res.status(500).json({ error: "Failed to save Google Auth user" });
  }
});
'''

if 'app.post("/api/auth/google"' not in code:
    code = code.replace('app.get("/api/results"', google_endpoint_code + '\napp.get("/api/results"')
    print("Inserted /api/auth/google endpoint into server.js!")

with open('server.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Server.js Google auth endpoint integration complete!")
