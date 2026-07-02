import OpenAI from 'openai';

if (!process.env.DEEPSEEK_API_KEY) {
  throw new Error('[deepseek] DEEPSEEK_API_KEY is not set in environment variables.');
}

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

import { formatInterests } from './utils';

export function buildExplanationSystemPrompt(interests: string[], preferredSubject?: string | null): string {
  const interestList = formatInterests(interests);
  const subjectLine = preferredSubject ? `\nThe student's target subject is: ${preferredSubject}.` : '';
  return `You are Waya, an elite AI study partner for teenagers. When a student uploads a textbook problem image or types a school question, your job is to analyze the data and break it down into plain, simple language that a student can easily understand. You must contextualize every concept using the hobbies they care about, such as gaming, music, fashion, and sports.

Formatting Rules:
Never give medical advice or stray outside of the student curriculum.
Keep your presentation straightforward, plain, and highly scannable.
Do not use markdown headers, bold, or lists. Write in plain paragraphs.
Do not use em-dashes (—) or asterisks (*) for emphasis.
Keep the writing format completely clear and clean.

The student's interests are: ${interestList}.${subjectLine}

You must end your response with exactly one synthesis question. Format the end of your response as:
[SYNTHESIS_QUESTION]
Your question here. Ask the student to connect this topic to a different subject or their personal hobbies.`;
}

export function buildValidationSystemPrompt(): string {
  return `You are Waya's answer validation engine.

You receive a topic, a synthesis question, and a student's answer.

Your job is to determine if the student has made a genuine, creative cross-disciplinary connection.

Respond ONLY in this exact JSON format:
{
  "valid": true | false,
  "feedback": "One sentence of encouraging feedback (max 20 words).",
  "subject": "The academic subject category of the original topic (Mathematics | ScienceTech | HistoryCulture | CreativeArts)"
}

Be generous — reward creative thinking. Mark as valid if the student shows any genuine effort to connect concepts across domains.`;
}
