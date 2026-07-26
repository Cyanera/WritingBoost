import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BANDS, type ApiError, type ApiResponse, type ImprovementResult } from "@/lib/types";
import { validateText } from "@/lib/text";

export const runtime = "nodejs";
// Improvements can take a little while with a reasoning model — allow headroom.
export const maxDuration = 300;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

// JSON Schema for the structured result. Follows the structured-output rules:
// every object sets additionalProperties:false and lists required fields.
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    segments: {
      type: "array",
      description:
        "The complete improved text, split into ordered pieces. Concatenating every 'text' value in order MUST reproduce the full improved passage exactly, including spaces and punctuation.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string" },
          changed: {
            type: "boolean",
            description:
              "true if this piece was changed, added, or restructured relative to the original; false if it is unchanged from the original.",
          },
        },
        required: ["text", "changed"],
      },
    },
    vocabularyChanges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          original: { type: "string" },
          improved: { type: "string" },
          arabic: {
            type: "string",
            description: "Arabic translation of the improved wording.",
          },
          explanation: {
            type: "string",
            description: "Short English explanation of why it works better here.",
          },
        },
        required: ["original", "improved", "arabic", "explanation"],
      },
    },
    usefulExpressions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          expression: { type: "string" },
          arabic: {
            type: "string",
            description: "Arabic translation of the expression.",
          },
          explanation: {
            type: "string",
            description: "Short English explanation of meaning and how it was used.",
          },
        },
        required: ["expression", "arabic", "explanation"],
      },
    },
    techniques: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          technique: { type: "string" },
          before: {
            type: "string",
            description: "A real excerpt from the user's original text.",
          },
          after: {
            type: "string",
            description: "The corresponding excerpt from the improved text.",
          },
          explanation: { type: "string" },
        },
        required: ["technique", "before", "after", "explanation"],
      },
    },
    tips: {
      type: "array",
      description: "3 to 6 practical, personalised tips for this specific writer.",
      items: { type: "string" },
    },
  },
  required: [
    "segments",
    "vocabularyChanges",
    "usefulExpressions",
    "techniques",
    "tips",
  ],
} as const;

function systemPrompt(band: string): string {
  return `You are an expert IELTS writing tutor. You improve a student's English passage so it reads as close as reasonably possible to IELTS band ${band}, while strictly preserving the original meaning, ideas, arguments, and factual content.

CORE RULES
- IMPROVE, DO NOT REWRITE. Refine and polish the writer's OWN text. Keep their words, sentences, order, and structure wherever they already work, and change only what genuinely needs fixing or strengthening. The result must be clearly recognisable as the SAME passage the writer submitted — never replace it with a different essay, a new topic, or invented content.
- Preserve the writer's meaning, ideas, arguments, and facts exactly. Do NOT invent new facts, examples, sources, opinions, or content, and do NOT answer or complete the prompt for them — only improve what they wrote.
- Make the smallest set of changes that achieves the target band. If a word or sentence is already correct and clear, leave it unchanged.
- Improve, as needed: vocabulary accuracy and range; grammar and sentence structure; coherence and cohesion; linking words and transitions; clarity and academic tone; spelling and punctuation; reduced repetition; natural phrasing.
- The band is a TARGET for the rewrite, not an official score. Match the register and complexity expected at band ${band}: for lower bands keep it clear and correct; for higher bands use precise, fluent, natural academic English.
- Do NOT replace simple words with rare or unnatural vocabulary just to look advanced. Higher-band writing is precise and fluent, never inflated or robotic.
- Keep the improved text the same length, topic, and scope as the original. Do not add whole new paragraphs or new ideas.

OUTPUT — return ONLY the JSON object required by the schema. All prose (explanations, tips, technique names) must be in English. Only the "arabic" fields contain Arabic.

FIELD GUIDANCE
- segments: the FULL improved passage, split into ordered pieces. Concatenating every segment's "text" in order must reproduce the improved passage exactly (preserve all spaces, line breaks, and punctuation). Mark a piece "changed": true when it is a changed word/phrase, an addition, or a restructured span; mark unchanged spans "changed": false. Split at boundaries of change so unchanged text stays in its own segments. Keep whitespace attached sensibly so the reconstructed text reads naturally.
- vocabularyChanges: only list replacements that ACTUALLY appear in the improved text. For each, give the original word/phrase, the improved word/phrase, the Arabic translation of the improved wording, and a short reason it fits better here. Do not list changes you did not make.
- usefulExpressions: only expressions that GENUINELY appear in the final improved text. Give the expression, its Arabic translation, and a short note on meaning and how it was used.
- techniques: the most important techniques you applied (e.g. sentence variety, stronger cohesion, more precise vocabulary, better academic tone, grammar correction, reduced repetition, clearer organisation). For each, include a REAL "before" excerpt from the original and the matching "after" excerpt from the improved text.
- tips: 3 to 6 practical tips based specifically on the weaknesses in THIS submission. Avoid generic IELTS advice; prioritise what would most improve this particular writer.

If the original is already strong, still return honest, useful analysis and keep unnecessary changes minimal.`;
}

