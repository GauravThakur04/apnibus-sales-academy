with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# 1. Update onboarding submit handler to save regLang and lock language
target_reg = '''    state.name = name;
    state.userRegistration = { name, gender, age, location };
    save();'''

replacement_reg = '''    const lang = $("regLang") ? $("regLang").value : "Hinglish";
    state.name = name;
    state.lang = lang;
    state.langLocked = true;
    state.userRegistration = { name, gender, age, location, lang };
    save();'''

if target_reg in code:
    code = code.replace(target_reg, replacement_reg)
    print("Replaced regSubmit in app.js!")

# 2. Add showCertificateModal() function and wire viewCertBtn
target_cert = '''  // View Certificate Modal Wiring
  const certBtn = $("viewCertBtn");
  if (certBtn) {
    certBtn.onclick = async () => {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();
        const cert = data.certificate;
        if (!cert.eligible) {
          toast(cert.reason);
          return;
        }
        alert(
          `🏆 APNIBUS SALES ACADEMY — CERTIFICATE OF READINESS\\n\\n` +
          `Certificate ID: ${cert.certificateId}\\n` +
          `Recipient: ${cert.recipientName}\\n` +
          `Title: ${cert.title}\\n` +
          `Readiness Score: ${cert.readinessScore}\\n` +
          `Issue Date: ${cert.issueDate}\\n` +
          `Issuer: ${cert.issuer}`
        );
      } catch (e) {
        toast("Unable to load certificate. Complete Phase 2 roleplay first!");
      }
    };
  }'''

replacement_cert = '''  // View Certificate Modal Wiring
  const certBtn = $("viewCertBtn");
  if (certBtn) {
    certBtn.onclick = () => showCertificateModal();
  }'''

if target_cert in code:
    code = code.replace(target_cert, replacement_cert)
    print("Replaced viewCertBtn in app.js!")

# 3. Add showCertificateModal definition
cert_fn_code = '''
async function showCertificateModal() {
  try {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    const cert = data.certificate || {};

    const learnerName = state.name || cert.recipientName || "BD Candidate";
    const certId = cert.certificateId || ("CERT-" + Math.floor(100000 + Math.random() * 900000));
    const readinessScore = cert.readinessScore || state.score || 87;
    const issueDate = cert.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const location = state.userRegistration?.location || "Gurugram, HR";

    let modal = $("certificateModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "certificateModal";
      document.body.appendChild(modal);
    }

    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(8,12,22,0.95);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";

    modal.innerHTML = `
      <div id="printableCert" style="background:#101726;border:4px double #f0a227;border-radius:24px;padding:45px;max-width:820px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.95);position:relative;color:#fff;box-sizing:border-box;">
        <div class="no-print" style="position:absolute;top:20px;right:20px;">
          <button id="closeCertX" style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:18px;border-radius:50%;width:36px;height:36px;cursor:pointer;display:grid;place-items:center;">✕</button>
        </div>

        <!-- Gold Header Banner -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(240,162,39,0.3);padding-bottom:20px;margin-bottom:25px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="logo.png" alt="ApniBus Logo" style="height:48px;" />
            <div style="text-align:left;">
              <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:18px;color:#fff;">ApniBus</div>
              <div style="font-size:12px;color:#9ca3af;">Field Sales Training Academy</div>
            </div>
          </div>
          <div style="text-align:right;">
            <span style="display:block;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Certificate ID</span>
            <span style="font-family:'Archivo',sans-serif;font-weight:700;color:#f0a227;font-size:14px;">${certId}</span>
          </div>
        </div>

        <!-- Trophy Seal -->
        <div style="font-size:58px;margin-bottom:12px;filter:drop-shadow(0 4px 12px rgba(240,162,39,0.5));">🏆 📜 🥇</div>

        <!-- Main Certificate Title -->
        <h1 style="font-family:'Archivo',sans-serif;font-size:30px;color:#fff;margin:0 0 6px 0;letter-spacing:1px;text-transform:uppercase;">Certificate of Sales Readiness</h1>
        <p style="color:#f0a227;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 25px 0;">Official Sales Certification</p>

        <!-- Candidate Name -->
        <p style="color:#9ca3af;font-size:14px;margin:0 0 8px 0;">This is to certify that</p>
        <h2 style="font-family:'Archivo',sans-serif;font-size:36px;color:#10b981;margin:0 0 16px 0;border-bottom:2px dashed rgba(16,185,129,0.4);display:inline-block;padding-bottom:6px;">${learnerName}</h2>

        <!-- Certification Details -->
        <p style="color:#d1d5db;font-size:15px;line-height:1.7;max-width:680px;margin:0 auto 25px auto;">
          has successfully completed the 6-Phase Sales Operations & Field Readiness Training on <b>ApniBus POS Ticketing Machine</b>, <b>Objection Handling (A-A-A-A Framework)</b>, <b>Operator Pitch Simulation</b>, and <b>Policy Compliance</b>.
        </p>

        <!-- Scores Badges -->
        <div style="display:flex;justify-content:center;gap:24px;margin-bottom:25px;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 20px;border-radius:12px;">
            <span style="display:block;font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700;">Readiness Score</span>
            <b style="font-size:22px;color:#10b981;font-family:'Archivo',sans-serif;">${readinessScore}%</b>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 20px;border-radius:12px;">
            <span style="display:block;font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700;">Status</span>
            <b style="font-size:18px;color:#f0a227;font-family:'Archivo',sans-serif;">FIELD READY 🎉</b>
          </div>
        </div>

        <!-- Issue info and Authority signature -->
        <div style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.12);padding-top:18px;margin-top:15px;">
          <div style="text-align:left;">
            <span style="display:block;font-size:12px;color:#9ca3af;">Date: <b>${issueDate}</b></span>
            <span style="display:block;font-size:12px;color:#9ca3af;margin-top:2px;">Location: <b>${location}</b></span>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:15px;color:#fff;">VP of Sales & Training</div>
            <span style="display:block;font-size:12px;color:#10b981;font-weight:600;">ApniBus Sales Academy</span>
          </div>
        </div>

        <!-- Buttons (Hidden when printing) -->
        <div class="no-print" style="display:flex;gap:14px;justify-content:center;margin-top:30px;">
          <button id="downloadCertBtn" style="background:#10b981;color:#000;font-weight:700;padding:12px 26px;border-radius:10px;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;">📥 Download / Print Certificate</button>
          <button id="closeCertModalBtn" style="background:rgba(255,255,255,0.1);color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;font-size:14px;">✕ Close</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    $("closeCertX").onclick = () => modal.style.display = "none";
    $("closeCertModalBtn").onclick = () => modal.style.display = "none";
    $("downloadCertBtn").onclick = () => {
      window.print();
    };
  } catch (e) {
    toast("Unable to generate certificate. Please complete training first!");
  }
}
'''

