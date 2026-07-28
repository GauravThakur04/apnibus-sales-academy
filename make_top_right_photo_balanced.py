with open('public/index.html', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_img_str = '<img src="top_right_logo.png" alt="ApniBus Hero Photo" style="height: 150px; max-height: 160px; width: auto; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(0,0,0,0.5)); margin: -40px 0 -30px 0; z-index: 10; position: relative;" />'

new_img_str = '<img src="top_right_logo.png" alt="ApniBus Photo" style="height: 54px; max-height: 56px; width: auto; object-fit: contain; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.3)); margin: -4px 0;" />'

if old_img_str in code:
    code = code.replace(old_img_str, new_img_str)
    print("Updated photo to 54px balanced size in index.html!")
else:
    import re
    code = re.sub(r'<img src="top_right_logo\.png"[^>]*>', new_img_str, code)
    print("Regex replaced photo to 54px balanced size!")

with open('public/index.html', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Balanced photo size patch applied!")
