# Writing Boost!

Improve any English passage to a target **IELTS writing band** — with a polished
rewrite, highlighted changes, Arabic vocabulary help, and personalised tips.

> Write with greater clarity, accuracy, and confidence.

The entire interface is in English. Arabic appears **only** in the translation
fields that explain vocabulary and expressions.

---

## Deploy a live version (real AI, any text)

The improvement runs on Claude via a server-side route, so a live deployment
needs a Node host and your Anthropic API key. The fastest path is Vercel:

1. Click **Deploy**, or go to [vercel.com/new](https://vercel.com/new) and import
   this repository.

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/cyanera/writingboost&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key&project-name=writing-boost&repository-name=writing-boost)

2. When prompted, set the `ANTHROPIC_API_KEY` environment variable to your key
   from [console.anthropic.com](https://console.anthropic.com/settings/keys).
3. Deploy. Vercel gives you a public URL that improves any text with live AI.

It runs the same on any Node host (Render, Railway, Fly.io, a VPS) — build with
`npm run build`, start with `npm start`, and set `ANTHROPIC_API_KEY`.

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

**Prerequisites:** Node.js 18.18+ (Node 22 recommended) and an
[Anthropic API key](https://console.anthropic.com/settings/keys).

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.example .env.local
#   then edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...

# 3a. Development
npm run dev
#   open http://localhost:3000

# 3b. Or a production build
npm run build
npm start
```

### Configuration

| Variable            | Required | Default          | Purpose                                  |
| ------------------- | -------- | ---------------- | ---------------------------------------- |
| `ANTHROPIC_API_KEY` | ✅       | —                | Your Anthropic API key (server‑side).    |
| `ANTHROPIC_MODEL`   | ❌       | `claude-opus-5`  | Override the model used for improvements. |

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
