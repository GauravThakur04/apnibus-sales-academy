with open('public/index.html', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_header_right_block = '''      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); padding: 5px 14px 5px 6px; border-radius: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
          <div style="width: 42px; height: 42px; border-radius: 50%; overflow: hidden; background: #0f172a; border: 2px solid #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 10px rgba(16,185,129,0.3);">
            <img src="top_right_logo.png" alt="ApniBus AI Coach" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; transform: scale(1.25);" />
          </div>
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.2px;">ApniBus AI Coach</span>
            <span style="font-size: 10.5px; color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Online &amp; Ready
            </span>
          </div>
        </div>
      </div>'''

new_header_right_block = '''      <div style="display: flex; align-items: center; gap: 16px;">
        <img src="top_right_logo.png" alt="ApniBus Sales Representative" style="height: 95px; width: auto; object-fit: contain; display: block; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.4)); margin: -20px 0 -15px 0;" />
        <div class="status" id="status"><span class="dot"></span> Ready</div>
      </div>'''

if old_header_right_block in code:
    code = code.replace(old_header_right_block, new_header_right_block)
    print("Replaced with 100% full uncropped picture in index.html!")
else:
    import re
    code = re.sub(r'<div style="display: flex; align-items: center; gap: 12px;">.*?</div>\s*</div>', new_header_right_block, code, flags=re.DOTALL)
    print("Regex replaced header right area with full uncropped picture!")

with open('public/index.html', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Uncropped full picture display patch completed!")
