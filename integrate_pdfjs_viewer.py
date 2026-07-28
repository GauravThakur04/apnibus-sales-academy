with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

# 1. Add Mozilla PDF.js in head
pdfjs_cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>'
if pdfjs_cdn not in html:
    html = html.replace('</head>', f'  {pdfjs_cdn}\n</head>')

# 2. Update pptContainer HTML with interactive slide deck controls & canvas renderer
old_ppt_container = '''        <div class="vright-panel" id="pptContainer">
          <div class="ppt-header">
            <h3>📊 Presentation Slides (PPT)</h3>
            <span class="ppt-file-label" id="pptFileName">Apnibus Introduction.pdf</span>
          </div>
          <div class="ppt-body">
            <iframe id="pptViewer" src="about:blank" style="width: 100%; height: 580px; border: none; border-radius: 8px; background: #fff;"></iframe>
          </div>
        </div>'''

new_ppt_container = '''        <div class="vright-panel" id="pptContainer" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="ppt-header" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--line);">
            <div>
              <h3 style="margin: 0; font-size: 14px; color: #fff;">📊 Presentation Slides</h3>
              <span class="ppt-file-label" id="pptFileName" style="color: var(--amber); font-size: 12px; font-weight: 600;">Apnibus Introduction.pdf</span>
            </div>
            <a id="pdfOpenNativeBtn" href="#" target="_blank" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; padding: 6px 12px; border-radius: 6px; font-size: 11.5px; font-weight: 700; text-decoration: none;">↗ Open Full PDF</a>
          </div>

          <!-- Slide Controls Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #111827; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--line);">
            <button id="pdfPrevPage" style="background: var(--surface); border: 1px solid var(--line); color: #fff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">◀ Prev</button>
            <span style="color: #8FA0B8; font-size: 12px; font-weight: 600;">Slide <b id="pdfPageNum" style="color: #fff;">1</b> of <b id="pdfPageCount" style="color: #fff;">1</b></span>
            <button id="pdfNextPage" style="background: var(--surface); border: 1px solid var(--line); color: #fff; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700;">Next ▶</button>
          </div>

          <!-- Canvas & IFrame Container -->
          <div class="ppt-body" style="background: #000; border-radius: 8px; min-height: 480px; display: flex; justify-content: center; align-items: center; overflow: auto; position: relative;">
            <canvas id="pdfCanvas" style="max-width: 100%; height: auto; border-radius: 4px; display: block;"></canvas>
            <iframe id="pptViewer" src="about:blank" style="display: none; width: 100%; height: 520px; border: none; border-radius: 8px; background: #fff;"></iframe>
          </div>
        </div>'''

if old_ppt_container in html:
    html = html.replace(old_ppt_container, new_ppt_container)
    print("Replaced pptContainer with Interactive PDF.js Slide Deck in index.html!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("PDF.js HTML integration completed!")
