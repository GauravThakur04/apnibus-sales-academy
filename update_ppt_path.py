with open('public/videos.json', 'rb') as f:
    vdata = f.read().decode('utf-8', errors='replace')

vdata = vdata.replace('"ppt": "PPT/Apnibus Introduction.pdf"', '"ppt": "PPT/Apnibus intro Final.pdf"')

with open('public/videos.json', 'wb') as f:
    f.write(vdata.encode('utf-8'))

print("Updated videos.json with new PPT PDF path!")
