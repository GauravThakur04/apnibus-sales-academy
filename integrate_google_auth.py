with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

# 1. Add Google Identity Script in head
gsi_script = '<script src="https://accounts.google.com/gsi/client" async defer></script>'
if gsi_script not in html:
    html = html.replace('</head>', f'  {gsi_script}\n</head>')

# 2. Add Google Sign-In Button inside registrationModal
google_btn_html = '''      <div style="text-align: center;">
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
      </div>'''

old_modal_header = '''      <div style="text-align: center;">
        <img src="logo.png" alt="ApniBus" style="height: 40px; margin-bottom: 10px;" />
        <h2 style="font-family: 'Archivo'; color: #fff; margin: 0; font-size: 22px;">BD Onboarding Registration</h2>
        <p style="color: #8FA0B8; font-size: 13.5px; margin: 5px 0 0 0;">Fill in your details to start your Sales Academy training.</p>
      </div>'''

if old_modal_header in html:
    html = html.replace(old_modal_header, google_btn_html)
    print("Inserted Google Sign-In widget in index.html!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("HTML Google Auth script completed!")
