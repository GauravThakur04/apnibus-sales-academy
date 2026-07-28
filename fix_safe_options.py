with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_q_block = '''      if (ans === "A") {
        attendanceQ1Correct = true;
        q1Feedback.style.color = "#10B981";
        q1Feedback.innerHTML = "✓ Correct! 3 visits falls under Half Day. / सही उत्तर!";
        q2Box.style.display = "flex";
      } else {
        attendanceQ1Correct = false;
        q1Feedback.style.color = "#EF4444";
        q1Feedback.innerHTML = "✗ Incorrect. Please check the attendance policy table above. / गलत उत्तर।";
        q2Box.style.display = "none";
        btnGoToEmployment.disabled = true;
      }
    };
  });

  q2Options.forEach(btn => {
    btn.onclick = () => {
      q2Options.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "B") {
        attendanceQ2Correct = true;
        q2Feedback.style.color = "#10B981";
        q2Feedback.innerHTML = "✓ Correct! Closing 1 sale marks you Present (Full Day) regardless of visits. / सही उत्तर!";
        btnGoToEmployment.disabled = false;
        tabEmployment.removeAttribute("disabled");
      } else {
        attendanceQ2Correct = false;
        q2Feedback.style.color = "#EF4444";
        q2Feedback.innerHTML = "✗ Incorrect. Remember, closing 1 sale overrides visits. / गलत उत्तर।";
        btnGoToEmployment.disabled = true;
      }'''

new_q_block = '''      if (ans === "A") {
        attendanceQ1Correct = true;
        if (q1Feedback) { q1Feedback.style.color = "#10B981"; q1Feedback.innerHTML = "✓ Correct! 3 visits falls under Half Day. / सही उत्तर!"; }
        if (q2Box) q2Box.style.display = "flex";
      } else {
        attendanceQ1Correct = false;
        if (q1Feedback) { q1Feedback.style.color = "#EF4444"; q1Feedback.innerHTML = "✗ Incorrect. Please check the attendance policy table above. / गलत उत्तर।"; }
        if (q2Box) q2Box.style.display = "none";
        if (btnGoToEmployment) btnGoToEmployment.disabled = true;
      }
    };
  });

  q2Options.forEach(btn => {
    btn.onclick = () => {
      q2Options.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "B") {
        attendanceQ2Correct = true;
        if (q2Feedback) { q2Feedback.style.color = "#10B981"; q2Feedback.innerHTML = "✓ Correct! Closing 1 sale marks you Present (Full Day) regardless of visits. / सही उत्तर!"; }
        if (btnGoToEmployment) btnGoToEmployment.disabled = false;
        if (tabEmployment) tabEmployment.removeAttribute("disabled");
      } else {
        attendanceQ2Correct = false;
        if (q2Feedback) { q2Feedback.style.color = "#EF4444"; q2Feedback.innerHTML = "✗ Incorrect. Remember, closing 1 sale overrides visits. / गलत उत्तर।"; }
        if (btnGoToEmployment) btnGoToEmployment.disabled = true;
      }'''

if old_q_block in code:
    code = code.replace(old_q_block, new_q_block)
    print("Added null checks to q1Options & q2Options in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js with safe option handlers!")
