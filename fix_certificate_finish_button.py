with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Global click listener for attendanceFinishBtn
finish_btn_global_patch = '''
/* Global Click Handler for Complete & Get Certificate Button */
document.addEventListener("click", function(e) {
  const finishBtn = e.target.closest("#attendanceFinishBtn");
  if (!finishBtn || finishBtn.disabled) return;

  state.attendancePassed = true;
  state.trainingCompleted = true;
  save();
  if (typeof syncWithBackend === "function") syncWithBackend();
  if (typeof syncGates === "function") syncGates();

  const nameStr = state.name || "BD Candidate";
  let modal = document.getElementById("congratsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "congratsModal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(11,15,25,0.92);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  modal.innerHTML = `
    <div style="background:#111827;border:1px solid #10b981;border-radius:20px;padding:40px;max-width:550px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);animation:popIn 0.3s ease;">
      <div style="font-size:64px;margin-bottom:12px;">🎉 🎓 🏆</div>
      <h2 style="font-family:'Archivo',sans-serif;font-size:28px;color:#fff;margin:0 0 10px 0;">Congratulations, ${nameStr}!</h2>
      <p style="color:#10b981;font-size:18px;font-weight:700;margin:0 0 20px 0;">You have successfully completed the ApniBus Sales Academy!</p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 30px 0;">You are now fully certified and field ready to pitch POS Ticketing Machines to Bus Operators.</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="closeCongratsBtn" class="btn primary-btn" style="background:#10b981;color:#000;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;">View Certificate / Report</button>
      </div>
    </div>
  `;

  const closeBtn = document.getElementById("closeCongratsBtn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      if (typeof showCertificateModal === "function") showCertificateModal();
    };
  }
});
'''

if "/* Global Click Handler for Complete & Get Certificate Button */" not in code:
    code += "\n\n" + finish_btn_global_patch
    print("Appended Global Click Handler for Complete & Get Certificate Button to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Applied finish button global delegation fix!")
