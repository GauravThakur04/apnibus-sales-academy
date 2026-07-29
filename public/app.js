/* ApniBus Sales Academy — client
   Phase 1 Videos (gated) → Phase 2 Grooming → Phase 3 Q&A Prep */

const $ = (id) => document.getElementById(id);
const thread = $("thread"), input = $("input"), chips = $("chips");
const stage = $("stage");

const STORE = "apnibus-academy-v2";
let VIDEOS = [];

const STEPS = [
  // Phase 1 - Videos (0 to 3)
  { phase: "videos", id: "intro", title: "Video 1: ApniBus Introduction" },
  { phase: "videos", id: "pos-demo", title: "Video 2: POS Machine Demo" },
  { phase: "videos", id: "commando", title: "Video 3: AB Commando" },
  { phase: "videos", id: "business", title: "Video 4: AB Business App" },
  
  // Phase 2 - Grooming (4 to 7)
  { phase: "grooming", id: "deep-dive", title: "Product Deep-Dive", say: "Product deep-dive karao — POS ke features aur benefits." },
  { phase: "grooming", id: "objection", title: "Objection Handling", say: "Objection handling sikhao — A-A-A-A framework se." },
  { phase: "grooming", id: "roleplay", title: "Customer Roleplay", say: "Roleplay karein. Aap customer bano." },
  { phase: "grooming", id: "pitch", title: "Fix My Pitch", say: "Main apna pitch likhta hoon, aap usko correct karo. Pehle mujhe batao kaise likhun." },
  
  // Phase 3 - Q&A Prep (8 to 10)
  { phase: "qa", id: "rapid-qa", title: "Rapid Q&A", say: "Rapid Q&A shuru karo — operator ke asli sawaal poocho." },
  { phase: "qa", id: "scenarios", title: "Scenario Practice", say: "Scenario questions poocho." },
  { phase: "qa", id: "test", title: "Final Test & Score", say: "Final roleplay lo aur mujhe readiness score do." },
  
  // Phase 4 - Attendance Policy & Quiz
  { phase: "attendance", id: "attendance-policy", title: "Attendance Policy" },
  // Phase 5 - Employment Policy
  { phase: "employment", id: "employment-policy", title: "Employment Policy" },
  // Phase 6 - Incentive Policy
  { phase: "incentive", id: "incentive-policy", title: "Incentive Policy" }
];

let state = load();
let streaming = false;

const RAPID_QA_QUIZ_MD = `# RAPID-FIRE MCQ QUIZ

**ApniBus Sales Academy · Phase 3** · 25 questions · Each in **English / हिंदी / Hinglish** · Answer key at the end.

---

## SECTION A — POS TICKETING MACHINE

**Q1. What is the POS Ticketing Machine?**

- हिंदी: POS Ticketing Machine क्या है?
- Hinglish: POS Ticketing Machine kya hai?

A) A cash counting machine / कैश गिनने की मशीन / Cash ginne ki machine
B) A smart electronic ticketing device / एक स्मार्ट इलेक्ट्रॉनिक टिकटिंग डिवाइस / Ek smart electronic ticketing device
C) A GPS tracker only / सिर्फ़ GPS ट्रैकर / Sirf GPS tracker
D) A mobile phone / एक मोबाइल फ़ोन / Ek mobile phone

---

**Q2. What is the biggest problem the POS Machine solves for an operator?**

- हिंदी: POS Machine operator की सबसे बड़ी कौन सी problem solve करती है?
- Hinglish: POS Machine operator ki sabse badi kaun si problem solve karti hai?

A) Bus breakdown / बस ख़राब होना / Bus kharab hona
B) Traffic jams / ट्रैफ़िक जाम / Traffic jam
C) Revenue leakage — money going missing / पैसे की लीकेज / Paisa leak hona
D) Fuel cost / तेल का ख़र्च / Tel ka kharcha

---

**Q3. Which of these is a real feature of the POS Machine?**

- हिंदी: इनमें से कौन सा POS Machine का असली feature है?
- Hinglish: Inme se kaun sa POS Machine ka asli feature hai?

A) Bigger battery that lasts all day / पूरे दिन चलने वाली बड़ी बैटरी / Poore din chalne wali badi battery
B) Built-in printer for photos / फ़ोटो प्रिंटर / Photo printer
C) Free fuel / फ्री तेल / Free tel
D) Movie streaming / मूवी स्ट्रीमिंग / Movie streaming

---

**Q4. Can the POS Machine collect both cash and online payments?**

- हिंदी: क्या POS Machine cash और online दोनों payment ले सकती है?
- Hinglish: Kya POS Machine cash aur online dono payment le sakti hai?

A) Only cash / सिर्फ़ cash / Sirf cash
B) Only online / सिर्फ़ online / Sirf online
C) Both cash and online / cash और online दोनों / Cash aur online dono
D) Neither / कोई नहीं / Koi nahi

---

**Q5. What support does ApniBus provide with the machine?**

- हिंदी: ApniBus मशीन के साथ कैसा support देती है?
- Hinglish: ApniBus machine ke saath kaisa support deti hai?

A) No support / कोई support नहीं / Koi support nahi
B) Support only on weekends / सिर्फ़ weekend पर / Sirf weekend par
C) 24×7 support / 24×7 support / 24×7 support
D) Support for one day only / सिर्फ़ एक दिन / Sirf ek din

---

**Q6. How does the bigger battery benefit the operator?**

- हिंदी: बड़ी बैटरी से operator को क्या फ़ायदा?
- Hinglish: Badi battery se operator ko kya faayda?

A) The bus runs faster / बस तेज़ चलती है / Bus tez chalti hai
B) Ticketing never stops on long routes / लंबी रूट पर टिकटिंग नहीं रुकती / Lambi route pe ticketing nahi rukti
C) Cheaper fuel / सस्ता तेल / Sasta tel
D) Free tickets / फ्री टिकट / Free ticket

---

## SECTION B — ApniBus BUSINESS APP

**Q7. Does the operator pay separately for the Business App?**

- हिंदी: क्या operator Business App के लिए अलग से पैसे देता है?
- Hinglish: Kya operator Business App ke liye alag se paise deta hai?

A) Yes, monthly fee / हाँ, महीने की फ़ीस / Haan, mahine ki fees
B) Yes, one-time charge / हाँ, एक बार का charge / Haan, ek baar ka charge
C) No — it's free with the POS Machine / नहीं — POS Machine के साथ फ्री / Nahi — POS Machine ke saath free
D) Only for big operators / सिर्फ़ बड़े operator के लिए / Sirf bade operator ke liye

---

**Q8. Which of these can the owner see in the Business App?**

- हिंदी: Business App में मालिक क्या देख सकता है?
- Hinglish: Business App mein malik kya dekh sakta hai?

A) Today's collection and trip-wise account / आज का कलेक्शन और ट्रिप का हिसाब / Aaj ka collection aur trip ka hisaab
B) Live cricket score / लाइव क्रिकेट स्कोर / Live cricket score
C) Weather report / मौसम की जानकारी / Mausam ki jaankari
D) News headlines / न्यूज़ हेडलाइन / News headline

---

**Q9. Why is the Business App our strongest closing weapon?**

- हिंदी: Business App सबसे बड़ा closing हथियार क्यों है?
- Hinglish: Business App sabse bada closing hathiyaar kyun hai?

A) It is expensive / ये महँगा है / Ye mehnga hai
B) It shows the owner his real collection live on his phone — for free / मालिक को असली कलेक्शन फ़ोन पर live दिखाता है, फ्री में / Malik ko asli collection phone pe live dikhata hai, free mein
C) It plays music / ये गाने बजाता है / Ye gaane bajata hai
D) It replaces the conductor / कंडक्टर की जगह लेता है / Conductor ki jagah leta hai

---

**Q10. During a pitch, what is better for the Business App?**

- हिंदी: पिच में Business App के लिए क्या बेहतर है?
- Hinglish: Pitch mein Business App ke liye kya behtar hai?

A) Just describe it in words / सिर्फ़ शब्दों में बताना / Sirf shabdon mein batana
B) Show the live screen on your phone / फ़ोन पर live screen दिखाना / Phone pe live screen dikhana
C) Send a PDF later / बाद में PDF भेजना / Baad mein PDF bhejna
D) Don't mention it / बताना ही मत / Batana hi mat

---

**Q11. How does the app help an owner who is only 10th pass?**

- हिंदी: सिर्फ़ 10वीं पास मालिक की app कैसे मदद करती है?
- Hinglish: Sirf 10th pass malik ki app kaise madad karti hai?

A) It teaches him English / उसे अंग्रेज़ी सिखाती है / Use English sikhati hai
B) Everything shows visually, like a picture — easy to read / सब तस्वीर जैसा दिखता है, पढ़ना आसान / Sab tasveer jaisa dikhta hai, padhna aasan
C) It calls him daily / रोज़ फ़ोन करती है / Roz phone karti hai
D) It does nothing for him / कुछ नहीं करती / Kuch nahi karti

---

## SECTION C — AB COMMANDO APP

**Q12. What is the AB Commando App?**

- हिंदी: AB Commando App क्या है?
- Hinglish: AB Commando App kya hai?

A) A product we sell to operators / operator को बेचने वाला product / Operator ko bechne wala product
B) The BD's own field work app / BD की अपनी field work app / BD ki apni field work app
C) A ticketing machine / एक टिकटिंग मशीन / Ek ticketing machine
D) A payment wallet / एक payment wallet / Ek payment wallet

---

**Q13. What should a BD do in AB Commando right after meeting a customer?**

- हिंदी: Customer से मिलने के तुरंत बाद BD को AB Commando में क्या करना चाहिए?
- Hinglish: Customer se milne ke turant baad BD ko AB Commando mein kya karna chahiye?

A) Nothing / कुछ नहीं / Kuch nahi
B) Record the visit and update the lead / visit record करना और lead update करना / Visit record karna aur lead update karna
C) Delete the app / app delete करना / App delete karna
D) Call the head office / head office को call करना / Head office ko call karna

---

**Q14. Why should a BD schedule a follow-up in AB Commando?**

- हिंदी: BD को AB Commando में follow-up क्यों schedule करना चाहिए?
- Hinglish: BD ko AB Commando mein follow-up kyun schedule karna chahiye?

A) So no lead is forgotten / ताकि कोई lead न भूले / Taaki koi lead na bhoole
B) To pass time / टाइम पास करने के लिए / Time pass karne ke liye
C) It is not needed / ज़रूरत नहीं है / Zaroorat nahi hai
D) Only managers do this / सिर्फ़ manager करते हैं / Sirf manager karte hain

---

**Q15. What should a BD do in the app at the end of the day?**

- हिंदी: दिन के आख़िर में BD को app में क्या करना चाहिए?
- Hinglish: Din ke aakhir mein BD ko app mein kya karna chahiye?

A) Review the day's leads, visits and follow-ups / दिन के leads, visits और follow-ups देखना / Din ke leads, visits aur follow-ups dekhna
B) Log out and forget / logout करके भूल जाना / Logout karke bhool jaana
C) Uninstall it / uninstall करना / Uninstall karna
D) Nothing / कुछ नहीं / Kuch nahi

---

**Q16. AB Commando is used to manage which of these?**

- हिंदी: AB Commando इनमें से क्या manage करने के लिए है?
- Hinglish: AB Commando inme se kya manage karne ke liye hai?

A) Leads, visits, follow-ups and POS devices / leads, visits, follow-ups और POS devices / Leads, visits, follow-ups aur POS devices
B) Bus fuel / बस का तेल / Bus ka tel
C) Passenger seats / यात्री सीटें / Passenger seat
D) Ticket prices for customers / customer के टिकट दाम / Customer ke ticket daam

---

## SECTION D — SALES SKILLS & OBJECTIONS

**Q17. How should you OPEN a pitch?**

- हिंदी: पिच कैसे शुरू करनी चाहिए?
- Hinglish: Pitch kaise shuru karni chahiye?

A) By listing all features fast / सारे features तेज़ी से गिनाकर / Saare features tezi se ginakar
B) With a question about the operator's problem / operator की problem पर सवाल से / Operator ki problem pe sawaal se
C) By telling the price first / पहले price बताकर / Pehle price batakar
D) By talking about yourself / अपने बारे में बताकर / Apne baare mein batakar

---

**Q18. What is the difference between a feature and a benefit?**

- हिंदी: Feature और benefit में क्या फ़र्क है?
- Hinglish: Feature aur benefit mein kya farak hai?

A) They are the same / दोनों एक ही हैं / Dono ek hi hain
B) A feature is what it has; a benefit is what the customer gets / feature यानी क्या है; benefit यानी customer को क्या मिलता है / Feature yaani kya hai; benefit yaani customer ko kya milta hai
C) A benefit is the price / benefit यानी price / Benefit yaani price
D) A feature is the customer's name / feature यानी customer का नाम / Feature yaani customer ka naam

---

**Q19. Operator says "It's too expensive." What is the FIRST thing to do?**

- हिंदी: Operator कहता है "बहुत महँगा है।" सबसे पहले क्या करना चाहिए?
- Hinglish: Operator kehta hai "Bahut mehnga hai." Sabse pehle kya karna chahiye?

A) Argue that it's cheap / बहस करना कि सस्ता है / Behes karna ki sasta hai
B) Acknowledge the concern, then connect price to value / concern मानना, फिर price को value से जोड़ना / Concern maanna, phir price ko value se jodna
C) Walk away / चले जाना / Chale jaana
D) Give a big discount immediately / तुरंत बड़ा discount देना / Turant bada discount dena

---

**Q20. When price comes up, what should you do before saying the number?**

- हिंदी: जब price की बात आए, number बोलने से पहले क्या करना चाहिए?
- Hinglish: Jab price ki baat aaye, number bolne se pehle kya karna chahiye?

A) Build the value first / पहले value बनाना / Pehle value banana
B) Say the number immediately / तुरंत number बोल देना / Turant number bol dena
C) Refuse to tell / बताने से मना करना / Batane se mana karna
D) Change the topic forever / हमेशा के लिए topic बदल देना / Hamesha ke liye topic badal dena

---

**Q21. Operator says "My conductor won't manage it." Best response?**

- हिंदी: Operator कहता है "मेरा कंडक्टर चला नहीं पाएगा।" सबसे अच्छा जवाब?
- Hinglish: Operator kehta hai "Mera conductor chala nahi payega." Sabse achha jawab?

A) "Then don't buy it." / "तो मत ख़रीदो।" / "Toh mat khareedo."
B) "It's just 2-3 buttons, and we give free training + 24×7 support." / "बस 2-3 बटन, और हम फ्री training + 24×7 support देते हैं।" / "Bas 2-3 button, aur hum free training + 24×7 support dete hain."
C) "Your conductor is not smart." / "आपका कंडक्टर होशियार नहीं।" / "Aapka conductor hoshiyar nahi."
D) Say nothing / कुछ मत कहो / Kuch mat kaho

---

**Q22. What next step should you ask for at the end of a pitch?**

- हिंदी: पिच के आख़िर में कौन सा next step माँगना चाहिए?
- Hinglish: Pitch ke aakhir mein kaun sa next step maangna chahiye?

A) A signed contract right now / अभी signed contract / Abhi signed contract
B) A small, low-pressure demo / छोटा, बिना दबाव का demo / Chhota, bina dabaav ka demo
C) Full payment upfront / पूरा payment पहले / Poora payment pehle
D) Nothing, just leave / कुछ नहीं, बस निकल जाओ / Kuch nahi, bas nikal jao

---

**Q23. With an interested buyer, you should…**

- हिंदी: Interested buyer के साथ आपको…
- Hinglish: Interested buyer ke saath aapko…

A) Keep over-talking until they change their mind / बोलते रहना जब तक मन न बदल जाए / Bolte rehna jab tak mann na badal jaye
B) Listen, confirm, and close cleanly / सुनना, confirm करना, साफ़ close करना / Sunna, confirm karna, saaf close karna
C) Raise the price / price बढ़ा देना / Price bada dena
D) Delay the sale / sale टाल देना / Sale taal dena

---

**Q24. A customer asks something you don't know. What do you do?**

- हिंदी: Customer ऐसा कुछ पूछता है जो आपको नहीं पता। क्या करते हो?
- Hinglish: Customer aisa kuch poochhta hai jo aapko nahi pata. Kya karte ho?

A) Make up an answer / जवाब बना देना / Jawab bana dena
B) Say you'll confirm and get back — never guess / कहना कि confirm करके बताऊँगा — guess मत करना / Kehna ki confirm karke bataunga — guess mat karna
C) Ignore the question / सवाल टाल देना / Sawaal taal dena
D) End the meeting / मीटिंग ख़त्म कर देना / Meeting khatam kar dena

---

**Q25. In one line, why should an operator buy the ApniBus POS Machine?**

- हिंदी: एक लाइन में, operator ApniBus POS Machine क्यों ख़रीदे?
- Hinglish: Ek line mein, operator ApniBus POS Machine kyun khareede?

A) Because it looks good / क्योंकि दिखने में अच्छी है / Kyunki dikhne mein achhi hai
B) Because it gives full control over his money — stops leakage, shows real collection / क्योंकि पैसे पर पूरा control देती है — leakage रोकती है, असली कलेक्शन दिखाती है / Kyunki paise pe poora control deti hai — leakage rokti hai, asli collection dikhati hai
C) Because it is cheap / क्योंकि सस्ती है / Kyunki sasti hai
D) Because everyone else has it / क्योंकि सबके पास है / Kyunki sabke paas hai

---

## ANSWER KEY

Q | Ans
---|---
1 | B
2 | C
3 | A
4 | C
5 | C
6 | B
7 | C
8 | A
9 | B
10 | B
11 | B
12 | B
13 | B
14 | A
15 | A
16 | A
17 | B
18 | B
19 | B
20 | A
21 | B
22 | B
23 | B
24 | B
25 | B

**Scoring guide:** 22–25 correct = field ready · 18–21 = almost, revise weak areas · below 18 = repeat Grooming before the field.
`;

