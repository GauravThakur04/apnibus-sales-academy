with open('public/index.html', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_topbar = '''    <header class="topbar">
      <div>
        <h1 id="stageTitle">Phase 1 — Videos</h1>
        <p id="stageSub">Watch all videos, then Grooming unlocks</p>
      </div>
      <div class="status" id="status"><span class="dot"></span> Ready</div>
    </header>'''

new_topbar = '''    <header class="topbar">
      <div>
        <h1 id="stageTitle">Phase 1 — Videos</h1>
        <p id="stageSub">Watch all videos, then Grooming unlocks</p>
      </div>
      <div style="display: flex; align-items: center; gap: 14px;">
        <img src="top_right_logo.png" alt="ApniBus Logo" style="height: 36px; max-width: 140px; object-fit: contain; border-radius: 6px; background: rgba(255,255,255,0.05); padding: 2px 6px;" />
        <div class="status" id="status"><span class="dot"></span> Ready</div>
      </div>
    </header>'''

if old_topbar in code:
    code = code.replace(old_topbar, new_topbar)
    print("Added photo at top right in index.html!")

with open('public/index.html', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Top right photo integration script completed!")
