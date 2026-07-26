"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredResult } from "@/lib/types";
import { countWords } from "@/lib/text";

const DRAFT_KEY = "wb:draft";
const RESULT_KEY = "wb:result";

type View = "improved" | "beforeAfter";

function useCopy(): [boolean, (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback(text, done));
    } else {
      fallback(text, done);
    }
  };
  return [copied, copy];
}

function fallback(text: string, done: () => void) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    done();
  } catch {
    /* copying unavailable */
  }
}

export default function ResultPage() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("improved");
  const [copied, copy] = useCopy();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESULT_KEY);
      if (raw) setStored(JSON.parse(raw) as StoredResult);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const improvedText = useMemo(
    () => (stored ? stored.result.segments.map((s) => s.text).join("") : ""),
    [stored],
  );
  const originalWords = stored ? countWords(stored.original) : 0;
  const improvedWords = countWords(improvedText);

  if (!ready) {
    return (
      <main className="page">
        <div className="loading-card">
          <div className="spinner dark" role="status" aria-label="Loading" />
        </div>
      </main>
    );
  }

  if (!stored) {
    return (
      <main className="page">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            W
          </div>
          <div className="brand-name">Writing Boost!</div>
        </div>
        <section className="card section empty-state">
          <h2>No writing to show yet</h2>
          <p>Head back and enter some text to see your improved version here.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push("/")}
          >
            Enter your text
          </button>
        </section>
      </main>
    );
  }

  const { result, band, original } = stored;

  function editOriginal() {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text: original, band }));
    } catch {
      /* ignore */
    }
    router.push("/");
  }

  function startNew() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(RESULT_KEY);
    } catch {
      /* ignore */
    }
    router.push("/");
  }

  return (
    <main className="page wide">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          W
        </div>
        <div className="brand-name">Writing Boost!</div>
      </div>

      <header className="result-top">
        <div>
          <h1>Your Improved Writing</h1>
          <div className="stat-row">
            <span className="stat accent">
              Target band <strong>{band}</strong>
            </span>
            <span className="stat">
              Original <strong>{originalWords}</strong> words
            </span>
            <span className="stat">
              Improved <strong>{improvedWords}</strong> words
            </span>
          </div>
        </div>
      </header>

      {/* 1. Improved Text ------------------------------------------------- */}
      <section className="card section">
        <div className="section-head">
          <span className="section-num">1</span>
          <h2>Improved Text</h2>
        </div>

        <div className="view-bar">
          <div className="toggle" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={view === "improved"}
              className={view === "improved" ? "on" : ""}
              onClick={() => setView("improved")}
            >
              Improved Text
            </button>
            <button
              role="tab"
              aria-selected={view === "beforeAfter"}
              className={view === "beforeAfter" ? "on" : ""}
              onClick={() => setView("beforeAfter")}
            >
              Before &amp; After
            </button>
          </div>
          <button
            type="button"
            className="btn btn-ghost copy-btn"
            onClick={() => copy(improvedText)}
          >
            {copied ? <span className="copied-flash">Copied ✓</span> : "Copy Text"}
          </button>
        </div>

        {view === "improved" ? (
          <>
            <div className="prose" dir="ltr">
              {result.segments.map((seg, i) =>
                seg.changed ? (
                  <mark className="chg" key={i}>
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </div>
            <div className="legend">
              <span className="swatch">highlighted</span>
              <span>= a word, phrase, or sentence that was improved</span>
            </div>
          </>
        ) : (
          <div className="ba-grid">
            <div className="ba-col">
              <h3>Before</h3>
              <div className="ba-box" dir="ltr">
                {original}
              </div>
            </div>
            <div className="ba-col">
              <h3>After</h3>
              <div className="ba-box after" dir="ltr">
                {improvedText}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Vocabulary Changes -------------------------------------------- */}
      {result.vocabularyChanges.length > 0 && (
        <section className="card section">
          <div className="section-head">
            <span className="section-num">2</span>
            <h2>Vocabulary Changes</h2>
          </div>
          <p className="section-desc">
            Every meaningful word or phrase that was replaced in your text.
          </p>
          <div className="list">
            {result.vocabularyChanges.map((v, i) => (
              <div className="item" key={i}>
                <div className="swap">
                  <span className="from">{v.original}</span>
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="to">{v.improved}</span>
                </div>
                <div className="arabic" dir="rtl" lang="ar">
                  {v.arabic}
                </div>
                <div className="explain" dir="ltr">
                  {v.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Useful Expressions -------------------------------------------- */}
      {result.usefulExpressions.length > 0 && (
        <section className="card section">
          <div className="section-head">
            <span className="section-num">3</span>
            <h2>Useful Expressions</h2>
          </div>
          <p className="section-desc">
            Notable expressions used in your improved text, with meaning and Arabic
            translation.
          </p>
          <div className="list">
            {result.usefulExpressions.map((e, i) => (
              <div className="item" key={i}>
                <div className="expr">{e.expression}</div>
                <div className="arabic" dir="rtl" lang="ar">
                  {e.arabic}
                </div>
                <div className="explain" dir="ltr">
                  {e.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. How the Writing Was Improved ---------------------------------- */}
      {result.techniques.length > 0 && (
        <section className="card section">
          <div className="section-head">
            <span className="section-num">4</span>
            <h2>How the Writing Was Improved</h2>
          </div>
          <p className="section-desc">
            The most important techniques applied, with real examples from your text.
          </p>
          <div className="list">
            {result.techniques.map((t, i) => (
              <div className="tech" key={i}>
                <div className="tech-name">{t.technique}</div>
                <div className="ba-mini">
                  <div className="mini before" dir="ltr">
                    <span className="tag">Before</span>
                    {t.before}
                  </div>
                  <div className="mini after" dir="ltr">
                    <span className="tag">After</span>
                    {t.after}
                  </div>
                </div>
                <div className="explain" dir="ltr">
                  {t.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Personalised Writing Tips ------------------------------------- */}
      {result.tips.length > 0 && (
        <section className="card section">
          <div className="section-head">
            <span className="section-num">5</span>
            <h2>Personalised Writing Tips</h2>
          </div>
          <p className="section-desc">
            Focused on what would most improve your writing specifically.
          </p>
          <div className="tips">
            {result.tips.map((tip, i) => (
              <div className="tip" key={i}>
                <span className="tip-num">{i + 1}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={editOriginal}>
          Edit Original Text
        </button>
        <button type="button" className="btn btn-ghost" onClick={startNew}>
          Start a New Text
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => copy(improvedText)}
        >
          {copied ? "Copied ✓" : "Copy Improved Text"}
        </button>
      </div>

      <p className="footer-note">
        This is an AI-assisted writing improvement, not an official IELTS assessment
        or a guaranteed band score.
      </p>
    </main>
  );
}
