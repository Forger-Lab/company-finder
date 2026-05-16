// Gemini integration for generating UK company name ideas.
// Exposes a single function: `generateCompanyNames(description)`.
//
// Reliability strategy:
//   - One initial call.
//   - On a malformed model response (non-JSON, wrong shape, no names),
//     send a follow-up turn that includes the parse error and asks the
//     model to fix it. Up to 2 self-correction attempts.
//   - On a transport/HTTP failure, retry the request up to 2 times with
//     a short backoff.
//   - If all attempts fail, throw — the caller is expected to surface
//     this to the user as an error.

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_FIX_ATTEMPTS = 2;
const MAX_TRANSPORT_RETRIES = 2;

const SYSTEM_PROMPT = `You are an expert UK company-name brainstormer.

The user will describe their business in plain English. Generate 10 distinctive, memorable, registrable UK company names that fit that business.

Requirements:
- Each name must be unique in the list.
- Avoid generic filler words like "Limited", "Ltd", "Company", "UK", "Holdings", "Group", "Services", "International" — those are disregarded under Companies House same-as rules and weaken distinctiveness.
- Mix styles: 2-3 short single-word coined names, 2-3 two-word evocative names, 2-3 metaphor/imagery names, the rest founder-style or sector-specific.
- Keep each name under 40 characters.
- No emoji, no punctuation other than apostrophes or ampersands where they naturally belong.
- Do NOT include the legal suffix (no "Ltd", "Limited" etc.) — the user will add that later.

Return strictly as JSON matching the requested schema.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    names: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['names'],
} as const;

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
}

class MalformedResponseError extends Error {
  constructor(message: string, public readonly rawText: string) {
    super(message);
    this.name = 'MalformedResponseError';
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function callGemini(
  apiKey: string,
  contents: GeminiContent[],
): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_TRANSPORT_RETRIES; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 1.0,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Gemini HTTP ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = (await res.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!text) throw new Error('Gemini returned no text content');
      return text;
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_TRANSPORT_RETRIES) {
        await sleep(300 * (attempt + 1));
        continue;
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Gemini call failed: ${String(lastErr)}`);
}

function parseNames(text: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new MalformedResponseError(
      `Could not parse JSON: ${err instanceof Error ? err.message : String(err)}`,
      text,
    );
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new MalformedResponseError(
      'Top-level value is not a JSON object',
      text,
    );
  }

  const rawNames = (parsed as { names?: unknown }).names;
  if (!Array.isArray(rawNames)) {
    throw new MalformedResponseError(
      '`names` field is missing or not an array',
      text,
    );
  }

  const names = rawNames
    .filter((n): n is string => typeof n === 'string')
    .map(n => n.trim())
    .filter(Boolean);

  if (names.length === 0) {
    throw new MalformedResponseError(
      '`names` array is empty after filtering',
      text,
    );
  }

  // De-dupe while preserving order.
  return [...new Set(names)].slice(0, 12);
}

export async function generateCompanyNames(description: string): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const initialUserTurn: GeminiContent = {
    role: 'user',
    parts: [{ text: `Business description:\n\n${description}` }],
  };

  const conversation: GeminiContent[] = [initialUserTurn];

  for (let fixAttempt = 0; fixAttempt <= MAX_FIX_ATTEMPTS; fixAttempt++) {
    const text = await callGemini(apiKey, conversation);

    try {
      return parseNames(text);
    } catch (err) {
      if (!(err instanceof MalformedResponseError)) throw err;

      if (fixAttempt >= MAX_FIX_ATTEMPTS) {
        throw new Error(
          `Gemini returned a malformed response after ${MAX_FIX_ATTEMPTS + 1} attempts. ` +
            `Last error: ${err.message}`,
        );
      }

      // Append the bad model output + a corrective user turn, then loop.
      conversation.push(
        { role: 'model', parts: [{ text }] },
        {
          role: 'user',
          parts: [
            {
              text:
                `Your previous response was malformed and could not be used.\n\n` +
                `Parse error: ${err.message}\n\n` +
                `Please respond again with valid JSON that matches the schema ` +
                `{"names": string[]} — an object with a single key "names" whose value ` +
                `is an array of at least one company name string. No extra fields, ` +
                `no markdown, no commentary.`,
            },
          ],
        },
      );
    }
  }

  // Unreachable — the loop either returns or throws.
  throw new Error('Gemini name generation failed unexpectedly');
}
