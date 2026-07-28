with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

# 1. Remove Google GSI Script from head
gsi_script = '  <script src="https://accounts.google.com/gsi/client" async defer></script>\n'
if gsi_script in html:
    html = html.replace(gsi_script, '')

# 2. Remove registrationModal element completely from body
import re
html = re.sub(r'<!-- Onboarding Registration Modal.*?</div>\s*</div>', '', html, flags=re.DOTALL)
html = re.sub(r'<div id="registrationModal".*?</div>\s*</div>', '', html, flags=re.DOTALL)

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Removed registrationModal and Google GSI script from index.html!")

with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Bypass registrationModal display check in boot()
old_reg_check = '''  // Onboarding registration check
  if (!state.userRegistration) {
    $("registrationModal").style.display = "flex";
  }'''

new_reg_check = '''  // Auto-initialize candidate profile without modal popup
  if (!state.userRegistration) {
    state.name = state.name || "BD Candidate";
    state.userRegistration = { name: state.name, gender: "Male", age: "25", location: "Gurugram" };
    save();
  }
  if ($("registrationModal")) $("registrationModal").style.display = "none";'''

if old_reg_check in code:
    code = code.replace(old_reg_check, new_reg_check)

# Remove googleProfileBadge rendering if present
code = code.replace('renderGoogleUserUI();', '// renderGoogleUserUI();')

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Removed registration modal popup and Google Auth checks from app.js!")
