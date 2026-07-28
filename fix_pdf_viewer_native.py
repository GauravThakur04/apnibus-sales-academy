with open('public/index.html', 'rb') as f:
    html = f.read().decode('utf-8', errors='replace')

old_ppt_block = '''        <div class="vright-panel" id="pptContainer" style="display: flex; flex-direction: column; gap: 10px;">
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

new_ppt_block = '''        <div class="vright-panel" id="pptContainer" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="ppt-header" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--line);">
            <div>
              <h3 style="margin: 0; font-size: 14px; color: #fff;">📊 Presentation Slides (PPT)</h3>
              <span class="ppt-file-label" id="pptFileName" style="color: var(--amber); font-size: 12px; font-weight: 600;">Apnibus Introduction.pdf</span>
            </div>
            <a id="pdfOpenNativeBtn" href="PPT/Apnibus intro Final.pdf" target="_blank" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #10b981; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none;">↗ Open Full PDF / Presentation</a>
          </div>

          <!-- Native Embedded PDF Viewer -->
          <div class="ppt-body" style="background: #1e293b; border-radius: 8px; height: 580px; display: flex; justify-content: center; align-items: center; border: 1px solid var(--line); overflow: hidden;">
            <object id="pptObjectViewer" data="PPT/Apnibus intro Final.pdf#toolbar=1" type="application/pdf" style="width: 100%; height: 100%; border: none; border-radius: 8px;">
              <embed id="pptEmbedViewer" src="PPT/Apnibus intro Final.pdf#toolbar=1" type="application/pdf" style="width: 100%; height: 100%; border: none;" />
              <div style="color: #fff; padding: 20px; text-align: center;">
                <p style="color: #8FA0B8; margin-bottom: 12px;">Browser native preview unavailable.</p>
                <a href="PPT/Apnibus intro Final.pdf" target="_blank" style="background: var(--amber); color: #000; padding: 8px 16px; border-radius: 6px; font-weight: 700; text-decoration: none;">Click to Open Presentation Slides PDF</a>
              </div>
            </object>
          </div>
        </div>'''

if old_ppt_block in html:
    html = html.replace(old_ppt_block, new_ppt_block)
    print("Replaced pptContainer with Native Embedded PDF Object Viewer in index.html!")
else:
    import re
    html = re.sub(r'<div class="vright-panel" id="pptContainer".*?<!-- CHAT VIEW -->', new_ppt_block + '\n\n    <!-- CHAT VIEW -->', html, flags=re.DOTALL)
    print("Regex replaced pptContainer!")

with open('public/index.html', 'wb') as f:
    f.write(html.encode('utf-8'))

print("Native PDF viewer HTML integration completed!")
