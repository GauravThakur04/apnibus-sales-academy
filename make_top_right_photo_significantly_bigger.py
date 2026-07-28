with open('public/index.html', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_img_str = '<img src="top_right_logo.png" alt="ApniBus Photo" style="height: 78px; max-height: 85px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); margin: -10px 0;" />'

new_img_str = '<img src="top_right_logo.png" alt="ApniBus Hero Photo" style="height: 150px; max-height: 160px; width: auto; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.5)); margin: -40px 0 -30px 0; z-index: 10; position: relative;" />'

if old_img_str in code:
    code = code.replace(old_img_str, new_img_str)
    print("Updated photo to 150px hero size in index.html!")
else:
    import re
    code = re.sub(r'<img src="top_right_logo\.png"[^>]*>', new_img_str, code)
    print("Regex replaced photo to 150px hero size!")

with open('public/index.html', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Significantly bigger photo patch applied!")