function fresh() {
  return {
    messages: [], mode: "videos", lang: "Hinglish",
    watched: [],          // video ids confirmed complete
    viewedVideo: {},      // video ids clicked/played
    viewedPPT: {},        // ppt slides ids clicked/opened
    current: 0,           // index of video being viewed
    pendingCheck: null,   // video id awaiting Q&A confirmation
    roleplay: false, name: null,
    stepIndex: 0,         // active step index in STEPS
    quizShown: false,
    difficulty: "Medium",
    roleplayState: { active: false, status: "IDLE", trust: 40, mood: "neutral" },
    learningMemory: {
      weakAreas: [],
      totalRoleplays: 0,
      highestTrust: 40
    },
    userRegistration: null,
    attendanceChoice: null,
    employmentChoice: null,
    incentiveChoice: null,
    attemptedGrooming: {
      deepDive: false,
      objection: false,
      roleplay: false,
      pitchCorrection: false
    }
  };
}
function load() {
  try {
    const loaded = Object.assign(fresh(), JSON.parse(localStorage.getItem(STORE) || "{}"));
    loaded.messages = (loaded.messages || []).filter((m) =>
      !m.content?.startsWith("## Rapid-Fire MCQ Quiz")
    );
    loaded.quizShown = false;
    return loaded;
  }
  catch { return fresh(); }
}
let syncTimeout = null;
function syncWithBackend() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      await fetch("/api/sync-state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          email: state.googleUser?.email || state.userRegistration?.email || "",
          gender: state.userRegistration?.gender,
          age: state.userRegistration?.age,
          location: state.userRegistration?.location,
          stepIndex: state.stepIndex,
          mode: state.mode,
          watchedVideosCount: state.watched ? state.watched.length : 0,
          difficulty: state.difficulty || "Medium",
          score: state.bestScore || 0,
          verdict: state.verdict || "NOT YET CERTIFIED",
          weakAreas: state.learningMemory?.weakAreas || [],
          choices: {
            attendance: state.attendanceChoice || "",
            employment: state.employmentChoice || "",
            incentive: state.incentiveChoice || ""
          },
          attemptedGrooming: state.attemptedGrooming || {
            deepDive: false,
            objection: false,
            roleplay: false,
            pitchCorrection: false
          },
          videoCorrectCount: state.watched ? state.watched.length * 2 : 0,
          qaCorrectCount: (state.messages || []).filter(m => m.role === "user" && m.content && (
            m.content.toLowerCase().includes("pos ticketing machine") ||
            m.content.toLowerCase().includes("battery jo bina charging") || m.content.toLowerCase().includes("battery that runs all day") ||
            m.content.toLowerCase().includes("button machine only prints") || m.content.toLowerCase().includes("live reports") ||
            m.content.toLowerCase().includes("internal bd app") || m.content.toLowerCase().includes("internal tool") ||
            m.content.toLowerCase().includes("show simple ui") ||
            m.content.toLowerCase().includes("free business app and leakage") || m.content.toLowerCase().includes("leakage control") || m.content.toLowerCase().includes("close_leakage")
          )).length,
          trainingCompleted: state.trainingCompleted || false,
          messages: state.messages
        })
      });
    } catch (e) {
      console.error("Backend sync failed:", e);
    }
  }, 1000);
}

const save = () => {
  const activeStep = STEPS[state.stepIndex];
  if (activeStep && activeStep.phase === "grooming") {
    if (!state.attemptedGrooming) {
      state.attemptedGrooming = { deepDive: false, objection: false, roleplay: false, pitchCorrection: false };
    }
    if (activeStep.id === "deep-dive") state.attemptedGrooming.deepDive = true;
    if (activeStep.id === "objection") state.attemptedGrooming.objection = true;
    if (activeStep.id === "roleplay") state.attemptedGrooming.roleplay = true;
    if (activeStep.id === "pitch") state.attemptedGrooming.pitchCorrection = true;
  }
  localStorage.setItem(STORE, JSON.stringify(state));
  syncWithBackend();
};
const allWatched = () => VIDEOS.length && state.watched.length >= VIDEOS.length;

