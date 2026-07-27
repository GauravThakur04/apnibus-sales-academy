with open('public/manager.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

target_css_vars = '''    :root {
      --bg: #0b0e17;
      --panel: #131824;
      --card-bg: #181f30;
      --line: #222b3f;
      --line-light: rgba(255, 255, 255, 0.08);
      --green: #10b981;
      --green-light: rgba(16, 185, 129, 0.12);
      --amber: #f59e0b;
      --amber-light: rgba(245, 158, 11, 0.12);
      --red: #ef4444;
      --red-light: rgba(239, 68, 68, 0.12);
      --blue: #3b82f6;
      --blue-light: rgba(59, 130, 246, 0.12);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }'''

replacement_css_vars = '''    :root {
      --bg: #0c0f14;
      --panel: #141820;
      --card-bg: #1b212c;
      --line: #262e3d;
      --line-light: rgba(255, 255, 255, 0.08);
      --green: #10b981;
      --green-light: rgba(16, 185, 129, 0.14);
      --amber: #f59e0b;
      --amber-light: rgba(245, 158, 11, 0.14);
      --red: #ef4444;
      --red-light: rgba(239, 68, 68, 0.14);
      --cyan: #06b6d4;
      --cyan-light: rgba(6, 182, 212, 0.14);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }'''

if target_css_vars in html:
    html = html.replace(target_css_vars, replacement_css_vars)
    print("Replaced CSS variables in manager.html!")

# Replace any --blue references in manager.html
html = html.replace('var(--blue)', 'var(--cyan)')
html = html.replace('var(--blue-light)', 'var(--cyan-light)')
html = html.replace('color: var(--blue)', 'color: var(--cyan)')
html = html.replace('color: #60a5fa', 'color: var(--cyan)')
html = html.replace('3b82f6', '06b6d4')

with open('public/manager.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Updated manager.html color theme!")
