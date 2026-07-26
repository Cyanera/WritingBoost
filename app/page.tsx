"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BANDS, type Band, type ApiResponse, type StoredResult } from "@/lib/types";
import {
  countWords,
  validateText,
  MAX_WORDS,
  type ValidationCode,
} from "@/lib/text";
import { TOPICS, nextTopicIndex } from "@/lib/topics";
import { Brand } from "./Brand";

const DRAFT_KEY = "wb:draft";
const RESULT_KEY = "wb:result";

const LOADING_STEPS = [
  "Reading your ideas and meaning",
  "Refining vocabulary, grammar, and flow",
  "Preparing explanations and tips",
];

export default function EnterTextPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [band, setBand] = useState<Band>("6.5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [topicIndex, setTopicIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore any draft saved earlier this session (survives a refresh).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { text?: string; band?: string };
        if (typeof draft.text === "string") setText(draft.text);
        if (draft.band && (BANDS as readonly string[]).includes(draft.band)) {
          setBand(draft.band as Band);
        }
      }
    } catch {
      /* ignore malformed draft */
    }
    setHydrated(true);
  }, []);

  // Persist the draft as the user works.
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ text, band }));
    } catch {
      /* storage may be unavailable; not fatal */
    }
  }, [text, band, hydrated]);

  const words = countWords(text);
  const issue = validateText(text);
  const overLimit = words > MAX_WORDS;

  async function handleImprove() {
    setShowValidation(true);
    setError(null);
    const currentIssue = validateText(text);
    if (currentIssue) {
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), band }),
      });
      const data = (await res.json()) as ApiResponse;

      if (!data.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      const stored: StoredResult = {
        original: text.trim(),
        band,
        result: data.result,
        createdAt: Date.now(),
      };
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(stored));
      router.push("/result");
    } catch {
      setError(
        "We couldn't connect to the improvement service. Please check your connection and try again.",
      );
      setLoading(false);
    }
  }

  // Which inline validation message (if any) to show under the field.
  let inlineMessage: { code: ValidationCode; text: string } | null = null;
  if (showValidation && issue) {
    inlineMessage = { code: issue.code, text: issue.message };
  }

  return (
    <main className="page">
      <Brand />

      <header className="hero">
        <h1>Write with greater clarity, accuracy, and confidence.</h1>
        <p className="lede">
          Paste your English writing, choose a target IELTS band, and get a polished
          version with clear explanations of every change.
        </p>
      </header>

      {loading ? (
        <section className="card loading-card" aria-live="polite">
          <div className="spinner" role="status" aria-label="Improving your writing" />
          <div className="loading-title">Improving your writing…</div>
          <div className="loading-sub">
            This usually takes a moment. Please keep this tab open.
          </div>
          <ul className="loading-steps">
            {LOADING_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="card editor">
          <div className="field-top">
            <label className="field-label" htmlFor="passage">
              Your text
            </label>
            <button
              type="button"
              className="suggest-btn"
              onClick={() => setTopicIndex((cur) => nextTopicIndex(cur ?? -1))}
              aria-expanded={topicIndex !== null}
            >
              <span aria-hidden="true">💡</span>{" "}
              {topicIndex === null ? "Suggest a topic" : "Another topic"}
            </button>
          </div>

          {topicIndex !== null && (
            <div className="topic-card" role="status" aria-live="polite">
              <span className="topic-tag">
                {TOPICS[topicIndex].category === "IELTS"
                  ? "IELTS topic"
                  : "General topic"}
              </span>
              <p className="topic-text">{TOPICS[topicIndex].prompt}</p>
              <div className="topic-actions">
                <span className="topic-hint">
                  Write your own response below, then improve it.
                </span>
                <button
                  type="button"
                  className="topic-dismiss"
                  onClick={() => setTopicIndex(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <textarea
            id="passage"
            ref={textareaRef}
            className={`passage${inlineMessage ? " invalid" : ""}`}
            dir="ltr"
            placeholder="Write or paste any English passage here — an essay, a paragraph, a cover letter…"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={inlineMessage ? true : undefined}
            aria-describedby="counter"
          />

          <div className="meta-row">
            <span
              id="counter"
              className={`counter${overLimit ? " warn" : ""}`}
              aria-live="polite"
            >
              <strong>{words}</strong> {words === 1 ? "word" : "words"}
              {overLimit ? ` · limit ${MAX_WORDS}` : ""}
            </span>
          </div>

          {inlineMessage && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon" aria-hidden="true">
                !
              </span>
              <span>{inlineMessage.text}</span>
            </div>
          )}

          <div className="band-block">
            <label className="field-label" id="band-label">
              Target IELTS band
            </label>
            <div
              className="band-grid"
              role="radiogroup"
              aria-labelledby="band-label"
            >
              {BANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  role="radio"
                  aria-checked={band === b}
                  className={`band-chip${band === b ? " selected" : ""}`}
                  onClick={() => setBand(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleImprove}
            disabled={loading}
          >
            Improve My Writing
          </button>

          {error && (
            <div className="alert alert-error" role="alert">
              <span className="alert-icon" aria-hidden="true">
                !
              </span>
              <span>{error}</span>
              <button
                type="button"
                className="btn btn-ghost copy-btn retry"
                onClick={handleImprove}
              >
                Retry
              </button>
            </div>
          )}

          <p className="note">
            This is an AI-assisted writing improvement, not an official IELTS
            assessment or a guaranteed band score.
          </p>
        </section>
      )}
    </main>
  );
}
