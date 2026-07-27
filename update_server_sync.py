with open('server.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

target_body = '''  const {
    name, gender, age, location, stepIndex, mode,
    watchedVideosCount, difficulty, score, verdict, weakAreas, choices, attemptedGrooming, messages
  } = req.body;'''

replacement_body = '''  const {
    name, gender, age, location, stepIndex, mode,
    watchedVideosCount, difficulty, score, verdict, weakAreas, choices, attemptedGrooming, messages,
    videoCorrectCount, qaCorrectCount, trainingCompleted
  } = req.body;'''

if target_body in code:
    code = code.replace(target_body, replacement_body)
    print("Replaced sync-state req.body in server.js!")

target_record = '''    const record = {
      name,
      gender: gender || currentUser.gender,
      age: age || currentUser.age,
      location: location || currentUser.location,
      status: score >= 80 ? "COMPLETED" : (score > 0 ? "FAILED" : "IN_TRAINING"),
      score: score || 0,
      verdict: verdict || "IN TRAINING",
      weakAreas: weakAreas || [],
      choices: choices || { attendance: "", employment: "", incentive: "" },
      attemptedGrooming: attemptedGrooming || { deepDive: false, objection: false, roleplay: false, pitchCorrection: false },
      qaChoices,
      messages: messages || [],
      updatedAt: new Date().toISOString()
    };'''

replacement_record = '''    const calculatedQaScore = Object.values(qaChoices).filter(v => v.includes("(Correct)")).length;
    const isCompleted = trainingCompleted || (choices && choices.incentive) || (score >= 80);

    const record = {
      name,
      gender: gender || currentUser.gender,
      age: age || currentUser.age,
      location: location || currentUser.location,
      status: isCompleted ? "COMPLETED" : (score > 0 ? "FAILED" : "IN_TRAINING"),
      score: score || 0,
      verdict: verdict || "IN TRAINING",
      trainingCompleted: isCompleted ? true : false,
      videoCorrectCount: videoCorrectCount !== undefined ? videoCorrectCount : ((watchedVideosCount || 0) * 2),
      qaCorrectCount: qaCorrectCount !== undefined ? qaCorrectCount : calculatedQaScore,
      weakAreas: weakAreas || [],
      choices: choices || { attendance: "", employment: "", incentive: "" },
      attemptedGrooming: attemptedGrooming || { deepDive: false, objection: false, roleplay: false, pitchCorrection: false },
      qaChoices,
      messages: messages || [],
      updatedAt: new Date().toISOString()
    };'''

if target_record in code:
    code = code.replace(target_record, replacement_record)
    print("Replaced sync-state record in server.js!")

with open('server.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated server.js!")
