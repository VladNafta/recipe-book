// Запит до мовної моделі через Groq API (OpenAI-сумісний маршрут chat/completions)
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export class AiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// system – інструкція для моделі, messages – історія розмови,
// schema – JSON-схема, за якою модель має сформувати відповідь
export async function generate({ system, messages, schema }) {
  const key = process.env.AI_API_KEY;
  if (!key) throw new AiError(503, 'AI-сервіс не налаштовано');
  const model = process.env.AI_MODEL || 'openai/gpt-oss-120b';

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.4,
      max_tokens: 1500,
      reasoning_effort: 'low', // модель коротко «обдумує» відповідь – так швидше
      response_format: { type: 'json_schema', json_schema: { name: 'answer', schema, strict: true } },
    }),
    signal: AbortSignal.timeout(30000), // не чекати відповіді довше 30 с
  });

  if (!res.ok) {
    console.error('AI', res.status, (await res.text()).slice(0, 300));
    if (res.status === 429 || res.status === 402) {
      throw new AiError(503, 'Вичерпано ліміт запитів до AI, спробуйте пізніше');
    }
    throw new AiError(502, 'AI-сервіс тимчасово недоступний');
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  // модель може обгорнути JSON у пояснення – беремо фрагмент від { до }
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  try {
    return JSON.parse(json);
  } catch {
    throw new AiError(502, 'AI повернув відповідь у неочікуваному форматі');
  }
}
