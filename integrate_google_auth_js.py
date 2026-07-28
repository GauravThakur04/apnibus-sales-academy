with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

google_js_handler = '''
/* Google OAuth 2.0 Identity Services Handler */
window.parseJwt = function(token) {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

window.handleGoogleSignIn = async function(response) {
  if (!response || !response.credential) return;
  const payload = window.parseJwt(response.credential);
  if (!payload) return;

  console.log("✓ Google Sign-In Successful:", payload);

  state.googleUser = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    sub: payload.sub
  };

  state.name = payload.name;
  if ($("regName")) $("regName").value = payload.name;

  // Auto-complete onboarding registration
  state.registered = true;
  state.userRegistration = {
    name: payload.name,
    email: payload.email,
    gender: $("regGender")?.value || "Male",
    age: $("regAge")?.value || "24",
    location: $("regLocation")?.value || "Gurugram",
    lang: $("regLang")?.value || "Hinglish",
    googleAuth: true,
    picture: payload.picture,
    registeredAt: new Date().toISOString()
  };

  save();

  // Send to backend
  try {
    await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: response.credential,
        user: state.googleUser,
        registration: state.userRegistration
      })
    });
  } catch (err) {
    console.error("Backend google auth sync error:", err);
  }

  // Hide onboarding modal
  if ($("registrationModal")) $("registrationModal").style.display = "none";
  toast(`Welcome ${payload.name}! Logged in via Google ✓`);

  renderGoogleUserUI();
};

function renderGoogleUserUI() {
  if (!state.googleUser || !state.googleUser.email) return;

  const topbarRight = document.querySelector(".topbar > div:last-child");
  if (!topbarRight) return;

  let googleBadge = document.getElementById("googleProfileBadge");
  if (!googleBadge) {
    googleBadge = document.createElement("div");
    googleBadge.id = "googleProfileBadge";
    googleBadge.style.cssText = "display:flex;align-items:center;gap:8px;background:rgba(66,133,244,0.12);border:1px solid rgba(66,133,244,0.4);padding:4px 12px 4px 6px;border-radius:20px;font-size:12px;color:#fff;";
    topbarRight.insertBefore(googleBadge, topbarRight.firstChild);
  }

  googleBadge.innerHTML = `
    <img src="${state.googleUser.picture}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid #4285F4;" alt="${state.googleUser.name}" />
    <div style="display:flex;flex-direction:column;">
      <span style="font-weight:700;font-size:11.5px;color:#fff;line-height:1.1;">${state.googleUser.name}</span>
      <span style="font-size:9.5px;color:#60A5FA;">${state.googleUser.email} ✓</span>
    </div>
  `;
}

// Auto render Google UI on boot if logged in
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { renderGoogleUserUI(); }, 500);
});
'''

if "/* Google OAuth 2.0 Identity Services Handler */" not in code:
    code += "\n\n" + google_js_handler
    print("Appended Google JS Handler to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("App.js Google OAuth integration completed!")
