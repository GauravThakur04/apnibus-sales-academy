with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Direct reliable Tab switching for btnGoToEmployment & btnGoToIncentive
old_btn_employment_click = '''  btnGoToEmployment.onclick = () => {
    advanceStep();
  };'''

new_btn_employment_click = '''  if (btnGoToEmployment) {
    btnGoToEmployment.onclick = () => {
      const tabEmp = document.getElementById("tabEmployment");
      const panelEmp = document.getElementById("panelEmployment");
      state.stepIndex = STEPS.findIndex(s => s.phase === "employment");
      state.mode = "employment";
      save();
      if (tabEmp) {
        tabEmp.removeAttribute("disabled");
        tabEmp.click();
      }
      document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
      if (panelEmp) panelEmp.style.display = "flex";
      updateSidebarStep();
    };
  }'''

if old_btn_employment_click in code:
    code = code.replace(old_btn_employment_click, new_btn_employment_click)
    print("Patched btnGoToEmployment direct handler in app.js!")

# Also patch global click handler for btnGoToEmployment and btnGoToIncentive
global_nav_patch = '''
/* Global Click Handler for Proceed Buttons */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("#btnGoToEmployment, #btnGoToIncentive, #tabAttendance, #tabEmployment, #tabIncentive");
  if (!btn) return;

  if (btn.id === "btnGoToEmployment") {
    const tabEmp = document.getElementById("tabEmployment");
    const panelEmp = document.getElementById("panelEmployment");
    if (tabEmp) {
      tabEmp.removeAttribute("disabled");
      document.querySelectorAll(".tab-btn").forEach(t => {
        t.classList.remove("active");
        t.style.background = "rgba(255,255,255,0.02)";
        t.style.border = "1px solid var(--line)";
        t.style.color = "#8FA0B8";
      });
      tabEmp.classList.add("active");
      tabEmp.style.background = "rgba(16, 185, 129, 0.15)";
      tabEmp.style.border = "1px solid var(--green)";
      tabEmp.style.color = "var(--green)";
    }
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    if (panelEmp) panelEmp.style.display = "flex";
    state.mode = "employment";
    save();
  }

  if (btn.id === "btnGoToIncentive") {
    const tabInc = document.getElementById("tabIncentive");
    const panelInc = document.getElementById("panelIncentive");
    if (tabInc) {
      tabInc.removeAttribute("disabled");
      document.querySelectorAll(".tab-btn").forEach(t => {
        t.classList.remove("active");
        t.style.background = "rgba(255,255,255,0.02)";
        t.style.border = "1px solid var(--line)";
        t.style.color = "#8FA0B8";
      });
      tabInc.classList.add("active");
      tabInc.style.background = "rgba(16, 185, 129, 0.15)";
      tabInc.style.border = "1px solid var(--green)";
      tabInc.style.color = "var(--green)";
    }
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    if (panelInc) panelInc.style.display = "flex";
    state.mode = "incentive";
    save();
  }

  if (btn.id === "tabAttendance") {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelAttendance");
    if (p) p.style.display = "flex";
  }
  if (btn.id === "tabEmployment" && !btn.disabled) {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelEmployment");
    if (p) p.style.display = "flex";
  }
  if (btn.id === "tabIncentive" && !btn.disabled) {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelIncentive");
    if (p) p.style.display = "flex";
  }
});
'''

if "/* Global Click Handler for Proceed Buttons */" not in code:
    code += "\n\n" + global_nav_patch
    print("Appended Global Click Handler for Proceed Buttons to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js with direct proceed button handlers!")
