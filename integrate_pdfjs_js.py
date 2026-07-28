with open('public/app.js', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

# Replace the PPT viewer handler in renderVideoView
old_ppt_code = '''  // Handle PPT Viewer
  const pptViewer = $("pptViewer");
  const pptContainer = $("pptContainer");
  const pptFileName = $("pptFileName");
  if (v.ppt) {
    pptContainer.style.display = "flex";
    pptViewer.src = v.ppt;
    pptFileName.textContent = v.ppt.split('/').pop();
  } else {
    pptContainer.style.display = "none";
  }'''

new_ppt_code = '''  // Handle PPT / PDF Slide Deck
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

if old_ppt_code in code:
    code = code.replace(old_ppt_code, new_ppt_code)
    print("Replaced old PPT loading code in app.js!")

pdf_rendering_engine = '''
/* Mozilla PDF.js Interactive Slide Renderer */
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

window._currentPdfDoc = null;
window._currentPdfPage = 1;

window.loadPDFDocument = async function(pdfUrl) {
  const canvas = document.getElementById("pdfCanvas");
  const iframe = document.getElementById("pptViewer");
  const pageNumEl = document.getElementById("pdfPageNum");
  const pageCountEl = document.getElementById("pdfPageCount");

  if (!pdfUrl) return;

  if (typeof pdfjsLib === 'undefined') {
    if (iframe) {
      iframe.style.display = "block";
      iframe.src = pdfUrl;
    }
    if (canvas) canvas.style.display = "none";
    return;
  }

  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    window._currentPdfDoc = await loadingTask.promise;
    if (pageCountEl) pageCountEl.textContent = window._currentPdfDoc.numPages;
    window._currentPdfPage = 1;

    await window.renderPDFPage(window._currentPdfPage);

    if (iframe) iframe.style.display = "none";
    if (canvas) canvas.style.display = "block";
  } catch (err) {
    console.error("PDF.js render error, falling back to iframe/embed:", err);
    if (iframe) {
      iframe.style.display = "block";
      iframe.src = pdfUrl;
    }
    if (canvas) canvas.style.display = "none";
  }
};

window.renderPDFPage = async function(num) {
  if (!window._currentPdfDoc) return;
  try {
    const page = await window._currentPdfDoc.getPage(num);
    const canvas = document.getElementById("pdfCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const viewport = page.getViewport({ scale: 1.4 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    const pageNumEl = document.getElementById("pdfPageNum");
    if (pageNumEl) pageNumEl.textContent = num;
  } catch (e) {
    console.error("Error rendering PDF page:", e);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("pdfPrevPage");
  const nextBtn = document.getElementById("pdfNextPage");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (window._currentPdfPage <= 1) return;
      window._currentPdfPage--;
      window.renderPDFPage(window._currentPdfPage);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (!window._currentPdfDoc || window._currentPdfPage >= window._currentPdfDoc.numPages) return;
      window._currentPdfPage++;
      window.renderPDFPage(window._currentPdfPage);
    };
  }
});
'''

if "/* Mozilla PDF.js Interactive Slide Renderer */" not in code:
    code += "\n\n" + pdf_rendering_engine
    print("Appended PDF.js Engine to app.js!")

with open('public/app.js', 'wb') as f:
    f.write(code.encode('utf-8'))

print("PDF rendering integration complete!")