/* ── markdown ─────────────────────────────────── */
function md(src) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  let t = esc(src);
  t = t.replace(/((?:^\|.*\|\s*$\n?)+)/gm, (block) => {
    const rows = block.trim().split("\n").filter((r) => !/^\|[\s|:-]+\|$/.test(r));
    if (rows.length < 2) return block;
    const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const head = cells(rows[0]).map((c) => `<th>${c}</th>`).join("");
    const body = rows.slice(1).map((r) => `<tr>${cells(r).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
    return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  });
  t = t.replace(/^### (.*)$/gm, "<h3>$1</h3>")
       .replace(/^## (.*)$/gm, "<h2>$1</h2>")
       .replace(/^# (.*)$/gm, "<h3>$1</h3>")
       .replace(/^---$/gm, "<hr>")
       .replace(/^> ?(.*)$/gm, "$1")
       .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
       .replace(/`(.+?)`/g, "<code>$1</code>")
       .replace(/^\s*[-•]\s+(.*)$/gm, "<li>$1</li>")
       .replace(/^\s*\d+\.\s+(.*)$/gm, "<li>$1</li>");
  t = t.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
  return t.split(/\n{2,}/)
    .map((b) => (/^\s*<(h\d|ul|table|hr)/.test(b) ? b : `<p>${b.replace(/\n/g, "<br>")}</p>`))
    .join("");
}

/* ── toast ────────────────────────────────────── */
function toast(html, ms = 4200) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = html;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/* ═══ VIDEO PHASE ═══════════════════════════════ */
async function initVideos() {
  try {
    const res = await fetch("videos.json");
    VIDEOS = (await res.json()).videos.sort((a, b) => a.order - b.order);
  } catch { VIDEOS = []; }
  if (VIDEOS.length) {
    state.watched = state.watched.filter(id => VIDEOS.some(v => v.id === id));
    save();
  }
  renderVList();
  showVideo(state.current);
}

function isVideoUnlocked(i) {
  return i <= state.stepIndex;
}

function renderVList() {
  $("vlist").innerHTML = VIDEOS.map((v, i) => {
    const ok = state.watched.includes(v.id);
    const unlocked = isVideoUnlocked(i);
    const cur = i === state.current;
    const cls = ok ? "ok" : cur ? "cur" : !unlocked ? "lock" : "";
    return `<button class="vitem ${cls}" data-i="${i}" ${unlocked ? "" : "disabled"}>
      <span class="vbox">${ok ? "✓" : !unlocked ? "🔒" : i + 1}</span>
      <span>${v.title}</span></button>`;
  }).join("");

  $("vlist").querySelectorAll(".vitem:not([disabled])").forEach((b) => {
    b.onclick = () => { state.current = +b.dataset.i; save(); goVideos(); };
  });
  syncGates();
}


function setVideoPlayerSource(src) {
  const player = $("player");
  if (!src) {
    player.innerHTML = `<div class="novid-placeholder"><h4>🎥 Video Coming Soon</h4><p>This video is still in production. Please read the Presentation Slides (PPT) on the right to learn about this module!</p></div>`;
    return;
  }
  player.innerHTML = `<video controls preload="metadata"><source src="${src}" type="video/mp4"></video>`;
}

function showVideo(i) {
  const v = VIDEOS[i];
  if (!v) return;
  state.current = i;

  // Reset mobile tabs to video by default
  const mTabV = $("mTabVideo");
  const mTabS = $("mTabSlides");
  if (mTabV && mTabS) {
    mTabV.classList.add("active");
    mTabS.classList.remove("active");
    const vstage = document.querySelector(".vstage");
    if (vstage) vstage.classList.remove("show-slides");
  }


  $("vNum").textContent = `${i + 1} / ${VIDEOS.length}`;
  $("vTitle").textContent = v.title;
  $("vSub").textContent = v.subtitle || "";
  $("vCovers").innerHTML = (v.covers || []).map((c) => `<li>${c}</li>`).join("");

  // Handle PPT / PDF Slide Deck
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
  }

  // Handle Video Parts
  const partsContainer = $("videoPartsContainer");
  partsContainer.innerHTML = "";
  if (v.parts && v.parts.length) {
    partsContainer.innerHTML = v.parts.map((p, pIdx) => `<button class="part-btn ${pIdx === 0 ? 'active' : ''}" data-src="${p.src}">${p.title}</button>`).join("");
    partsContainer.querySelectorAll(".part-btn").forEach((btn) => {
      btn.onclick = () => {
        partsContainer.querySelectorAll(".part-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        setVideoPlayerSource(btn.dataset.src);
      };
    });
    setVideoPlayerSource(v.parts[0].src);
  } else {
    setVideoPlayerSource(v.src);
  }

  const done = state.watched.includes(v.id);
  const btn = $("doneBtn");
  btn.classList.toggle("done", done);
  btn.textContent = done ? "✓ Completed — rewatch anytime" : "I've watched this — ask me the questions";
  btn.disabled = false;

  // Track viewing status dynamically
  if (window.innerWidth > 850) {
    state.viewedVideo[v.id] = true;
    state.viewedPPT[v.id] = true;
  } else {
    // Mobile starts on video tab
    state.viewedVideo[v.id] = true;
  }

  // Bind click trackers
  const playerDiv = document.querySelector(".vstage .player");
  if (playerDiv) {
    playerDiv.addEventListener("click", () => {
      state.viewedVideo[v.id] = true; save();
    }, { once: true });
  }
  const pptDiv = document.querySelector(".vstage #pptContainer");
  if (pptDiv) {
    pptDiv.addEventListener("click", () => {
      state.viewedPPT[v.id] = true; save();
    }, { once: true });
  }

  renderVList();
  save();
}

const missingMsg = (v) => `<div class="novid"><b>Video not added yet</b>
  Drop the file at <code>public/${v.src || "videos/" + v.id + ".mp4"}</code><br>
  or put a YouTube ID in <code>public/videos.json</code>.<br><br>
  You can still continue — click the button to answer the questions.</div>`;

$("doneBtn").onclick = () => {
  const v = VIDEOS[state.current];
  if (!v) return;

  state.viewedVideo[v.id] = true;
  state.viewedPPT[v.id] = true;
  state.pendingCheck = v.id;
  state.messages = []; // Clear old chat clutter for a clean checkpoint view
  save();
  goChat("videos");
  send(
    `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
    true
  );
};

/* ═══ GATING & PIPELINE ════════════════════════ */
function syncGates() {
  const activeStep = STEPS[state.stepIndex];
  const activePhase = activeStep ? activeStep.phase : "videos";

  document.querySelectorAll(".phase").forEach((b) => {
    const mode = b.dataset.mode;
    const stepIndexForMode = STEPS.findIndex((s) => s.phase === mode);
    const isLocked = state.stepIndex < stepIndexForMode;
    b.classList.toggle("locked", isLocked);

    const isActiveScreen = state.mode === mode;
    const isNextUpPhase = activePhase === mode && !isActiveScreen;
    b.classList.toggle("next-up", isNextUpPhase);
  });

  const roleplayStepIdx = STEPS.findIndex(s => s.id === "roleplay");
  if (state.stepIndex < roleplayStepIdx) {
    state.roleplay = false;
    state.roleplayState = { active: false, status: "IDLE" };
  }

  const videoCount = VIDEOS.length || 4;
  const groomingStartIdx = STEPS.findIndex(s => s.phase === "grooming");
  const qaStartIdx = STEPS.findIndex(s => s.phase === "qa");
  const attendanceStartIdx = STEPS.findIndex(s => s.phase === "attendance");
  const employmentStartIdx = STEPS.findIndex(s => s.phase === "employment");
  const incentiveStartIdx = STEPS.findIndex(s => s.phase === "incentive");

  document.querySelectorAll(".phase-tick").forEach((t) => (t.textContent = ""));
  if (state.stepIndex >= videoCount) {
    const tick = document.querySelector('[data-tick="videos"]');
    if (tick) tick.textContent = "✓";
  }
  if (state.stepIndex >= qaStartIdx) {
    const tick = document.querySelector('[data-tick="grooming"]');
    if (tick) tick.textContent = "✓";
  }
  if (state.stepIndex >= attendanceStartIdx) {
    const tick = document.querySelector('[data-tick="qa"]');
    if (tick) tick.textContent = "✓";
  }
  if (state.stepIndex >= employmentStartIdx) {
    const tick = document.querySelector('[data-tick="attendance"]');
    if (tick) tick.textContent = "✓";
  }
  if (state.stepIndex >= incentiveStartIdx) {
    const tick = document.querySelector('[data-tick="employment"]');
    if (tick) tick.textContent = "✓";
  }
  if (state.stepIndex >= STEPS.length - 1 && state.attendancePassed) {
    const tick = document.querySelector('[data-tick="incentive"]');
    if (tick) tick.textContent = "✓";
  }

  if (state.stepIndex < videoCount) {
    $("gateNote").textContent = `Step ${state.stepIndex + 1}/${STEPS.length}: Watch video/slides and answer questions.`;
    $("gateNote").classList.remove("open");
  } else {
    const currentStep = STEPS[state.stepIndex] || STEPS[0];
    $("gateNote").textContent = `Step ${state.stepIndex + 1}/${STEPS.length}: ${currentStep.title} active.`;
    $("gateNote").classList.add("open");
  }
}

function completeVideo(id) {
  if (state.watched.includes(id)) return;
  state.watched.push(id);
  state.pendingCheck = null;
  state.stepIndex = Math.max(state.stepIndex, state.watched.length);
  save();
  renderVList();

  const videoCount = VIDEOS.length || 4;
  if (state.stepIndex >= videoCount) {
    toast("🎉 <span>All videos & slides completed — <b>Grooming unlocked</b></span>", 5200);
    goChat("grooming");
    send("[SYSTEM] The rep has completed all videos and slides. Let's start Phase 2 Tutor Grooming. Introduce the Product Deep-Dive module.", true);
  } else {
    state.current = state.stepIndex;
    save();
    goVideos();
    toast(`✓ <span>Next up: <b>${VIDEOS[state.stepIndex].title}</b></span>`);
  }
}

/* ═══ VIEW SWITCHING ════════════════════════════ */
const TITLES = {
  videos: ["Phase 1 — Videos", "Watch all videos, then Grooming unlocks"],
  grooming: ["Phase 2 — Grooming", "Tutor, pitch correction, and roleplay"],
  qa: ["Phase 3 — Q&A Prep", "Readiness score out of 100"],
  attendance: ["Phase 4 — Attendance Policy", "Attendance structure & quiz confirmation"],
  employment: ["Phase 5 — Employment Policy", "FSE timeline and rules"],
  incentive: ["Phase 6 — Incentive Policy", "Earn model and plan details"]
};

function goVideos() {
  state.mode = "videos"; save();
  $("videoView").hidden = false;
  $("chatView").hidden = true;
  $("attendanceView").hidden = true;
  setPhaseUI("videos");
  showVideo(state.current);
}
function goChat(mode) {
  state.mode = mode; save();
  
  const visibleMsgs = state.messages.filter((m) => !m.content.startsWith("[SYSTEM]"));
  if (mode === "videos" && visibleMsgs.length === 0 && !state.pendingCheck) {
    goVideos();
    return;
  }

  $("videoView").hidden = true;
  $("chatView").hidden = false;
  $("attendanceView").hidden = true;
  setPhaseUI(mode);
  renderToolbar(); updateSidebarStep();
  render();

  // If in video mode with a pendingCheck, trigger question immediately if not already asked
  if (mode === "videos" && state.pendingCheck && !streaming) {
    const v = VIDEOS.find(vid => vid.id === state.pendingCheck) || VIDEOS[state.current] || VIDEOS[0];
    const lastAss = [...state.messages].reverse().find(m => m.role === "assistant" && !m.content.startsWith("[SYSTEM]"));
    if (!lastAss) {
      send(
        `[SYSTEM] The rep just finished watching "${v.title}". ${v.checkpoint}`,
        true
      );
    }
  }
}
function goAttendance() {
  save();
  $("videoView").hidden = true;
  $("chatView").hidden = true;
  $("attendanceView").hidden = false;
  setPhaseUI(state.mode);
  renderToolbar(); updateSidebarStep();
  initAttendancePage();

  // Switch to the correct tab automatically based on state.mode
  if (state.mode === "attendance") {
    const tab = $("tabAttendance");
    if (tab) tab.click();
  } else if (state.mode === "employment") {
    const tab = $("tabEmployment");
    if (tab) {
      tab.removeAttribute("disabled");
      tab.click();
    }
  } else if (state.mode === "incentive") {
    const tab = $("tabIncentive");
    if (tab) {
      tab.removeAttribute("disabled");
      tab.click();
    }
  }
}
function setPhaseUI(mode) {
  document.querySelectorAll(".phase").forEach((b) =>
    b.classList.toggle("on", b.dataset.mode === mode));
  const [t, s] = TITLES[mode] || TITLES.videos;
  $("stageTitle").textContent = t;
  $("stageSub").textContent = s;
}

/* Phase 2 tools — pitch correction front and centre */
function resumeActiveStep() {
  const currentStep = STEPS[state.stepIndex] || STEPS[0];
  state.mode = currentStep.phase;
  save();
  if (state.mode === "videos") {
    goVideos();
  } else if (state.mode === "attendance" || state.mode === "employment" || state.mode === "incentive") {
    goAttendance();
  } else {
    goChat(state.mode);
  }
}

function advanceStep() {
  state.stepIndex++;
  if (state.stepIndex >= STEPS.length) {
    toast("🎉 Congratulations! You have completed the ApniBus Sales Academy!");
    state.stepIndex = STEPS.length - 1;
    save();
    return;
  }
  const nextStep = STEPS[state.stepIndex];
  state.mode = nextStep.phase;
  save();
  
  if (nextStep.phase === "videos") {
    state.current = state.stepIndex;
    goVideos();
  } else if (nextStep.phase === "attendance" || nextStep.phase === "employment" || nextStep.phase === "incentive") {
    goAttendance();
  } else {
    goChat(nextStep.phase);
    send(nextStep.say);
  }
}

function rapidQAStarted() {
  return state.messages.some((m) =>
    m.role === "assistant" &&
    /Question 1:|Sawaal 1:|सवाल १:/.test(m.content)
  );
}

function renderToolbar() {
  const bar = $("toolbar");
  bar.innerHTML = "";

  if (state.mode === "videos" && !state.pendingCheck) return;

  const currentStep = STEPS[state.stepIndex];
  if (!currentStep) return;

  // Handle Phase 1 - Videos Toolbar Fallbacks
  const videoCount = VIDEOS.length || 4;
  if (state.stepIndex < videoCount) {
    if (state.pendingCheck) {
      bar.innerHTML = `<button class="tool key green-btn" id="forcePassBtn">✓ Pass Checkpoint & Unlock Next Video</button>`;
      $("forcePassBtn").onclick = () => {
        completeVideo(state.pendingCheck);
      };
    } else {
      bar.innerHTML = `<button class="tool key" id="goToVideoBtn">📺 Go to Active Video Player</button>`;
      $("goToVideoBtn").onclick = () => {
        goVideos();
      };
    }
    return;
  }

  if (state.mode !== currentStep.phase) {
    bar.innerHTML = `<button class="tool key" id="resumeBtn">Return to Active Step: ${currentStep.title}</button>`;
    $("resumeBtn").onclick = () => resumeActiveStep();
    return;
  }

  if (state.mode === "qa" && currentStep.id === "rapid-qa" && !rapidQAStarted()) {
    bar.innerHTML = `<button class="tool key green-btn" id="startRapidQaBtn">Start Rapid Q&A</button>`;
    $("startRapidQaBtn").onclick = () => {
      send(currentStep.say);
    };
    return;
  }

  const nextStep = STEPS[state.stepIndex + 1];
  const buttonText = nextStep 
    ? `✓ Complete & Go to: ${nextStep.title}` 
    : `🎉 Finish Academy & Exit`;
  bar.innerHTML = `<button class="tool key green-btn" id="stepCompleteBtn">${buttonText}</button>`;
  $("stepCompleteBtn").onclick = () => advanceStep();
}

/* ═══ CHAT ══════════════════════════════════════ */
function bubble(role, html) {
  const w = document.createElement("div");
  w.className = `msg ${role === "user" ? "me" : "bot"}`;
  w.innerHTML = `<div class="av">${role === "user" ? "You" : state.roleplay ? "👤" : `<img src="coach_avatar.jpg" alt="Coach Avatar" class="av-img">`}</div>
                 <div class="bubble">${html}</div>`;
  thread.appendChild(w);
  thread.scrollTop = thread.scrollHeight;
  return w.querySelector(".bubble");
}
function updateSidebarStep() {
  const currentStep = STEPS[state.stepIndex];
  const stepNote = $("gateNote");
  if (stepNote && currentStep) {
    stepNote.textContent = `Active Step ${state.stepIndex + 1}/${STEPS.length}: ${currentStep.title}`;
  }
}

function render() {
  thread.innerHTML = "";
  const visibleMsgs = state.messages.filter((m) => !m.content.startsWith("[SYSTEM]"));
  
  visibleMsgs.forEach((m) => {
    const cleanContent = m.role === "assistant" ? m.content.replace(/\[CHIP:[^\]]+\]/g, "") : m.content;
    bubble(m.role, md(cleanContent));
  });

  // If chat is empty but a system question was requested, show loading state
  if (visibleMsgs.length === 0 && state.messages.some(m => m.content.startsWith("[SYSTEM]"))) {
    bubble("assistant", "<i>Loading checkpoint question... Please wait a moment. ⏳</i>");
  }

  // Scroll thread to top if only 1-2 messages, else scroll to bottom
  if (visibleMsgs.length <= 2) {
    thread.scrollTop = 0;
  } else {
    thread.scrollTop = thread.scrollHeight;
  }

  // Render chips for the last assistant message
  const assistantMsgs = state.messages.filter(m => m.role === "assistant" && !m.content.startsWith("[SYSTEM]"));
  if (assistantMsgs.length) {
    setChips(assistantMsgs[assistantMsgs.length - 1].content);
  } else {
    setChips("");
  }
}

