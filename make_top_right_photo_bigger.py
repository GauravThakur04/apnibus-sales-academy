with open('public/index.html', 'rb') as f:
    code = f.read().decode('utf-8', errors='replace')

old_img_str = '<img src="top_right_logo.png" alt="ApniBus Logo" style="height: 36px; max-width: 140px; object-fit: contain; border-radius: 6px; background: rgba(255,255,255,0.05); padding: 2px 6px;" />'

new_img_str = '<img src="top_right_logo.png" alt="ApniBus Photo" style="height: 78px; max-height: 85px; width: auto; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); margin: -10px 0;" />'

if old_img_str in code:
    code = code.replace(old_img_str, new_img_str)
    print("Updated top right image to bigger size in index.html!")
else:
    # Replace any top_right_logo.png img tag with bigger size
    import re
    code = re.sub(r'<img src="top_right_logo\.png"[^>]*>', new_img_str, code)
    print("Regex replaced top right image to bigger size!")

with open('public/index.html', 'wb') as f:
    f.write(code.encode('utf-8'))

print("Top right photo enlargement complete!")
