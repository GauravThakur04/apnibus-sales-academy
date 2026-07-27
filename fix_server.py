with open('server.js', 'rb') as f:
    content = f.read().decode('utf-8', errors='replace')

lines = content.split('\n')

replacement_qa = [
    '          "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]",',
    '',
    '          "गलत जवाब। याद रखें: हम केवल POS टिकटिंग मशीन बेचते हैं। पुनः प्रयास करें:\\n\\n" +',
    '          "**सवाल १:** हम बस ऑपरेटरों को कौन सा मुख्य प्रोडक्ट बेचते हैं?\\n\\n" +',
    '          "[CHIP: pos|POS टिकटिंग मशीन] [CHIP: app|फ्री बिजनेस ऐप] [CHIP: commando|कमांडो ऐप] [CHIP: parts|बस स्पेयर पार्ट्स]",',
    '',
    '          "Nahi, yaad rakhein: hum sirf POS Ticketing Machine bechte hain. Kripya fir se try kijiye: 🔄\\n\\n" +',
    '          "**Sawaal 1:** Hum bus operators ko kaunsa main product bechte hain?\\n\\n" +',
    '          "[CHIP: pos|POS Ticketing Machine] [CHIP: app|Free Business App] [CHIP: commando|Commando App] [CHIP: parts|Bus Spare Parts]"',
    '        );',
    '      }',
    '    }',
    '',
    '    if (activeQAIndex === 2) {',
    '      const isCorrect = selectedOptionId === "battery" || lowerMsg.toLowerCase().includes("battery") || lowerMsg.toLowerCase().includes("दिन भर") || lowerMsg.toLowerCase().includes("charging");',
    '      if (isCorrect) {',
    '        return t(',
    '          "Correct! Great job. 👍\\n\\n" +',
    '          "**Question 3:** If an operator already has a sasti button machine, why should they choose ApniBus?\\n\\n" +',
    '          "[CHIP: button|Button machine only prints; ApniBus gives live reports on mobile] [CHIP: cost|ApniBus machine is much cheaper] [CHIP: paper|Uses cheaper printing paper] [CHIP: weight|Lighter in weight]",',
    '',
    '          "बिल्कुल सही जवाब! बहुत बढ़िया। 👍\\n\\n" +',
    '          "**सवाल ३:** अगर ऑपरेटर के पास पहले से बटन मशीन हो, तो वे ApniBus क्यों चुनें?\\n\\n" +',
    '          "[CHIP: button|बटन मशीन सिर्फ प्रिंट करती है; ApniBus मोबाइल पर लाइव कलेक्शन रिपोर्ट देती है] [CHIP: cost|ApniBus मशीन बहुत सस्ती है] [CHIP: paper|सस्ता प्रिंटिंग पेपर लगता है] [CHIP: weight|वज़न में हल्की है]",',
    '',
    '          "Correct! Great job. 👍\\n\\n" +',
    '          "**Sawaal 3:** Agar operator ke paas pehle se sasti button machine ho, toh wo ApniBus kyun chunein?\\n\\n" +',
    '          "[CHIP: button|Button machine sirf print karti hai; ApniBus mobile par live collection report deti hai] [CHIP: cost|ApniBus machine button machine se bahut sasti hai] [CHIP: paper|Sasta printing paper lagta hai] [CHIP: weight|ApniBus machine ka weight halka hai]"',
    '        );',
    '      } else {',
    '        return t(',
    '          "Incorrect. Remember: POS machine has a bigger battery for full-day ticketing. Try again:\\n\\n" +'
]

# Find 1995 line
idx_start = 1994 # 0-indexed line 1995
idx_end = 2047   # 0-indexed line 2048

new_lines = lines[:idx_start] + replacement_qa + lines[idx_end:]

with open('server.js', 'wb') as f:
    f.write('\n'.join(new_lines).encode('utf-8'))

print("Patched QA Q1 & Q2 section in server.js!")