function setChips(text) {
  chips.innerHTML = "";
  const found = [...text.matchAll(/\[CHIP:\s*([^\]]+)\]/g)].map((m) => m[1].trim());
  const list = [];
  
  if (found.length) {
    found.slice(0, 5).forEach((item) => {
      if (item.includes("|")) {
        const parts = item.split("|");
        list.push({ key: parts[0].trim(), val: parts[1].trim() });
      } else {
        list.push({ key: null, val: item });
      }
    });
  } else {
    if (state.roleplay) {
      list.push({ key: null, val: "COACH — feedback do" });
    } else if (!state.pendingCheck) {
      list.push({ key: null, val: "Samajh aaya, aage badho" });
      list.push({ key: null, val: "Thoda aur samjhao" });
    }
  }

  list.forEach((item) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = item.val;
    b.onclick = () => send(item.val, false, item.key);
    chips.appendChild(b);
  });
}

function syncRoleplay(text) {
  const t = text.toLowerCase();
  const isCustomerTurn = /rajesh yadav:|राजेश यादव:|scene start|दृश्य शुरू|roleplay resumed|roleplay restarted/.test(t);
  const isPaused = /roleplay paused|coach mode|⏸️/.test(t);
  const isEnded = /scorecard|report card|verdict|roleplay complete|scene over/i.test(t);

  if (!state.roleplayState) {
    state.roleplayState = { active: false, status: "IDLE" };
  }

  if (isCustomerTurn && !isPaused && !isEnded) {
    state.roleplayState.active = true;
    state.roleplayState.status = "CUSTOMER_TURN";
    setRoleplayUI(true, "CUSTOMER_TURN", text);
  } else if (isPaused && !isEnded) {
    state.roleplayState.active = true;
    state.roleplayState.status = "PAUSED";
    setRoleplayUI(true, "PAUSED", text);
  } else if (isEnded) {
    state.roleplayState.active = false;
    state.roleplayState.status = "IDLE";
    setRoleplayUI(false);
  }
}

function setRoleplayUI(on, status = "CUSTOMER_TURN", text = "") {
  state.roleplay = on;
  stage.classList.toggle("roleplay", on);
  const liveband = $("liveband");
  if (!liveband) return;
  liveband.hidden = !on;
  
  if (on) {
    const isPaused = status === "PAUSED";
    liveband.className = isPaused ? "liveband paused" : "liveband active";
    
    // Dynamically update HUD values
    const moodBadge = $("moodBadge");
    const trustFill = $("trustFill");
    const trustVal = $("trustVal");
    const personaName = $("personaName");

    if (personaName) personaName.textContent = "Rajesh Yadav";
    
    if (isPaused) {
      if (moodBadge) moodBadge.textContent = "⏸️ Paused";
    } else {
      const mood = state.roleplayState?.mood || "neutral";
      const moodMap = {
        neutral: "😐 Neutral",
        interested: "🙂 Interested",
        convinced: "🤝 Convinced",
        skeptical: "🤔 Skeptical",
        frustrated: "😤 Frustrated"
      };
      if (moodBadge) moodBadge.textContent = moodMap[mood] || "😐 Neutral";
    }

    const trust = state.roleplayState?.trust ?? 40;
    if (trustFill) trustFill.style.width = trust + "%";
    if (trustVal) trustVal.textContent = trust + "%";

    const btn = $("exitRoleplay");
    if (btn) {
      btn.textContent = isPaused ? "▶️ Resume Roleplay" : "COACH — Pause for feedback";
      btn.onclick = () => {
        if (isPaused) {
          send("Resume Roleplay", false, "resume_roleplay");
        } else {
          send("COACH", false, "pause_roleplay");
        }
      };
    }
  }
  save();
}

function setRoleplay(on, text = "") {
  setRoleplayUI(on, "CUSTOMER_TURN", text);
}

function getAssistantCountSinceLastSystem() {
  let count = 0;
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const m = state.messages[i];
    if (m.content.startsWith("[SYSTEM]")) {
      break;
    }
    if (m.role === "assistant") {
      count++;
    }
  }
  return count;
}

/* detect the coach confirming a video checkpoint passed */
function checkpointPassed(text) {
  if (!state.pendingCheck) return;
  const t = text.toLowerCase();
  
  // A video checkpoint has exactly 2 questions.
  // The first assistant message is Question 1, the second is Question 2.
  // The third assistant message is the checkpoint cleared confirmation.
  // So we must have at least 3 assistant turns since the video completion watch event.
  if (getAssistantCountSinceLastSystem() < 3) return;

  // Intercept and block progression if Question 2 keywords are detected in the coach's message
  const hasQ2Keywords = /sawal\s*2|question\s*2|सवाल\s*२/i.test(t);
  if (hasQ2Keywords) return;

  const pass = /unlock|clear|sahi|succeed|success|congrat|perfect|correct|shabaash|next video|agla video|agli video|aakhri video|aage badho|grooming|phase 2/i.test(t);
  const fail = /dobara dekh|watch it again|ek baar aur dekh/i.test(t);
  if (pass && !fail) completeVideo(state.pendingCheck);
}

