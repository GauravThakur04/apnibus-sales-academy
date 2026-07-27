import json

with open('data/results.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter out dummy test users
cleaned = [
    item for item in data 
    if not any(dummy in item.get('name', '').lower() for dummy in ['test user', 'otestuser', 'jl', 'gaur']) or item.get('name') == 'Gaurav Thakur'
]

# Ensure Gaurav Thakur is kept cleanly
with open('data/results.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, indent=2)

print(f"Cleaned results.json! Remaining candidates count: {len(cleaned)}")
for item in cleaned:
    print(f" - {item.get('name')} ({item.get('status')})")
