// Text utilities shared by the client (live validation) and the server (defensive checks).

export const MIN_WORDS = 20;
export const MAX_WORDS = 1000;

/** Count words in a passage. Collapses whitespace; ignores empty tokens. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Decide whether a passage is primarily written in English.
 *
 * Heuristic: compare Latin letters against letters from other major scripts
 * (Arabic, CJK, Cyrillic, Greek, Hebrew, Devanagari). If a passage has enough
 * letters and Latin letters clearly dominate, we treat it as English.
 */
export function isPrimarilyEnglish(text: string): boolean {
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  const otherScripts = (
    text.match(
      /[؀-ۿݐ-ݿ一-鿿぀-ヿЀ-ӿͰ-Ͽ֐-׿ऀ-ॿ가-힯]/g,
    ) ?? []
  ).length;

  // Need a reasonable amount of actual letters to judge at all.
  if (latin < 10) return false;
  // Latin must clearly dominate any other script present.
  return latin >= otherScripts * 4;
}

export type ValidationCode =
  | "empty"
  | "too_short"
  | "too_long"
  | "not_english";

export interface ValidationIssue {
  code: ValidationCode;
  message: string;
}

/** Validate a passage before improving it. Returns null when the text is acceptable. */
export function validateText(text: string): ValidationIssue | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return { code: "empty", message: "Please write or paste some text first." };
  }

  const words = countWords(trimmed);
  if (words < MIN_WORDS) {
    return {
      code: "too_short",
      message: `Please write at least ${MIN_WORDS} words so we can improve it meaningfully. You have ${words}.`,
    };
  }
  if (words > MAX_WORDS) {
    return {
      code: "too_long",
      message: `Please keep your text under ${MAX_WORDS} words. You have ${words}.`,
    };
  }
  if (!isPrimarilyEnglish(trimmed)) {
    return {
      code: "not_english",
      message:
        "This tool improves English writing. Please enter a passage written primarily in English.",
    };
  }
  return null;
}