function clearRoleplayMessages() {
  const rpIdx = state.messages.findIndex(m => 
    m.content && (
      m.content.includes("RoleplaySession 2.0") ||
      m.content.includes("Customer Roleplay") ||
      m.content.includes("customer bano") ||
      m.content.includes("Roleplay karein") ||
      m.content.includes("restart_roleplay")
    )
  );
  if (rpIdx !== -1) {
    state.messages = state.messages.slice(0, rpIdx);
  }
}

async function send(text, hidden = false, selectedOptionId = null) {
  const msg = (text ?? input.value).trim();
  if (!msg || streaming) return;
  const lowerMsg = msg.toLowerCase();

  const isRestart = selectedOptionId === "restart_roleplay" || msg.toLowerCase().includes("restart roleplay") || msg.toLowerCase() === "restart";
  const isStartRP = selectedOptionId === "roleplay" || msg.toLowerCase().includes("customer roleplay") || msg.toLowerCase().includes("customer bano") || msg.toLowerCase().includes("roleplay karein");

  if (isRestart || isStartRP) {
    clearRoleplayMessages();
  }

  // Auto-sync stepIndex when selectedOptionId or explicit step trigger is passed
  if (selectedOptionId) {
    const optStepIdx = STEPS.findIndex(s => 
      s.id === selectedOptionId || 
      (selectedOptionId === "qa" && s.id === "rapid-qa") ||
      (selectedOptionId === "roleplay" && s.id === "roleplay") ||
      (selectedOptionId === "pitch" && s.id === "pitch") ||
      (selectedOptionId === "objection" && s.id === "objection") ||
      (selectedOptionId === "deep-dive" && s.id === "deep-dive") ||
      (selectedOptionId === "scenarios" && s.id === "scenarios") ||
      (selectedOptionId === "test" && s.id === "test") ||
      (selectedOptionId === "attendance" && s.id === "attendance-policy") ||
      (selectedOptionId === "employment" && s.id === "employment-policy") ||
      (selectedOptionId === "incentive" && s.id === "incentive-policy")
    );
    if (optStepIdx !== -1) {
      state.stepIndex = optStepIdx;
      state.mode = STEPS[optStepIdx].phase;
      renderToolbar(); updateSidebarStep();
      save();
    }
  } else if (msg) {
    // Match exact step say phrase only
    const exactStepIdx = STEPS.findIndex(s => s.say && s.say.toLowerCase() === lowerMsg);
    if (exactStepIdx !== -1) {
      state.stepIndex = exactStepIdx;
      state.mode = STEPS[exactStepIdx].phase;
      renderToolbar(); updateSidebarStep();
      save();
    }
  }

  // Intercept navigation commands from chips or "next" / "ok" after roleplay
  if (!msg.startsWith("[SYSTEM]")) {
    const lower = msg.toLowerCase();
    if (lower.includes("agla video dekhte hain") || lower.includes("aakhri video dekhte hain") || lower.includes("next video") || lower.includes("watch next")) {
      input.value = "";
      goVideos();
      return;
    }

    if (lower === "next" || lower === "ok" || selectedOptionId === "qa" || lower.includes("proceed to phase 3")) {
      const lastAss = [...state.messages].reverse().find(m => m.role === "assistant")?.content || "";
      if (lastAss.includes("live demo") || lastAss.includes("Scorecard") || lastAss.includes("Phase 3") || state.stepIndex >= 8) {
        input.value = "";
        advanceStep();
        return;
      }
    }
    if (selectedOptionId === "attendance" || lower.includes("attendance") || lower.includes("proceed to phase 4") || lower.includes("policy")) {
      input.value = "";
      const attStepIdx = STEPS.findIndex(s => s.phase === "attendance");
      if (attStepIdx !== -1) {
        state.stepIndex = attStepIdx;
        state.mode = "attendance";
        save();
        goAttendance();
        return;
      }
      advanceStep();
      return;
    }
  }

  input.value = ""; input.style.height = "auto";
  chips.querySelectorAll("button").forEach(btn => btn.disabled = true);
  state.messages.push({ role: "user", content: msg });
  renderToolbar(); updateSidebarStep();
  if (!hidden) bubble("user", md(msg));
  save();

  streaming = true;
  $("send").disabled = true;
  input.disabled = true;
  $("status").className = "status busy";
  $("status").innerHTML = '<span class="dot"></span> Coach is thinking';

  const watchdog = setTimeout(() => {
    if (streaming) {
      console.warn("Stream safety watchdog triggered!");
      streaming = false;
      $("send").disabled = false;
      input.disabled = false;
      $("status").className = "status";
      $("status").innerHTML = '<span class="dot"></span> Ready';
      toast("⚠️ Connection timed out. Please try sending again.");
    }
  }, 20000);

  const target = bubble("assistant", '<div class="typing"><i></i><i></i><i></i></div>');
  let acc = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: state.messages,
        mode: state.mode,
        selectedOptionId,
        roleplayState: state.roleplayState,
        difficulty: state.difficulty || "Medium",
        ctx: {
          name: state.name, lang: state.lang,
          watched: state.watched, locked: !allWatched(),
          stepIndex: state.stepIndex,
          activeStepId: STEPS[state.stepIndex]?.id
        },
      }),
    });

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const parts = buf.split("\n\n"); buf = parts.pop() ?? "";
      for (const part of parts) {
        const ev = (part.match(/^event: (.+)$/m) || [])[1];
        const dl = (part.match(/^data: (.+)$/m) || [])[1];
        if (!dl) continue;
        const data = JSON.parse(dl);
        if (ev === "delta") {
          acc += data.text;
          target.innerHTML = md(acc.replace(/\[CHIP:[^\]]+\]/g, ""));
        }
        if (ev === "error")
          target.innerHTML = `<p><strong>Connection problem.</strong> ${data.message}</p>
            <p>Check your key in <code>.env</code>, then send again.</p>`;
      }
    }
  } catch (e) {
    target.innerHTML = `<p><strong>Couldn't reach the server.</strong> Is it running? (${e.message})</p>`;
  }

  clearTimeout(watchdog);

  if (acc) {
    state.messages.push({ role: "assistant", content: acc });
    syncRoleplay(acc);
    checkpointPassed(acc);
    setChips(acc);
    save();
  }

  streaming = false;
  thread.scrollTop = thread.scrollHeight;
  $("send").disabled = false;
  input.disabled = false;
  $("status").className = "status";
  $("status").innerHTML = '<span class="dot"></span> Ready';
  input.focus();
}

/* ═══ WIRING ════════════════════════════════════ */
$("send").onclick = () => send();
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 180) + "px";
});

document.querySelectorAll(".phase").forEach((btn) => {
  btn.onclick = () => {
    const mode = btn.dataset.mode;
    const targetStep = STEPS.findIndex((s) => s.phase === mode);
    if (state.stepIndex < targetStep) {
      const confirmUnlock = confirm("This section is locked. Would you like to unlock it to see how it is made? / यह सेक्शन लॉक है। क्या आप इसे देखने के लिए अनलॉक करना चाहते हैं?");
      if (confirmUnlock) {
        state.stepIndex = targetStep;
        const currentStep = STEPS[state.stepIndex];
        if (currentStep) {
          state.mode = currentStep.phase;
        }
        save();
        syncGates();
        renderToolbar();
        updateSidebarStep();
      } else {
        return;
      }
    }
    if (mode === "videos") goVideos();
    else if (mode === "attendance") goAttendance();
    else goChat(mode);
  };
});

