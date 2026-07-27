with open('public/styles.css', 'rb') as f:
    css = f.read().decode('utf-8', errors='replace')

print_css = '''

/* Certificate Print & Download Optimization */
@media print {
  body * {
    visibility: hidden !important;
  }
  #certificateModal, #certificateModal *, #printableCert, #printableCert * {
    visibility: visible !important;
  }
  #certificateModal {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: #101726 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  #printableCert {
    border: 4px double #f0a227 !important;
    box-shadow: none !important;
    background: #101726 !important;
  }
  .no-print {
    display: none !important;
  }
}
'''

if 'Certificate Print & Download Optimization' not in css:
    css += print_css
    print("Added print CSS to styles.css!")

with open('public/styles.css', 'wb') as f:
    f.write(css.encode('utf-8'))

print("Updated styles.css!")
