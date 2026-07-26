// Shared types for the Writing Boost! application.

/** The IELTS band levels a user can target. */
export const BANDS = [
  "5.0",
  "5.5",
  "6.0",
  "6.5",
  "7.0",
  "7.5",
  "8.0",
  "8.5",
  "9.0",
] as const;

export type Band = (typeof BANDS)[number];

/** A single ordered piece of the improved text. */
export interface TextSegment {
  /** The verbatim text of this piece. Concatenating all segments rebuilds the full improved text. */
  text: string;
  /** True when this piece was changed, added, or restructured relative to the original. */
  changed: boolean;
}

/** A meaningful vocabulary or phrase replacement actually used in the improved text. */
export interface VocabularyChange {
  original: string;
  improved: string;
  /** Arabic translation of the improved wording (displayed right-to-left). */
  arabic: string;
  /** Short English explanation of why the new wording works better here. */
  explanation: string;
}

/** A notable expression that genuinely appears in the improved text. */
export interface UsefulExpression {
  expression: string;
  /** Arabic translation (displayed right-to-left). */
  arabic: string;
  /** Short English explanation of meaning and how it was used. */
  explanation: string;
}

/** An improvement technique with a real before/after example from the user's text. */
export interface Technique {
  technique: string;
  before: string;
  after: string;
  explanation: string;
}

/** The full structured result returned by the model. */
export interface ImprovementResult {
  /** The complete improved text as ordered segments (changed pieces are highlighted). */
  segments: TextSegment[];
  vocabularyChanges: VocabularyChange[];
  usefulExpressions: UsefulExpression[];
  techniques: Technique[];
  /** 3–6 personalised tips based on weaknesses in the submitted text. */
  tips: string[];
}

/** What the client stores in sessionStorage and renders on the result page. */
export interface StoredResult {
  original: string;
  band: Band;
  result: ImprovementResult;
  createdAt: number;
}

export interface ApiSuccess {
  ok: true;
  result: ImprovementResult;
}

export interface ApiError {
  ok: false;
  error: string;
  /** Machine-readable reason so the client can tailor the message. */
  code:
    | "empty"
    | "too_short"
    | "not_english"
    | "too_long"
    | "invalid_band"
    | "no_api_key"
    | "upstream"
    | "bad_response"
    | "server";
}

export type ApiResponse = ApiSuccess | ApiError;
