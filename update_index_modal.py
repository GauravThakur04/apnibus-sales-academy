with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

target_modal_fields = '''        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase;">District / Location</label>
          <input type="text" id="regLocation" placeholder="Enter your district (e.g. Gurugram, Jaipur)" style="width: 100%; padding: 10px 14px; box-sizing: border-box; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; color: #fff; font-size: 14px;" required />
        </div>'''

replacement_modal_fields = '''        <div style="display: flex; flex-direction: column; gap: 6px;">
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
        </div>'''

if target_modal_fields in html:
    html = html.replace(target_modal_fields, replacement_modal_fields)
    print("Added regLang to index.html modal!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Updated index.html!")
