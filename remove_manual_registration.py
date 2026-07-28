with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

old_modal_content = '''  <!-- Onboarding Registration Modal -->
  <div id="registrationModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 15, 30, 0.95); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
    <div style="background: var(--surface); border: 1px solid var(--line); border-radius: 12px; width: 100%; max-width: 450px; padding: 30px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
      <div style="text-align: center;">
        <img src="logo.png" alt="ApniBus" style="height: 40px; margin-bottom: 10px;" />
        <h2 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 22px;">BD Onboarding Registration</h2>
        <p style="color: #8FA0B8; font-size: 13.5px; margin: 5px 0 0 0;">Fill in your details to start your Sales Academy training.</p>
      </div>

      <!-- Google Sign-In Widget -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--line); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <div id="g_id_onload"
             data-client_id="912392915264-57iaqmc18moadkokl89nlf006nga4oun.apps.googleusercontent.com"
             data-callback="handleGoogleSignIn"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-size="large"
             data-theme="filled_blue"
             data-text="sign_in_with"
             data-shape="rectangular"
             data-logo_alignment="left"
             data-width="360">
        </div>
        <span style="color: #10B981; font-size: 11.5px; font-weight: 600;">🔒 Quick 1-Click Verification via Google</span>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; color: #8FA0B8; font-size: 12px; margin: -5px 0;">
        <div style="flex: 1; height: 1px; background: var(--line);"></div>
        <span>OR MANUAL DETAILS</span>
        <div style="flex: 1; height: 1px; background: var(--line);"></div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Full Name</label>
          <input type="text" id="regName" placeholder="Enter your full name" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px;" required />
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Gender</label>
          <select id="regGender" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer;">
            <option value="Male">Male (पुरुष)</option>
            <option value="Female">Female (महिला)</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Age</label>
          <input type="number" id="regAge" placeholder="Enter your age" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px;" required min="18" max="70" />
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">District / Location</label>
          <input type="text" id="regLocation" placeholder="Enter your district (e.g. Gurugram, Jaipur)" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px;" required />
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">Preferred Training Language (प्रशिक्षण भाषा)</label>
          <select id="regLang" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer;">
            <option value="Hinglish">Hinglish (Roman Transliteration)</option>
            <option value="हिंदी">हिंदी (Devanagari)</option>
            <option value="English">English</option>
          </select>
        </div>
      </div>

      <button id="regSubmitBtn" class="done-btn" style="width: 100%; padding: 12px; font-size: 14px; font-weight: 700;">Submit & Start Training</button>
    </div>
  </div>'''

new_modal_content = '''  <!-- Onboarding Registration Modal (Pure Google Auth) -->
  <div id="registrationModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 15, 30, 0.95); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(10px);">
    <div style="background: var(--surface); border: 1px solid var(--line); border-radius: 16px; width: 100%; max-width: 420px; padding: 36px 30px; box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center;">
      <div>
        <img src="logo.png" alt="ApniBus" style="height: 44px; margin-bottom: 12px;" />
        <h2 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 22px;">ApniBus Sales Academy</h2>
        <p style="color: #8FA0B8; font-size: 13.5px; margin: 6px 0 0 0;">Please sign in with your Google Account to access your training session.</p>
      </div>

      <!-- Google Sign-In Widget -->
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--line); border-radius: 12px; padding: 22px 16px; display: flex; flex-direction: column; align-items: center; gap: 14px;">
        <div id="g_id_onload"
             data-client_id="912392915264-57iaqmc18moadkokl89nlf006nga4oun.apps.googleusercontent.com"
             data-callback="handleGoogleSignIn"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-size="large"
             data-theme="filled_blue"
             data-text="sign_in_with"
             data-shape="rectangular"
             data-logo_alignment="left"
             data-width="340">
        </div>
        <span style="color: #10B981; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
          <span>🔒</span> Verified Google Account Authentication
        </span>
      </div>
    </div>
  </div>'''

if old_modal_content in html:
    html = html.replace(old_modal_content, new_modal_content)
    print("Replaced modal with pure Google Sign-In layout in index.html!")
else:
    import re
    html = re.sub(r'<!-- Onboarding Registration Modal -->.*?</div>\s*</div>', new_modal_content, html, flags=re.DOTALL)
    print("Regex replaced onboarding registration modal!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Manual detail fields removed completely!")
