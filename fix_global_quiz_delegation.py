with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Add robust direct event handlers and click delegation for attendance & policy quiz buttons
quiz_delegation_script = '''
/* Robust Global Click Handler for Attendance & Policy Quizzes */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("#attendanceQ1Options .part-btn, #attendanceQ2Options .part-btn, #incFseOptions .part-btn");
  if (!btn) return;

  const parent = btn.closest(".quiz-options");
  if (!parent) return;

  parent.querySelectorAll(".part-btn").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");

  const ans = btn.dataset.ans;

  // Attendance Q1
  if (parent.id === "attendanceQ1Options") {
    const feedback = document.getElementById("attendanceQ1Feedback");
    const q2Box = document.getElementById("attendanceQ2Box");
    if (ans === "A") {
      window._attQ1Done = true;
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! 3 visits falls under Half Day."; }
      if (q2Box) q2Box.style.display = "flex";
    } else {
      window._attQ1Done = false;
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Please check the attendance policy table above."; }
      if (q2Box) q2Box.style.display = "none";
    }
  }

  // Attendance Q2
  if (parent.id === "attendanceQ2Options") {
    const feedback = document.getElementById("attendanceQ2Feedback");
    const btnGo = document.getElementById("btnGoToEmployment");
    const tabEmp = document.getElementById("tabEmployment");
    if (ans === "B") {
      window._attQ2Done = true;
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! Closing 1 sale marks you Present (Full Day) regardless of visits."; }
      if (btnGo) btnGo.disabled = false;
      if (tabEmp) tabEmp.removeAttribute("disabled");
    } else {
      window._attQ2Done = false;
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Remember, closing 1 sale overrides visits."; }
      if (btnGo) btnGo.disabled = true;
    }
  }

  // Incentive Question
  if (parent.id === "incFseOptions") {
    const feedback = document.getElementById("incFseFeedback");
    const finishBtn = document.getElementById("attendanceFinishBtn");
    if (ans === "500" || ans === "17300") {
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! 5 sales yields ₹15,300 fixed retainer + ₹2,000 = ₹17,300 takeaway."; }
      if (finishBtn) finishBtn.disabled = false;
    } else {
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Please review the compensation schedule for 5 sales."; }
      if (finishBtn) finishBtn.disabled = true;
    }
  }
});
'''

if "/* Robust Global Click Handler for Attendance & Policy Quizzes */" not in code:
    code += "\n\n" + quiz_delegation_script
    print("Appended Robust Global Click Handler to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Applied global quiz delegation fix!")