document.querySelectorAll("#langs button").forEach((b) => {
  b.onclick = () => {
    if (state.langLocked) {
      toast(`🔒 Training language is locked to **${state.lang}** (selected during onboarding).`);
      return;
    }
    document.querySelectorAll("#langs button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    state.lang = b.dataset.lang; save();
    if (state.messages.length) send(`Ab se ${state.lang} mein baat karo.`);
  };
});

$("exitRoleplay").onclick = () => send("COACH");
$("reset").onclick = () => {
  if (!confirm("Clear everything and start from video 1?")) return;
  localStorage.removeItem(STORE);
  state = fresh();
  stage.classList.remove("roleplay");
  $("liveband").hidden = true;
  thread.innerHTML = "";
  renderVList(); goVideos();
};

/* boot */
async function bootContinuation() {

  await initVideos();
  const currentStep = STEPS[state.stepIndex] || STEPS[0];
  state.mode = currentStep.phase;
  if (state.mode === "videos") {
    state.pendingCheck = null;
    state.current = state.stepIndex < 4 ? state.stepIndex : 0;
    save();
    goVideos();
  } else {
    goChat(state.mode);
  }
  document.querySelectorAll("#langs button").forEach((b) =>
    b.classList.toggle("on", b.dataset.lang === state.lang));
  initVoiceRecorder();
  // View Certificate Modal Wiring
  const certBtn = $("viewCertBtn");
  if (certBtn) {
    certBtn.onclick = () => showCertificateModal();
  }

  // Roleplay 2.0 Difficulty Selector Wiring
  const diffBtns = document.querySelectorAll("#diffSelect button");
  diffBtns.forEach(btn => {
    btn.classList.toggle("on", btn.dataset.diff === (state.difficulty || "Medium"));
    btn.onclick = () => {
      diffBtns.forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      state.difficulty = btn.dataset.diff;
      save();
      toast(`🎯 Difficulty set to **${state.difficulty}**`);
    };
  });

  // Render Learning Memory List
  const memoryList = $("weakAreasList");
  if (memoryList && state.learningMemory?.weakAreas) {
    memoryList.innerHTML = state.learningMemory.weakAreas.map(w => `<li>${w}</li>`).join("");
  }

  // Wire Mobile Video Stage Tabs
  const mTabVideo = $("mTabVideo");
  const mTabSlides = $("mTabSlides");
  if (mTabVideo && mTabSlides) {
    mTabVideo.onclick = () => {
      mTabVideo.classList.add("active");
      mTabSlides.classList.remove("active");
      const vstage = document.querySelector(".vstage");
      if (vstage) vstage.classList.remove("show-slides");
      const v = VIDEOS[state.current];
      if (v) { state.viewedVideo[v.id] = true; save(); }
    };
    mTabSlides.onclick = () => {
      mTabSlides.classList.add("active");
      mTabVideo.classList.remove("active");
      const vstage = document.querySelector(".vstage");
      if (vstage) vstage.classList.add("show-slides");
      const v = VIDEOS[state.current];
      if (v) { state.viewedPPT[v.id] = true; save(); }
    };
  }

}

/* Boot entry-point — gates on Google Authentication */
(async () => {
  // URL Query Param auto-resume check (e.g. ?user=Rahul)
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get("user") || urlParams.get("candidate") || urlParams.get("name");
  const currentName = (state.name || "").toLowerCase();

  if (userParam && (!state.userRegistration || currentName !== userParam.toLowerCase())) {
    try {
      const res = await fetch("/api/results");
      const results = await res.json();
      const existing = results.find(u => u.name && u.name.toLowerCase() === userParam.toLowerCase());
      if (existing) {
        state.name = existing.name;
        state.userRegistration = {
          name: existing.name,
          gender: existing.gender || null,
          age: existing.age || null,
          location: existing.location || "Default",
          lang: existing.choices?.lang || state.lang || "Hinglish"
        };
        if (existing.stepIndex !== undefined) state.stepIndex = existing.stepIndex;
        if (existing.score !== undefined) state.score = existing.score;
        save();
      }
    } catch (e) {
      console.log("Could not auto-resume from URL param", e);
    }
  }

  // ── Google Auth Gate ──────────────────────────────────────
  // Show modal if:
  //  (a) no registration at all, OR
  //  (b) has registration but it was NOT done via Google (old auto-bypass sessions)
  const needsAuth = !state.userRegistration || !state.userRegistration.googleAuth;

  if (needsAuth) {
    // Clear any stale non-google registration so the user properly signs in
    if (state.userRegistration && !state.userRegistration.googleAuth) {
      state.userRegistration = null;
      state.googleUser = null;
      save();
    }
    const regModal = $("registrationModal");
    if (regModal) regModal.style.display = "flex";
    // handleGoogleSignIn will call bootContinuation() after auth
    window._bootContinuation = bootContinuation;
    return;
  }

  // ── Returning Google-authenticated user ───────────────────
  const regModalEl = $("registrationModal");
  if (regModalEl) regModalEl.style.display = "none";
  renderGoogleUserUI();
  await bootContinuation();
})();

// Mobile menu toggle logic
$("menuToggle").onclick = (e) => {
  e.stopPropagation();
  const rail = document.querySelector(".rail");
  rail.classList.toggle("expanded");
  $("menuToggle").textContent = rail.classList.contains("expanded") ? "✕" : "☰";
};
document.addEventListener("click", (e) => {
  const rail = document.querySelector(".rail");
  if (rail.classList.contains("expanded") && !rail.contains(e.target) && e.target !== $("menuToggle")) {
    rail.classList.remove("expanded");
    $("menuToggle").textContent = "☰";
  }
});
document.body.addEventListener("click", (e) => {
  if (e.target.closest(".vitem") || e.target.closest(".phase") || e.target.closest("#reset") || e.target.closest("#langs button")) {
    const rail = document.querySelector(".rail");
    rail.classList.remove("expanded");
    $("menuToggle").textContent = "☰";
  }
});

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let recognition = null;

function initVoiceRecorder() {
  const mic = $("micBtn");
  if (!mic) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    mic.title = "Voice not supported in this browser";
    mic.style.opacity = "0.4";
    return;
  }

  recognition = new SpeechRecognition();
  // hi-IN works best for Hinglish (mixed Hindi+English speech on Indian devices)
  // It correctly converts Roman transliterations AND Devanagari speech
  recognition.lang = "hi-IN";
  recognition.continuous = false;    // one utterance at a time = more reliable
  recognition.interimResults = true; // show words as you speak

  let finalTranscript = "";
  let interimTranscript = "";

  recognition.onstart = () => {
    finalTranscript = "";
    interimTranscript = "";
    mic.title = "🎙️ Listening... speak now";
  };

  recognition.onresult = (e) => {
    interimTranscript = "";
    for (let i = e.resultIndex; i < e.results.length; ++i) {
      if (e.results[i].isFinal) {
        finalTranscript += e.results[i][0].transcript + " ";
      } else {
        interimTranscript += e.results[i][0].transcript;
      }
    }
    // Show interim text in real-time as user speaks
    const inputEl = $("input");
    const base = inputEl.dataset.baseValue || "";
    inputEl.value = (base + finalTranscript + interimTranscript).trim();
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + "px";
  };

  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onend = () => {
    isRecording = false;
    mic.classList.remove("recording");
    mic.title = "Record Voice (Hinglish / Hindi / English)";

    const inputEl = $("input");
    const finalText = finalTranscript.trim();
    if (finalText) {
      inputEl.value = finalText;
      delete inputEl.dataset.baseValue;
      // Auto-send after mic stops if we got a good result
      if (finalText.length > 1) {
        setTimeout(() => {
          const sendBtn = $("send");
          if (sendBtn && !sendBtn.disabled) sendBtn.click();
        }, 400);
      }
    }

    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  };

  recognition.onerror = (e) => {
    console.warn("Speech recognition error:", e.error);
    isRecording = false;
    mic.classList.remove("recording");
    mic.title = "Record Voice";
    if (e.error === "no-speech") {
      toast("🎙️ No speech detected. Try again!");
    } else if (e.error === "not-allowed") {
      toast("🎙️ Microphone permission denied. Please allow mic access.");
    }
  };

  mic.onclick = async () => {
    if (isRecording) {
      // Stop recording
      isRecording = false;
      mic.classList.remove("recording");
      mic.title = "Record Voice";
      recognition.stop();
      if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    } else {
      try {
        // Start recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
        };

        isRecording = true;
        mic.classList.add("recording");
        mic.title = "🛑 Tap to stop";
        mediaRecorder.start();

        // Set language before starting: hi-IN = best for Hinglish on Indian phones
        recognition.lang = state.lang === "हिंदी" ? "hi-IN" : state.lang === "English" ? "en-IN" : "hi-IN";
        // Save current input as base so interim doesn't erase typed text
        const inputEl = $("input");
        inputEl.dataset.baseValue = inputEl.value ? inputEl.value + " " : "";
        finalTranscript = "";
        interimTranscript = "";
        recognition.start();
      } catch (err) {
        toast("🎙️ Microphone not found or permission denied!");
        console.error("Mic error:", err);
      }
    }
  };
}

