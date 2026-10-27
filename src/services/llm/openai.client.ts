import { OpenAI } from 'openai';

import { Env } from '../../common/constants/env.constants.ts';

const client = new OpenAI({
  apiKey: Env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = 'gpt-4o-mini';

async function chatJson(system: string, user: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.4,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI 응답이 비어 있습니다.');
  }
  return content;
}

export default {
  chatJson,
};
