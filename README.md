# Writing Boost!

Improve any English passage to a target **IELTS writing band** — with a polished
rewrite, highlighted changes, Arabic vocabulary help, and personalised tips.

> Write with greater clarity, accuracy, and confidence.

The entire interface is in English. Arabic appears **only** in the translation
fields that explain vocabulary and expressions.

---

## Deploy a live version (real AI, any text)

The improvement runs on the server, so a live deployment needs a Node host and
**one AI key**. You can host **for free** on Vercel; the app supports two AI
providers:

- **Google Gemini — free, no credit card.** Get a key at
  [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set
  `GEMINI_API_KEY`. This is the recommended free path.
- **Anthropic Claude — paid, highest quality.** Get a key at
  [console.anthropic.com](https://console.anthropic.com/settings/keys) and set
  `ANTHROPIC_API_KEY` (takes priority if both are set).

### Deploy on Vercel (free)

1. Click **Deploy**, or go to [vercel.com/new](https://vercel.com/new) and import
   this repository.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cyanera/writingboost&env=GEMINI_API_KEY&envDescription=A%20free%20Google%20Gemini%20API%20key%20from%20aistudio.google.com/apikey&project-name=writing-boost&repository-name=writing-boost)

2. When prompted, set **`GEMINI_API_KEY`** to your free key (or
   `ANTHROPIC_API_KEY` if you prefer Claude).
3. Deploy. Vercel gives you a public URL that improves any text with live AI.

It runs the same on any Node host (Render, Railway, Fly.io, a VPS) — build with
`npm run build`, start with `npm start`, and set one of the keys above.

---

## What it does

**Page 1 — Enter Your Text**

- A large text area for writing or pasting any English passage.
- A live word counter.
- A **“Suggest a topic”** helper: not sure what to write about? Get an IELTS or
  general topic (technology, friendship, travel…) for inspiration.
- A target IELTS band selector (5.0 → 9.0).
- The primary **“Improve My Writing”** button.
- Clear validation for empty, too‑short, too‑long, or non‑English text.
- A friendly loading state, and clear error messages with a **Retry** option.

**Page 2 — Your Improved Writing**

1. **Improved Text** — the full rewrite with every changed word, phrase, addition,
   and restructuring highlighted. Toggle between **Improved Text** and
   **Before & After**, copy the text, and see original vs improved word counts and
   the target band.
2. **Vocabulary Changes** — each meaningful replacement with the original wording,
   the improved wording, an **Arabic translation** (right‑to‑left), and why it fits.
3. **Useful Expressions** — notable expressions that genuinely appear in the final
   text, each with an Arabic translation and a short explanation.
4. **How the Writing Was Improved** — the key techniques applied, each with a real
   *before* and *after* example from your text.
5. **Personalised Writing Tips** — 3–6 tips based on the specific weaknesses found
   in your submission.

Actions: **Edit Original Text**, **Start a New Text**, **Copy Improved Text**.

Your text and result are preserved for the session, so a refresh won’t lose them.
English is always shown left‑to‑right; Arabic translations display right‑to‑left.

The improvement preserves your meaning, ideas, arguments, and facts — it never
invents new content, and it favours precise, natural phrasing over inflated
vocabulary. A discreet note reminds you this is an AI‑assisted improvement, not an
official IELTS assessment or a guaranteed band score.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Anthropic Claude** via the official `@anthropic-ai/sdk`, using **structured
  outputs** so the model returns a reliable, typed result
- **Thmanyah** serif font (bundled locally in `public/fonts`)
- Plain, hand‑written CSS design system — no UI framework

The Claude call runs **only on the server** (`app/api/improve/route.ts`), so your
API key is never exposed to the browser.

---

## Running the app

**Prerequisites:** Node.js 18.18+ (Node 22 recommended) and **one AI key** —
a free [Google Gemini key](https://aistudio.google.com/apikey) or an
[Anthropic key](https://console.anthropic.com/settings/keys).

```bash
# 1. Install dependencies
npm install

# 2. Add one AI key
cp .env.example .env.local
#   then edit .env.local and set GEMINI_API_KEY=...  (free)
#   or ANTHROPIC_API_KEY=sk-ant-...                  (paid)

# 3a. Development
npm run dev
#   open http://localhost:3000

# 3b. Or a production build
npm run build
npm start
```

### Configuration

Set **one** provider key. If `ANTHROPIC_API_KEY` is present it is used;
otherwise the app uses `GEMINI_API_KEY`.

| Variable            | Required        | Default            | Purpose                                        |
| ------------------- | --------------- | ------------------ | ---------------------------------------------- |
| `GEMINI_API_KEY`    | one key needed  | —                  | Free Google Gemini key (aistudio.google.com).  |
| `GEMINI_MODEL`      | ❌              | `gemini-2.5-flash` | Override the Gemini model.                      |
| `ANTHROPIC_API_KEY` | one key needed  | —                  | Anthropic key; takes priority if set.          |
| `ANTHROPIC_MODEL`   | ❌              | `claude-opus-5`    | Override the Anthropic model.                   |

`.env.local` is git‑ignored, so credentials are never committed.

---

## Project structure

```
app/
  layout.tsx            Root layout, fonts, metadata
  globals.css           Design system (calm, light‑blue theme)
  page.tsx              Page 1 — enter text, band, topic suggestions
  result/page.tsx       Page 2 — improved writing + analysis
  api/improve/route.ts  Server route calling Claude (protects the API key)
lib/
  types.ts              Shared types and the band list
  text.ts               Word count, English detection, validation
  topics.ts             Curated topic suggestions
public/fonts/           Thmanyah font files
```

---

## Notes

- Input is bounded to 20–1000 words so improvements stay meaningful and costs stay
  predictable.
- If the server has no API key configured, the app shows a clear message instead of
  failing silently.