function badRequest(code: ApiError["code"], error: string) {
  return NextResponse.json<ApiResponse>({ ok: false, code, error }, { status: 400 });
}

export async function POST(req: Request) {
  let body: { text?: unknown; band?: unknown };
  try {
    body = await req.json();
  } catch {
    return badRequest("server", "Invalid request body.");
  }

  const text = typeof body.text === "string" ? body.text : "";
  const band = typeof body.band === "string" ? body.band : "";

  if (!(BANDS as readonly string[]).includes(band)) {
    return badRequest("invalid_band", "Please choose a valid target band.");
  }

  const issue = validateText(text);
  if (issue) {
    return badRequest(issue.code, issue.message);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json<ApiResponse>(
      {
        ok: false,
        code: "no_api_key",
        error:
          "The server is missing its Anthropic API key. Add ANTHROPIC_API_KEY to .env.local and restart.",
      },
      { status: 500 },
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system: systemPrompt(band),
      output_config: {
        effort: "medium",
        format: {
          type: "json_schema",
          schema: RESULT_SCHEMA as unknown as Record<string, unknown>,
        },
      },
      messages: [
        {
          role: "user",
          content: `Improve the following passage to IELTS band ${band}. Return only the JSON object.\n\n<passage>\n${text.trim()}\n</passage>`,
        },
      ],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          code: "upstream",
          error:
            "The request could not be processed. Please adjust your text and try again.",
        },
        { status: 502 },
      );
    }

    const textBlock = message.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      return NextResponse.json<ApiResponse>(
        { ok: false, code: "bad_response", error: "The model returned no text." },
        { status: 502 },
      );
    }

    let parsed: ImprovementResult;
    try {
      parsed = JSON.parse(textBlock.text) as ImprovementResult;
    } catch {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          code: "bad_response",
          error: "The improvement result could not be read. Please try again.",
        },
        { status: 502 },
      );
    }

    if (
      !parsed ||
      !Array.isArray(parsed.segments) ||
      parsed.segments.length === 0 ||
      !Array.isArray(parsed.vocabularyChanges) ||
      !Array.isArray(parsed.usefulExpressions) ||
      !Array.isArray(parsed.techniques) ||
      !Array.isArray(parsed.tips)
    ) {
      return NextResponse.json<ApiResponse>(
        {
          ok: false,
          code: "bad_response",
          error: "The improvement result was incomplete. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json<ApiResponse>({ ok: true, result: parsed });
  } catch (err) {
    const status =
      err instanceof Anthropic.APIError && typeof err.status === "number"
        ? err.status
        : 502;
    let error = "We couldn't reach the improvement service. Please try again.";
    if (err instanceof Anthropic.AuthenticationError) {
      error = "The Anthropic API key is invalid. Please check your configuration.";
    } else if (err instanceof Anthropic.RateLimitError) {
      error = "The service is busy right now. Please wait a moment and try again.";
    }
    return NextResponse.json<ApiResponse>(
      { ok: false, code: "upstream", error },
      { status: status >= 400 && status < 600 ? status : 502 },
    );
  }
}