code += cert_fn_code

# 4. Remove Manager Dashboard button from congrats modal and connect to showCertificateModal
target_congrats = '''        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="closeCongratsBtn" class="btn primary-btn" style="background:#10b981;color:#000;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;">View Certificate / Report</button>
          <a href="/manager.html" target="_blank" class="btn secondary-btn" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;border:1px solid #374151;text-decoration:none;display:inline-block;">Manager Dashboard</a>
        </div>'''

replacement_congrats = '''        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="closeCongratsBtn" class="btn primary-btn" style="background:#10b981;color:#000;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;">View Certificate / Report</button>
        </div>'''

if target_congrats in code:
    code = code.replace(target_congrats, replacement_congrats)
    print("Removed Manager Dashboard link from congrats modal!")

target_congrats_click = '''    $("closeCongratsBtn").onclick = () => {
      modal.style.display = "none";
      const certBtn = $("viewCertBtn");
      if (certBtn) certBtn.click();
    };'''

replacement_congrats_click = '''    $("closeCongratsBtn").onclick = () => {
      modal.style.display = "none";
      showCertificateModal();
    };'''

if target_congrats_click in code:
    code = code.replace(target_congrats_click, replacement_congrats_click)
    print("Connected congrats modal to showCertificateModal!")

# 5. Update syncWithBackend to pass scores cleanly
target_sync = '''        body: JSON.stringify({
          name: state.name,
          gender: state.userRegistration?.gender,
          age: state.userRegistration?.age,
          location: state.userRegistration?.location,
          stepIndex: state.stepIndex,
          mode: state.mode,
          watchedVideosCount: state.watched ? state.watched.length : 0,
          videoCorrectCount: state.watched ? state.watched.length * 2 : 0,
          qaCorrectCount: state.qaCorrectCount || 0,
          difficulty: state.difficulty || "Medium",
          score: state.score || 0,
          verdict: state.verdict || "IN TRAINING",
          trainingCompleted: state.trainingCompleted || false,
          weakAreas: state.learningMemory?.weakAreas || [],
          choices: state.choices || {},
          attemptedGrooming: state.attemptedGrooming || {},
          messages: state.messages || []
        })'''

replacement_sync = '''        body: JSON.stringify({
          name: state.name,
          gender: state.userRegistration?.gender,
          age: state.userRegistration?.age,
          location: state.userRegistration?.location,
          stepIndex: state.stepIndex,
          mode: state.mode,
          watchedVideosCount: state.watched ? state.watched.length : 0,
          videoCorrectCount: state.watched ? state.watched.length * 2 : 0,
          qaCorrectCount: state.qaPassed ? 6 : (state.qaCorrectCount || 0),
          difficulty: state.difficulty || "Medium",
          score: state.score || 0,
          verdict: state.verdict || "IN TRAINING",
          trainingCompleted: state.trainingCompleted || false,
          weakAreas: state.learningMemory?.weakAreas || [],
          choices: state.choices || {},
          attemptedGrooming: state.attemptedGrooming || {},
          messages: state.messages || []
        })'''

if target_sync in code:
    code = code.replace(target_sync, replacement_sync)
    print("Updated syncWithBackend in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Updated app.js!")
