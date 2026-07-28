with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Safe event binding for Attendance, Employment, Incentive option buttons
old_attendance_init = '''  btnAttFreelance.onclick = () => {
    btnAttFreelance.classList.add("active");
    btnAttFse.classList.remove("active");
    attFreelanceInfo.style.display = "flex";
    attFseInfo.style.display = "none";
    employmentSelected = "Freelance";
    state.attendanceChoice = "Freelance";
    save();
    btnGoToEmployment.disabled = false;
    tabEmployment.removeAttribute("disabled");
  };

  btnAttFse.onclick = () => {
    btnAttFse.classList.add("active");
    btnAttFreelance.classList.remove("active");
    attFseInfo.style.display = "flex";
    attFreelanceInfo.style.display = "none";
    employmentSelected = "FSE";
    state.attendanceChoice = "FSE";
    save();
    btnGoToEmployment.disabled = !(attendanceQ1Correct && attendanceQ2Correct);
    if (attendanceQ1Correct && attendanceQ2Correct) {
      tabEmployment.removeAttribute("disabled");
    } else {
      tabEmployment.setAttribute("disabled", "true");
    }
  };'''

new_attendance_init = '''  if (btnAttFreelance) {
    btnAttFreelance.onclick = () => {
      btnAttFreelance.classList.add("active");
      if (btnAttFse) btnAttFse.classList.remove("active");
      if (attFreelanceInfo) attFreelanceInfo.style.display = "flex";
      if (attFseInfo) attFseInfo.style.display = "none";
      employmentSelected = "Freelance";
      state.attendanceChoice = "Freelance";
      save();
      if (btnGoToEmployment) btnGoToEmployment.disabled = false;
      if (tabEmployment) tabEmployment.removeAttribute("disabled");
    };
  }

  if (btnAttFse) {
    btnAttFse.onclick = () => {
      btnAttFse.classList.add("active");
      if (btnAttFreelance) btnAttFreelance.classList.remove("active");
      if (attFseInfo) attFseInfo.style.display = "flex";
      if (attFreelanceInfo) attFreelanceInfo.style.display = "none";
      employmentSelected = "FSE";
      state.attendanceChoice = "FSE";
      save();
      if (btnGoToEmployment) btnGoToEmployment.disabled = !(attendanceQ1Correct && attendanceQ2Correct);
      if (attendanceQ1Correct && attendanceQ2Correct) {
        if (tabEmployment) tabEmployment.removeAttribute("disabled");
      } else {
        if (tabEmployment) tabEmployment.setAttribute("disabled", "true");
      }
    };
  }'''

if old_attendance_init in code:
    code = code.replace(old_attendance_init, new_attendance_init)
    print("Patched initAttendancePage safe click bindings in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Attendance click crash fix applied!")