function initAttendancePage() {
  const tabAttendance = $("tabAttendance");
  const tabEmployment = $("tabEmployment");
  const tabIncentive = $("tabIncentive");

  const panelAttendance = $("panelAttendance");
  const panelEmployment = $("panelEmployment");
  const panelIncentive = $("panelIncentive");

  if (!panelAttendance) return;

  // Track completion state of each section
  let attendanceQ1Correct = false;
  let attendanceQ2Correct = false;
  let employmentSelected = "Freelance"; // Default
  let freelancerQuizCorrect = false;
  let fseQuizCorrect = false;

  const setActiveTab = (activeTab, activePanel) => {
    [tabAttendance, tabEmployment, tabIncentive].forEach(t => {
      t.classList.remove("active");
      t.style.background = "rgba(255,255,255,0.02)";
      t.style.border = "1px solid var(--line)";
      t.style.color = "#8FA0B8";
    });
    
    activeTab.classList.add("active");
    activeTab.style.background = "rgba(16, 185, 129, 0.15)";
    activeTab.style.border = "1px solid var(--green)";
    activeTab.style.color = "var(--green)";

    [panelAttendance, panelEmployment, panelIncentive].forEach(p => p.style.display = "none");
    activePanel.style.display = "flex";
  };

  // Wire Tab Buttons
  tabAttendance.onclick = () => {
    state.stepIndex = STEPS.findIndex(s => s.phase === "attendance");
    state.mode = "attendance";
    save();
    syncGates();
    setActiveTab(tabAttendance, panelAttendance);
  };
  tabEmployment.onclick = () => {
    if (!tabEmployment.disabled) {
      state.stepIndex = STEPS.findIndex(s => s.phase === "employment");
      state.mode = "employment";
      save();
      syncGates();
      setActiveTab(tabEmployment, panelEmployment);
    }
  };
  tabIncentive.onclick = () => {
    if (!tabIncentive.disabled) {
      state.stepIndex = STEPS.findIndex(s => s.phase === "incentive");
      state.mode = "incentive";
      save();
      syncGates();
      setActiveTab(tabIncentive, panelIncentive);
    }
  };

  // --- TAB 1: ATTENDANCE ---
  const btnAttFreelance = $("btnAttFreelance");
  const btnAttFse = $("btnAttFse");
  const attFreelanceInfo = $("attFreelanceInfo");
  const attFseInfo = $("attFseInfo");

  const q1Options = document.querySelectorAll("#attendanceQ1Options .part-btn");
  const q1Feedback = $("attendanceQ1Feedback");
  const q2Box = $("attendanceQ2Box");
  const q2Options = document.querySelectorAll("#attendanceQ2Options .part-btn");
  const q2Feedback = $("attendanceQ2Feedback");
  const btnGoToEmployment = $("btnGoToEmployment");

  // Auto-enable FSE/ISA profile display by default
  if (empFseInfo) empFseInfo.style.display = "flex";
  if (incFseInfo) incFseInfo.style.display = "flex";
  employmentSelected = "FSE";
  state.employmentChoice = "ISA (Field Executive)";
  state.incentiveChoice = "ISA (Field Executive)";
  save();

  // Auto-display ISA profile content for all 3 policies by default
  if ($("attFseInfo")) $("attFseInfo").style.display = "flex";
  if ($("empFseInfo")) $("empFseInfo").style.display = "flex";
  if ($("incFseInfo")) $("incFseInfo").style.display = "flex";
  employmentSelected = "FSE";
  state.attendanceChoice = "ISA (Field Executive)";
  state.employmentChoice = "ISA (Field Executive)";
  state.incentiveChoice = "ISA (Field Executive)";
  save();

  if (btnAttFreelance) {
    btnAttFreelance.onclick = () => {
      btnAttFreelance.classList.add("active");
      if (btnAttFse) btnAttFse.classList.remove("active");
      if (attFreelanceInfo) attFreelanceInfo.style.display = "flex";
      if (attFseInfo) attFseInfo.style.display = "none";
      employmentSelected = "Freelance";
      state.attendanceChoice = "Freelance";
      save();
      if (btnGoToEmployment) btnGoToEmployment.disabled = false;
      if (tabEmployment) tabEmployment.removeAttribute("disabled");
    };
  }

  if (btnAttFse) {
    btnAttFse.onclick = () => {
      btnAttFse.classList.add("active");
      if (btnAttFreelance) btnAttFreelance.classList.remove("active");
      if (attFseInfo) attFseInfo.style.display = "flex";
      if (attFreelanceInfo) attFreelanceInfo.style.display = "none";
      employmentSelected = "FSE";
      state.attendanceChoice = "FSE";
      save();
      if (btnGoToEmployment) btnGoToEmployment.disabled = !(attendanceQ1Correct && attendanceQ2Correct);
      if (attendanceQ1Correct && attendanceQ2Correct) {
        if (tabEmployment) tabEmployment.removeAttribute("disabled");
      } else {
        if (tabEmployment) tabEmployment.setAttribute("disabled", "true");
      }
    };
  }

  q1Options.forEach(btn => {
    btn.onclick = () => {
      q1Options.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "A") {
        attendanceQ1Correct = true;
        if (q1Feedback) { q1Feedback.style.color = "#10B981"; q1Feedback.innerHTML = "✓ Correct! 3 visits falls under Half Day. / सही उत्तर!"; }
        if (q2Box) q2Box.style.display = "flex";
      } else {
        attendanceQ1Correct = false;
        if (q1Feedback) { q1Feedback.style.color = "#EF4444"; q1Feedback.innerHTML = "✗ Incorrect. Please check the attendance policy table above. / गलत उत्तर।"; }
        if (q2Box) q2Box.style.display = "none";
        if (btnGoToEmployment) btnGoToEmployment.disabled = true;
      }
    };
  });

  q2Options.forEach(btn => {
    btn.onclick = () => {
      q2Options.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "B") {
        attendanceQ2Correct = true;
        if (q2Feedback) { q2Feedback.style.color = "#10B981"; q2Feedback.innerHTML = "✓ Correct! Closing 1 sale marks you Present (Full Day) regardless of visits. / सही उत्तर!"; }
        if (btnGoToEmployment) btnGoToEmployment.disabled = false;
        if (tabEmployment) tabEmployment.removeAttribute("disabled");
      } else {
        attendanceQ2Correct = false;
        if (q2Feedback) { q2Feedback.style.color = "#EF4444"; q2Feedback.innerHTML = "✗ Incorrect. Remember, closing 1 sale overrides visits. / गलत उत्तर।"; }
        if (btnGoToEmployment) btnGoToEmployment.disabled = true;
      }
    };
  });

  if (btnGoToEmployment) {
    btnGoToEmployment.onclick = () => {
      const tabEmp = document.getElementById("tabEmployment");
      const panelEmp = document.getElementById("panelEmployment");
      state.stepIndex = STEPS.findIndex(s => s.phase === "employment");
      state.mode = "employment";
      save();
      if (tabEmp) {
        tabEmp.removeAttribute("disabled");
        tabEmp.click();
      }
      document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
      if (panelEmp) panelEmp.style.display = "flex";
      updateSidebarStep();
    };
  }

  // --- TAB 2: EMPLOYMENT ---
  const btnEmpFreelance = $("btnEmpFreelance");
  const btnEmpFse = $("btnEmpFse");
  const empFreelanceInfo = $("empFreelanceInfo");
  const empFseInfo = $("empFseInfo");
  const btnGoToIncentive = $("btnGoToIncentive");

  btnEmpFreelance.onclick = () => {
    btnEmpFreelance.classList.add("active");
    btnEmpFse.classList.remove("active");
    empFreelanceInfo.style.display = "block";
    empFseInfo.style.display = "none";
    employmentSelected = "Freelance";
    state.employmentChoice = "Freelance";
    save();
    tabIncentive.removeAttribute("disabled");
    btnGoToIncentive.disabled = false;
  };

  btnEmpFse.onclick = () => {
    btnEmpFse.classList.add("active");
    btnEmpFreelance.classList.remove("active");
    empFseInfo.style.display = "block";
    empFreelanceInfo.style.display = "none";
    employmentSelected = "FSE";
    state.employmentChoice = "FSE";
    save();
    tabIncentive.removeAttribute("disabled");
    btnGoToIncentive.disabled = false;
  };

  btnGoToIncentive.onclick = () => {
    advanceStep();
  };

  // --- TAB 3: INCENTIVE ---
  const btnIncFreelance = $("btnIncFreelance");
  const btnIncFse = $("btnIncFse");
  const incFreelanceInfo = $("incFreelanceInfo");
  const incFseInfo = $("incFseInfo");
  const incFreelanceOptions = document.querySelectorAll("#incFreelanceOptions .part-btn");
  const incFreelanceFeedback = $("incFreelanceFeedback");
  const incFseOptions = document.querySelectorAll("#incFseOptions .part-btn");
  const incFseFeedback = $("incFseFeedback");
  const finishBtn = $("attendanceFinishBtn");

  btnIncFreelance.onclick = () => {
    btnIncFreelance.classList.add("active");
    btnIncFse.classList.remove("active");
    incFreelanceInfo.style.display = "flex";
    incFseInfo.style.display = "none";
    employmentSelected = "Freelance";
    state.incentiveChoice = "Freelance";
    save();
    finishBtn.disabled = !freelancerQuizCorrect;
  };

  btnIncFse.onclick = () => {
    btnIncFse.classList.add("active");
    btnIncFreelance.classList.remove("active");
    incFseInfo.style.display = "flex";
    incFreelanceInfo.style.display = "none";
    employmentSelected = "FSE";
    state.incentiveChoice = "FSE";
    save();
    finishBtn.disabled = !fseQuizCorrect;
  };

  incFreelanceOptions.forEach(btn => {
    btn.onclick = () => {
      incFreelanceOptions.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "11500") {
        freelancerQuizCorrect = true;
        incFreelanceFeedback.style.color = "#10B981";
        incFreelanceFeedback.innerHTML = "✓ Correct! 5 sales yields 7,500 + 4,000 = 11,500. / सही उत्तर!";
        if (employmentSelected === "Freelance") finishBtn.disabled = false;
      } else {
        freelancerQuizCorrect = false;
        incFreelanceFeedback.style.color = "#EF4444";
        incFreelanceFeedback.innerHTML = "✗ Incorrect. Please review the incentive rule for 5 devices. / गलत उत्तर।";
        finishBtn.disabled = true;
      }
    };
  });

  incFseOptions.forEach(btn => {
    btn.onclick = () => {
      incFseOptions.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const ans = btn.dataset.ans;
      if (ans === "500") {
        fseQuizCorrect = true;
        incFseFeedback.style.color = "#10B981";
        incFseFeedback.innerHTML = "✓ Correct! As FSE, you get 500 per device starting from the 5th sale. / सही उत्तर!";
        if (employmentSelected === "FSE") finishBtn.disabled = false;
      } else {
        fseQuizCorrect = false;
        incFseFeedback.style.color = "#EF4444";
        incFseFeedback.innerHTML = "✗ Incorrect. Remember FSE gets NIL incentive for first 4 sales. / गलत उत्तर।";
        finishBtn.disabled = true;
      }
    };
  });

  finishBtn.onclick = () => {
    state.attendancePassed = true;
    state.trainingCompleted = true;
    save();
    syncWithBackend();
    syncGates();
    
    // Show Congratulations Overlay with Learner Name
    const nameStr = state.name || "BD Candidate";
    let modal = $("congratsModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "congratsModal";
      modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(11,15,25,0.92);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div style="background:#111827;border:1px solid #10b981;border-radius:20px;padding:40px;max-width:550px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);animation:popIn 0.3s ease;">
        <div style="font-size:64px;margin-bottom:12px;">🎉 🎓 🏆</div>
        <h2 style="font-family:'Archivo',sans-serif;font-size:28px;color:#fff;margin:0 0 10px 0;">Congratulations, ${nameStr}!</h2>
        <p style="color:#10b981;font-size:18px;font-weight:700;margin:0 0 20px 0;">You have successfully completed the ApniBus Sales Academy!</p>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 30px 0;">You are now fully certified and field ready to pitch POS Ticketing Machines to Bus Operators.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="closeCongratsBtn" class="btn primary-btn" style="background:#10b981;color:#000;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;">View Certificate / Report</button>
        </div>
      </div>
    `;
    modal.style.display = "flex";
    
    $("closeCongratsBtn").onclick = () => {
      modal.style.display = "none";
      showCertificateModal();
    };
  };
}

async function showCertificateModal() {
  try {
    const res = await fetch(`/api/analytics?name=${encodeURIComponent(state.name || "")}`);
    if (!res.ok) throw new Error("Unable to load certificate");
    const data = await res.json();
    const cert = data.certificate || {};
    const certId = cert.certificateId || ("CERT-AB-" + Math.random().toString(36).substring(2, 10).toUpperCase());
    const learnerName = state.name || cert.recipientName || state.googleUser?.name || "BD Candidate";
    const learnerEmail = state.googleUser?.email || state.userRegistration?.email || "";
    const rawScore = cert.readinessScore !== undefined ? cert.readinessScore : (state.score || 85);
    const readinessScore = typeof rawScore === 'string' ? parseInt(rawScore.replace(/%/g, ''), 10) || 85 : Math.round(rawScore);
    const issueDate = cert.issueDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    let modal = $("certificateModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "certificateModal";
      document.body.appendChild(modal);
    }

    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(8,12,22,0.95);backdrop-filter:blur(12px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";

    modal.innerHTML = `
      <div id="printableCert" style="background:#101726;border:4px double #f0a227;border-radius:24px;padding:45px;max-width:820px;width:100%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.95);position:relative;color:#fff;box-sizing:border-box;">

        <!-- Close button (hidden when printing) -->
        <div class="no-print" style="position:absolute;top:16px;right:16px;">
          <button id="closeCertX" style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:18px;border-radius:50%;width:36px;height:36px;cursor:pointer;display:grid;place-items:center;">✕</button>
        </div>

        <!-- Header: Logo + Certificate ID -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(240,162,39,0.3);padding-bottom:20px;margin-bottom:24px;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="logo.png" alt="ApniBus Logo" style="height:44px;" />
            <div style="text-align:left;">
              <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:17px;color:#fff;">ApniBus</div>
              <div style="font-size:11.5px;color:#9ca3af;">Field Sales Training Academy</div>
            </div>
          </div>
          <div style="text-align:right;">
            <span style="display:block;font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Certificate ID</span>
            <span style="font-family:'Archivo',sans-serif;font-weight:700;color:#f0a227;font-size:13px;">${certId}</span>
          </div>
        </div>

        <!-- Trophy -->
        <div style="font-size:52px;margin-bottom:10px;filter:drop-shadow(0 4px 12px rgba(240,162,39,0.5));">🏆 📜 🥇</div>

        <!-- Title -->
        <h1 style="font-family:'Archivo',sans-serif;font-size:28px;color:#fff;margin:0 0 6px 0;letter-spacing:1px;text-transform:uppercase;">Certificate of Sales Readiness</h1>
        <p style="color:#f0a227;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 22px 0;">Official Sales Certification</p>

        <!-- Candidate Name + Email ONLY -->
        <p style="color:#9ca3af;font-size:14px;margin:0 0 8px 0;">This is to certify that</p>
        <h2 style="font-family:'Archivo',sans-serif;font-size:34px;color:#10b981;margin:0 0 8px 0;border-bottom:2px dashed rgba(16,185,129,0.4);display:inline-block;padding-bottom:6px;">${learnerName}</h2>
        ${learnerEmail ? `<p style="color:#60A5FA;font-size:13px;font-weight:500;margin:0 0 20px 0;">✉ ${learnerEmail}</p>` : '<br/>'}

        <!-- Training Description -->
        <p style="color:#d1d5db;font-size:14.5px;line-height:1.7;max-width:660px;margin:0 auto 24px auto;">
          has successfully completed the <b>6-Phase Sales Operations &amp; Field Readiness Training</b> on <b>ApniBus POS Ticketing Machine</b>, <b>Objection Handling (A-A-A-A Framework)</b>, <b>Operator Pitch Simulation</b>, and <b>Policy Compliance</b>.
        </p>

        <!-- Score Badges -->
        <div class="cert-badge-row" style="display:flex;justify-content:center;gap:20px;margin-bottom:24px;flex-wrap:wrap;">
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 22px;border-radius:12px;">
            <span style="display:block;font-size:10.5px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Readiness Score</span>
            <b style="font-size:24px;color:#10b981;font-family:'Archivo',sans-serif;">${readinessScore}%</b>
          </div>
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);padding:10px 22px;border-radius:12px;">
            <span style="display:block;font-size:10.5px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Status</span>
            <b style="font-size:18px;color:#f0a227;font-family:'Archivo',sans-serif;">FIELD READY 🎉</b>
          </div>
        </div>

        <!-- Footer: Date + Authority -->
        <div class="cert-footer-row" style="display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid rgba(255,255,255,0.12);padding-top:16px;margin-top:12px;gap:10px;">
          <div style="text-align:left;">
            <span style="display:block;font-size:12px;color:#9ca3af;">Date: <b>${issueDate}</b></span>
            <span style="display:block;font-size:10.5px;color:#6B7280;margin-top:3px;">Certificate ID: ${certId}</span>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'Archivo',sans-serif;font-weight:700;font-size:14px;color:#fff;">VP of Sales &amp; Training</div>
            <span style="display:block;font-size:12px;color:#10b981;font-weight:600;">ApniBus Sales Academy</span>
          </div>
        </div>

        <!-- Action Buttons (hidden when printing) -->
        <div class="no-print" style="display:flex;gap:12px;justify-content:center;margin-top:28px;flex-wrap:wrap;">
          <button id="downloadCertBtn" style="background:#10b981;color:#000;font-weight:700;padding:12px 26px;border-radius:10px;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:8px;">📥 Download / Print Certificate</button>
          <button id="closeCertModalBtn" style="background:rgba(255,255,255,0.1);color:#fff;font-weight:700;padding:12px 22px;border-radius:10px;border:1px solid rgba(255,255,255,0.2);cursor:pointer;font-size:14px;">✕ Close</button>
        </div>
      </div>
    `;

    modal.style.display = "flex";

    $("closeCertX").onclick = () => modal.style.display = "none";
    $("closeCertModalBtn").onclick = () => modal.style.display = "none";
    $("downloadCertBtn").onclick = () => window.print();

  } catch (e) {
    toast("Unable to generate certificate. Please complete training first!");
  }
}



/* Robust Global Click Handler for Attendance & Policy Quizzes */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("#attendanceQ1Options .part-btn, #attendanceQ2Options .part-btn, #incFseOptions .part-btn");
  if (!btn) return;

  const parent = btn.closest(".quiz-options");
  if (!parent) return;

  parent.querySelectorAll(".part-btn").forEach(x => x.classList.remove("active"));
  btn.classList.add("active");

  const ans = btn.dataset.ans;

  // Attendance Q1
  if (parent.id === "attendanceQ1Options") {
    const feedback = document.getElementById("attendanceQ1Feedback");
    const q2Box = document.getElementById("attendanceQ2Box");
    if (ans === "A") {
      window._attQ1Done = true;
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! 3 visits falls under Half Day."; }
      if (q2Box) q2Box.style.display = "flex";
    } else {
      window._attQ1Done = false;
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Please check the attendance policy table above."; }
      if (q2Box) q2Box.style.display = "none";
    }
  }

  // Attendance Q2
  if (parent.id === "attendanceQ2Options") {
    const feedback = document.getElementById("attendanceQ2Feedback");
    const btnGo = document.getElementById("btnGoToEmployment");
    const tabEmp = document.getElementById("tabEmployment");
    if (ans === "B") {
      window._attQ2Done = true;
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! Closing 1 sale marks you Present (Full Day) regardless of visits."; }
      if (btnGo) btnGo.disabled = false;
      if (tabEmp) tabEmp.removeAttribute("disabled");
    } else {
      window._attQ2Done = false;
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Remember, closing 1 sale overrides visits."; }
      if (btnGo) btnGo.disabled = true;
    }
  }

  // Incentive Question
  if (parent.id === "incFseOptions") {
    const feedback = document.getElementById("incFseFeedback");
    const finishBtn = document.getElementById("attendanceFinishBtn");
    if (ans === "500" || ans === "17300") {
      if (feedback) { feedback.style.color = "#10B981"; feedback.innerHTML = "✓ Correct! 5 sales yields ₹15,300 + ₹2,000 = ₹17,300 takeaway."; }
      if (finishBtn) finishBtn.disabled = false;
    } else {
      if (feedback) { feedback.style.color = "#EF4444"; feedback.innerHTML = "✗ Incorrect. Please review the compensation schedule for 5 sales."; }
      if (finishBtn) finishBtn.disabled = true;
    }
  }
});



/* Global Click Handler for Proceed Buttons */
document.addEventListener("click", function(e) {
  const btn = e.target.closest("#btnGoToEmployment, #btnGoToIncentive, #tabAttendance, #tabEmployment, #tabIncentive");
  if (!btn) return;

  if (btn.id === "btnGoToEmployment") {
    const tabEmp = document.getElementById("tabEmployment");
    const panelEmp = document.getElementById("panelEmployment");
    if (tabEmp) {
      tabEmp.removeAttribute("disabled");
      document.querySelectorAll(".tab-btn").forEach(t => {
        t.classList.remove("active");
        t.style.background = "rgba(255,255,255,0.02)";
        t.style.border = "1px solid var(--line)";
        t.style.color = "#8FA0B8";
      });
      tabEmp.classList.add("active");
      tabEmp.style.background = "rgba(16, 185, 129, 0.15)";
      tabEmp.style.border = "1px solid var(--green)";
      tabEmp.style.color = "var(--green)";
    }
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    if (panelEmp) panelEmp.style.display = "flex";
    state.mode = "employment";
    save();
  }

  if (btn.id === "btnGoToIncentive") {
    const tabInc = document.getElementById("tabIncentive");
    const panelInc = document.getElementById("panelIncentive");
    if (tabInc) {
      tabInc.removeAttribute("disabled");
      document.querySelectorAll(".tab-btn").forEach(t => {
        t.classList.remove("active");
        t.style.background = "rgba(255,255,255,0.02)";
        t.style.border = "1px solid var(--line)";
        t.style.color = "#8FA0B8";
      });
      tabInc.classList.add("active");
      tabInc.style.background = "rgba(16, 185, 129, 0.15)";
      tabInc.style.border = "1px solid var(--green)";
      tabInc.style.color = "var(--green)";
    }
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    if (panelInc) panelInc.style.display = "flex";
    state.mode = "incentive";
    save();
  }

  if (btn.id === "tabAttendance") {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelAttendance");
    if (p) p.style.display = "flex";
  }
  if (btn.id === "tabEmployment" && !btn.disabled) {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelEmployment");
    if (p) p.style.display = "flex";
  }
  if (btn.id === "tabIncentive" && !btn.disabled) {
    document.querySelectorAll(".policy-panel").forEach(p => p.style.display = "none");
    const p = document.getElementById("panelIncentive");
    if (p) p.style.display = "flex";
  }
});



/* Global Click Handler for Complete & Get Certificate Button */
document.addEventListener("click", function(e) {
  const finishBtn = e.target.closest("#attendanceFinishBtn");
  if (!finishBtn || finishBtn.disabled) return;

  state.attendancePassed = true;
  state.trainingCompleted = true;
  save();
  if (typeof syncWithBackend === "function") syncWithBackend();
  if (typeof syncGates === "function") syncGates();

  const nameStr = state.name || "BD Candidate";
  let modal = document.getElementById("congratsModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "congratsModal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(11,15,25,0.92);backdrop-filter:blur(8px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
    document.body.appendChild(modal);
  }
  modal.style.display = "flex";
  modal.innerHTML = `
    <div style="background:#111827;border:1px solid #10b981;border-radius:20px;padding:40px;max-width:550px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);animation:popIn 0.3s ease;">
      <div style="font-size:64px;margin-bottom:12px;">🎉 🎓 🏆</div>
      <h2 style="font-family:'Archivo',sans-serif;font-size:28px;color:#fff;margin:0 0 10px 0;">Congratulations, ${nameStr}!</h2>
      <p style="color:#10b981;font-size:18px;font-weight:700;margin:0 0 20px 0;">You have successfully completed the ApniBus Sales Academy!</p>
      <p style="color:#9ca3af;font-size:14px;line-height:1.6;margin:0 0 30px 0;">You are now fully certified and field ready to pitch POS Ticketing Machines to Bus Operators.</p>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button id="closeCongratsBtn" class="btn primary-btn" style="background:#10b981;color:#000;font-weight:700;padding:12px 24px;border-radius:10px;border:none;cursor:pointer;">View Certificate / Report</button>
      </div>
    </div>
  `;

  const closeBtn = document.getElementById("closeCongratsBtn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      if (typeof showCertificateModal === "function") showCertificateModal();
    };
  }
});



/* Google OAuth 2.0 Identity Services Handler */
window.parseJwt = function(token) {
  try {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

window.handleGoogleSignIn = async function(response) {
  if (!response || !response.credential) return;
  const payload = window.parseJwt(response.credential);
  if (!payload) return;

  console.log("✓ Google Sign-In Successful:", payload.name, payload.email);

  // Store Google user profile in state
  state.googleUser = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    sub: payload.sub
  };

  state.name = payload.name;

  // Complete registration from Google profile
  state.registered = true;
  state.userRegistration = {
    name: payload.name,
    email: payload.email,
    gender: null,
    age: null,
    location: "Field",
    lang: state.lang || "Hinglish",
    googleAuth: true,
    picture: payload.picture,
    registeredAt: new Date().toISOString()
  };

  save();

  // Send to backend (non-blocking)
  fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: response.credential,
      user: state.googleUser,
      registration: state.userRegistration
    })
  }).catch(err => console.error("Backend google auth sync error:", err));

  // Hide the registration modal
  const registrationModal = $("registrationModal");
  if (registrationModal) registrationModal.style.display = "none";

  toast(`Welcome ${payload.name}! Logged in via Google ✓`);

  // Render Google profile badge in topbar
  renderGoogleUserUI();

  // Continue the boot flow that was halted waiting for auth
  if (typeof window._bootContinuation === 'function') {
    await window._bootContinuation();
    window._bootContinuation = null;
  }
};

function renderGoogleUserUI() {
  if (!state.googleUser || !state.googleUser.email) return;

  const topbarRight = document.querySelector(".topbar > div:last-child");
  if (!topbarRight) return;

  let googleBadge = document.getElementById("googleProfileBadge");
  if (!googleBadge) {
    googleBadge = document.createElement("div");
    googleBadge.id = "googleProfileBadge";
    googleBadge.style.cssText = "display:flex;align-items:center;gap:8px;background:rgba(66,133,244,0.12);border:1px solid rgba(66,133,244,0.4);padding:5px 14px 5px 6px;border-radius:22px;font-size:12px;color:#fff;cursor:pointer;";
    topbarRight.insertBefore(googleBadge, topbarRight.firstChild);
  }

  googleBadge.innerHTML = `
    <img src="${state.googleUser.picture}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #4285F4;" alt="${state.googleUser.name}" onerror="this.style.display='none'" />
    <div style="display:flex;flex-direction:column;">
      <span style="font-weight:700;font-size:11.5px;color:#fff;line-height:1.2;">${state.googleUser.name}</span>
      <span style="font-size:9.5px;color:#60A5FA;">${state.googleUser.email} ✓</span>
    </div>
  `;
}

// On page load: if returning user has google data in localStorage, render badge
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { renderGoogleUserUI(); }, 800);
});




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
