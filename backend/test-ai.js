// backend/test-ai.js
require('dotenv').config()
const OpenAI = require('openai')

const run = async () => {
  const client = new OpenAI({
    apiKey:  process.env.OPENROUTER_API_KEY,
    baseURL: process.env.OPENROUTER_API_URL,
    defaultHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'MockMate Pro',
    },
  })

  const prompt = `
You are an expert technical interviewer.
This is a general technical interview practice set.

Generate 2 multiple-choice questions for role: "Frontend Developer" at difficulty: "easy".

Return ONLY valid JSON in this exact shape — no markdown, no code fences:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "Short explanation."
    }
  ]
}

Rules:
- Exactly 2 questions.
- 4 options per question labelled A, B, C, D.
- correctAnswer must be exactly one of: A, B, C, D.
- No markdown. ONLY raw JSON.
`.trim()

  try {
    const completion = await client.chat.completions.create({
      model:       process.env.OPENROUTER_MODEL,
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  1800,
      temperature: 0.7,
    })

    const raw = completion?.choices?.[0]?.message?.content || ''
    console.log('=== RAW RESPONSE ===')
    console.log(raw)
    console.log('====================')
    console.log('\nFinish reason:', completion?.choices?.[0]?.finish_reason)
    console.log('Tokens used   :', completion?.usage)

  } catch (err) {
    console.log('❌ ERROR:', err?.message)
  }
}

run()