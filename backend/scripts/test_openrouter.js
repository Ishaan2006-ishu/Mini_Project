// Small script to test OpenRouter/OpenAI API key and endpoint
require('dotenv').config();
const { OpenAI } = require('openai');

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENROUTER_API_URL;
  const model = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    console.error('No API key found in OPENROUTER_API_KEY or OPENAI_API_KEY');
    process.exit(2);
  }

  const client = new OpenAI({ apiKey, baseURL });

  try {
    const res = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    console.log('Request succeeded. Response excerpt:');
    console.log(JSON.stringify(res.choices?.[0]?.message?.content || res, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Request failed.');
    console.error('Status:', err?.status || err?.response?.status || 'unknown');
    console.error('Message:', err?.message || err?.response?.data || err);
    process.exit(1);
  }
}

test();
