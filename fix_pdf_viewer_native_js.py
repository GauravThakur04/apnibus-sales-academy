with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_ppt_loading_js = '''  // Handle PPT / PDF Slide Deck
  const pptContainer = $("pptContainer");
  const pptFileName = $("pptFileName");
  const openBtn = $("pdfOpenNativeBtn");
  if (v.ppt) {
    if (pptContainer) pptContainer.style.display = "flex";
    if (pptFileName) pptFileName.textContent = v.ppt.split('/').pop();
    if (openBtn) openBtn.href = v.ppt;
    window.loadPDFDocument(v.ppt);
  } else {
    if (pptContainer) pptContainer.style.display = "none";
  }'''

new_ppt_loading_js = '''  // Handle PPT / PDF Slide Deck
  const pptContainer = $("pptContainer");
  const pptFileName = $("pptFileName");
  const openBtn = $("pdfOpenNativeBtn");
  const pptObjectViewer = $("pptObjectViewer");
  const pptEmbedViewer = $("pptEmbedViewer");

  if (v.ppt) {
    const pdfPath = v.ppt + "#toolbar=1";
    if (pptContainer) pptContainer.style.display = "flex";
    if (pptFileName) pptFileName.textContent = v.ppt.split('/').pop();
    if (openBtn) openBtn.href = v.ppt;
    if (pptObjectViewer) pptObjectViewer.data = pdfPath;
    if (pptEmbedViewer) pptEmbedViewer.src = pdfPath;
  } else {
    if (pptContainer) pptContainer.style.display = "none";
  }'''

if old_ppt_loading_js in code:
    code = code.replace(old_ppt_loading_js, new_ppt_loading_js)
    print("Updated PPT loading logic in app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("PDF loading JS update completed!")
