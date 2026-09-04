import fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is required. Load the gitignored .env.local file.');

const model = process.env.LASTLINE_GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
const audio = fs.readFileSync(new URL('../public/demo-maya-wild-line.wav', import.meta.url)).toString('base64');
const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 40_000 } });
const request = {
  model,
  contents: [{
    role: 'user',
    parts: [
      { text: 'Transcribe this synthetic LastLine demo recording. Return only the spoken sentence.' },
      { inlineData: { data: audio, mimeType: 'audio/wav' } },
    ],
  }],
};

let response;
for (let attempt = 0; attempt < 3; attempt += 1) {
  try {
    response = await ai.models.generateContent(request);
    break;
  } catch (error) {
    const retryable = [429, 500, 502, 503, 504].includes(error?.status);
    if (!retryable || attempt === 2) throw error;
    await new Promise((resolve) => setTimeout(resolve, 750 * (2 ** attempt)));
  }
}
if (!response) throw new Error('Gemini API did not return a response.');

console.log(JSON.stringify({
  model,
  transcript: response.text,
  usage: {
    input_tokens: response.usageMetadata?.promptTokenCount ?? null,
    output_tokens: response.usageMetadata?.candidatesTokenCount ?? null,
    total_tokens: response.usageMetadata?.totalTokenCount ?? null,
  },
}, null, 2));
