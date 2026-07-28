with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Find and replace the full showCertificateModal function
old_cert = '''async function showCertificateModal() {
  try {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    const cert = data.certificate || {};

    const learnerName = state.name || cert.recipientName || "BD Candidate";
    const certId = cert.certificateId || ("CERT-" + Math.floor(100000 + Math.random() * 900000));
    const rawScore = cert.readinessScore !== undefined ? cert.readinessScore : (state.score || 85);
    const readinessScore = typeof rawScore === 'string' ? parseInt(rawScore.replace(/%/g, ''), 10) || 85 : Math.round(rawScore);
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
}'''

new_cert = '''async function showCertificateModal() {
  try {
    const res = await fetch("/api/analytics");
    const data = await res.json();
    const cert = data.certificate || {};

    const learnerName = state.name || cert.recipientName || "BD Candidate";
    const learnerEmail = state.googleUser?.email || state.userRegistration?.email || "";
    const certId = cert.certificateId || ("CERT-" + Math.floor(100000 + Math.random() * 900000));
    const rawScore = cert.readinessScore !== undefined ? cert.readinessScore : (state.score || 85);
    const readinessScore = typeof rawScore === 'string' ? parseInt(rawScore.replace(/%/g, ''), 10) || 85 : Math.round(rawScore);
    const issueDate = cert.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    let modal = $("certificateModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "certificateModal";
      document.body.appendChild(modal);
    }

    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(8,12,22,0.95);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";

    modal.innerHTML = `
      <div id="printableCert" style="background:#101726;border:4px double #f0a227;border-radius:24px;padding:45px;max-width:820px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.95);position:relative;color:#fff;box-sizing:border-box;">

        <!-- Close button (hidden when printing) -->
        <div class="no-print" style="position:absolute;top:16px;right:16px;">
          <button id="closeCertX" style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:18px;border-radius:50%;width:36px;height:36px;cursor:pointer;display:grid;place-items:center;">✕</button>
        </div>

        <!-- Header: Logo + Certificate ID -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(240,162,39,0.3);padding-bottom:20px;margin-bottom:24px;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="logo.png" alt="ApniBus Logo" style="height:44px;" />
            <div style="text-align:left;">
              <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:17px;color:#fff;">ApniBus</div>
              <div style="font-size:11.5px;color:#9ca3af;">Field Sales Training Academy</div>
            </div>
          </div>
          <div style="text-align:right;">
            <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Certificate ID</span>
            <span style="font-family:'Archivo',sans-serif;font-weight:700;color:#f0a227;font-size:13px;">${certId}</span>
          </div>
        </div>

        <!-- Trophy -->
        <div style="font-size:52px;margin-bottom:10px;filter:drop-shadow(0 4px 12px rgba(240,162,39,0.5));">🏆 📜 🥇</div>

        <!-- Title -->
        <h1 style="font-family:'Archivo',sans-serif;font-size:28px;color:#fff;margin:0 0 6px 0;letter-spacing:1px;text-transform:uppercase;">Certificate of Sales Readiness</h1>
        <p style="color:#f0a227;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 22px 0;">Official Sales Certification</p>

        <!-- Candidate Name + Email ONLY -->
        <p style="color:#9ca3af;font-size:14px;margin:0 0 8px 0;">This is to certify that</p>
        <h2 style="font-family:'Archivo',sans-serif;font-size:34px;color:#10b981;margin:0 0 8px 0;border-bottom:2px dashed rgba(16,185,129,0.4);display:inline-block;padding-bottom:6px;">${learnerName}</h2>
        ${learnerEmail ? `<p style="color:#60A5FA;font-size:13px;font-weight:500;margin:0 0 20px 0;">✉ ${learnerEmail}</p>` : '<br/>'}

        <!-- Training Description -->
        <p style="color:#d1d5db;font-size:14.5px;line-height:1.7;max-width:660px;margin:0 auto 24px auto;">
          has successfully completed the <b>6-Phase Sales Operations &amp; Field Readiness Training</b> on <b>ApniBus POS Ticketing Machine</b>, <b>Objection Handling (A-A-A-A Framework)</b>, <b>Operator Pitch Simulation</b>, and <b>Policy Compliance</b>.
        </p>

        <!-- Score Badges -->
        <div class="cert-badge-row" style="display:flex;justify-content:center;gap:20px;margin-bottom:24px;flex-wrap:wrap;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 22px;border-radius:12px;">
            <span style="display:block;font-size:10.5px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Readiness Score</span>
            <b style="font-size:24px;color:#10b981;font-family:'Archivo',sans-serif;">${readinessScore}%</b>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 22px;border-radius:12px;">
            <span style="display:block;font-size:10.5px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Status</span>
            <b style="font-size:18px;color:#f0a227;font-family:'Archivo',sans-serif;">FIELD READY 🎉</b>
          </div>
        </div>

        <!-- Footer: Date + Authority -->
        <div class="cert-footer-row" style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.12);padding-top:16px;margin-top:12px;gap:10px;">
          <div style="text-align:left;">
            <span style="display:block;font-size:12px;color:#9ca3af;">Date: <b>${issueDate}</b></span>
            <span style="display:block;font-size:10.5px;color:#6B7280;margin-top:3px;">Certificate ID: ${certId}</span>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:14px;color:#fff;">VP of Sales &amp; Training</div>
            <span style="display:block;font-size:12px;color:#10b981;font-weight:600;">ApniBus Sales Academy</span>
          </div>
        </div>

        <!-- Action Buttons (hidden when printing) -->
        <div class="no-print" style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap;">
          <button id="downloadCertBtn" style="background:#10b981;color:#000;font-weight:700;padding:12px 26px;border-radius:10px;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;">📥 Download / Print Certificate</button>
          <button id="closeCertModalBtn" style="background:rgba(255,255,255,0.1);color:#fff;font-weight:700;padding:12px 22px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;font-size:14px;">✕ Close</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    $("closeCertX").onclick = () => modal.style.display = "none";
    $("closeCertModalBtn").onclick = () => modal.style.display = "none";
    $("downloadCertBtn").onclick = () => window.print();

  } catch (e) {
    toast("Unable to generate certificate. Please complete training first!");
  }
}'''

if old_cert in code:
    code = code.replace(old_cert, new_cert)
    print("Certificate modal replaced successfully!")
else:
    print("ERROR: Could not find old certificate code — checking partial match...")
    if 'const location = state.userRegistration?.location' in code:
        print("Found location line — need exact match fix")
    else:
        print("Certificate function not found at all!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))
print("Done.")
