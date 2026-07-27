# ApniBus Sales Academy

Three-phase AI training for field BDs selling the **POS Ticketing Machine**.

| Phase | What happens | Unlocks when |
|---|---|---|
| **1 — Videos** | Watch 3 videos in order. After each, the coach asks 2 questions to confirm you actually watched. | Open from the start |
| **2 — Grooming** | Tutor mode: product deep-dive, **pitch correction**, objection handling, customer roleplay. | All 3 videos confirmed |
| **3 — Q&A Prep** | Rapid Q&A, scenarios, final roleplay, readiness score /100. | All 3 videos confirmed |

---

## Run it

**1.** Node 18+ (`node -v`)

**2.** Add your API key:
```bash
cp .env.example .env
```
Paste your key from [console.anthropic.com](https://console.anthropic.com) into `.env`.

**3.** Start:
```bash
npm install
npm start
```
Open **http://localhost:3000**

---

## Add your videos

**Option A — local files.** Drop three MP4s into `public/videos/`:
```
apnibus-introduction.mp4
apnibus-business.mp4
apnibus-commando.mp4
```

**Option B — YouTube.** Open `public/videos.json` and paste the video ID:
```json
"youtube": "dQw4w9WgXcQ",
```
(from `youtube.com/watch?v=dQw4w9WgXcQ`)

The app runs fine before videos are added — you'll see a placeholder and can still test the whole flow.

### Editing the video setup
Everything about the videos lives in `public/videos.json`: title, subtitle, what it covers, and `checkpoint` — the instruction telling the coach which 2 questions to ask afterwards. Change the checkpoint text to change what reps get quizzed on.

---

## How the gate works

Phase 2 and 3 stay locked until all three videos are confirmed. Confirmation isn't just clicking a button — the rep clicks **"I've watched this"**, the coach asks 2 questions from that video, and the video only ticks off once they answer acceptably. A rep who clicks through without watching gets caught at the questions.

To remove the gate (e.g. for experienced reps), delete the `if (mode !== "videos" && !allWatched())` block in `public/app.js`.

---

## Files you'll edit

| To change… | Edit |
|---|---|
| Product facts, FAQs, prices | `prompts/knowledge-base.md` |
| How the coach teaches, scores, corrects pitches | `prompts/system-prompt.md` |
| Videos, titles, checkpoint questions | `public/videos.json` |

Restart the server after editing the prompts. No code changes needed for content updates.

---

## Phase 2 — pitch correction

The main button. The rep types their pitch; the coach returns a fixed structure:

1. **Aapka pitch** — played back
2. **Achha kya hai** — specific, never generic praise
3. **Kya kamzor hai** — max 3 points, each with why it costs the sale
4. **Behtar version** — the full rewritten pitch, word for word
5. **Ek rule** — the reusable principle

Then it asks them to try the improved version back.

---

## Notes

- Your API key stays server-side. The browser never sees it.
- The knowledge base is sent as a cached block, so you're not billed full price for it every turn.
- The coach only states facts from the knowledge base. Missing (price, warranty, competitor names, video links) → it says so instead of inventing.
- Progress is stored in the browser. **Start over** clears it. Add login + a database before a real rollout so managers can see team scores.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Missing ANTHROPIC_API_KEY" | File must be named exactly `.env`, not `.env.txt` |
| `API 401` | Key has quotes or spaces — paste it raw |
| Port in use | `PORT=4000 npm start` |
| Video shows placeholder | File name doesn't match `videos.json`, or it's not in `public/videos/` |
| Video won't play | Must be H.264 MP4. Convert: `ffmpeg -i in.mov -vcodec h264 out.mp4` |
| Phase 2 won't unlock | Answer the coach's 2 questions after each video |
# apnibus-sales-academy
