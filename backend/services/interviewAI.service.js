const { OpenAI } = require('openai');

const getClient = () =>
  new OpenAI({
    baseURL: process.env.OPENROUTER_API_URL,
    apiKey:  process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'MockMate Pro',
    },
  });

const FALLBACK_QUESTIONS = {
  easy: 'Can you explain the difference between a REST API and a GraphQL API with a simple example?',
  medium: 'How would you design and implement authentication and authorization for a backend service used by mobile and web clients?',
  hard: 'Design a scalable backend architecture for a real-time interview platform handling live audio, session state, and feedback generation.',
};

const getFallbackQuestion = ({ role, difficulty }) => {
  const base = FALLBACK_QUESTIONS[difficulty] || FALLBACK_QUESTIONS.medium;
  return `${base} (Role focus: ${role})`;
};

const logProviderError = (scope, err) => {
  const status = err?.status || err?.response?.status || 'unknown';
  const message = err?.message || 'Unknown provider error';
  console.error(`[InterviewAI:${scope}] Provider error (${status}): ${message}`);
};

/**
 * Generates the first or a follow-up question
 */
async function generateInterviewQuestion({ role, level, difficulty, conversationHistory, questionNumber, totalQuestions }) {
  const client = getClient();

  const systemPrompt = `You are a professional, human-like interviewer conducting a ${level} level technical interview for the role: ${role}.

RULES:
- Ask ONE clear, specific question at a time
- If this is NOT the first question, base your question on the candidate's previous answer (follow-up, go deeper, or shift topic)
- For ${level} level: ${
    difficulty === 'easy'   ? 'ask beginner-friendly conceptual questions' :
    difficulty === 'medium' ? 'ask practical scenario-based questions' :
                              'ask advanced system design and leadership questions'
  }
- Keep the question concise (2-3 sentences max)
- Sound natural like a real human interviewer
- Current question: ${questionNumber} of ${totalQuestions}
- DO NOT add any preamble like "Sure!" or "Great!". Just ask the question directly.
- DO NOT number the question.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    ...(conversationHistory.length === 0
      ? [{ role: 'user', content: `Start the interview. Ask me the first question for ${role} at ${level} level.` }]
      : [{ role: 'user', content: 'Please ask the next interview question based on my previous answer.' }]),
  ];

  try {
    const result = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'mistralai/mixtral-8x7b-instruct',
      messages,
      max_tokens: 300,
    });

    return result.choices[0].message.content.trim();
  } catch (err) {
    logProviderError('generateInterviewQuestion', err);
    return getFallbackQuestion({ role, difficulty });
  }
}

/**
 * Evaluates user answer + generates next question OR closing statement
 */
async function evaluateInterviewAnswer({ role, level, conversationHistory, userAnswer, questionNumber, totalQuestions, isLast }) {
  const client = getClient();

  const systemPrompt = `You are a professional interviewer for ${role} (${level} level).
The candidate just answered a question.

${isLast
  ? `This was the LAST question (${questionNumber} of ${totalQuestions}).
     Give a warm, natural closing like a real interviewer would: thank them, say you'll share feedback shortly.
     Return JSON: { "nextQuestion": null, "quickFeedback": "closing message" }`
  : `You have ${totalQuestions - questionNumber} questions remaining.
     Based on their answer:
     - Give a brief natural reaction (1 sentence, like a real interviewer: "Interesting..." or "Good point...")
     - Then ask a follow-up or next question
     Return JSON: { "nextQuestion": "your next question here", "quickFeedback": "brief reaction" }`
}

Return ONLY valid JSON. No extra text.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userAnswer },
  ];

  try {
    const result = await client.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'mistralai/mixtral-8x7b-instruct',
      messages,
      max_tokens: 400,
    });

    const raw = result.choices[0].message.content.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch (err) {
    logProviderError('evaluateInterviewAnswer', err);
    return {
      nextQuestion: isLast ? null : getFallbackQuestion({ role, difficulty: 'medium' }),
      quickFeedback: 'Thank you for your answer.',
    };
  }
}

module.exports = { generateInterviewQuestion, evaluateInterviewAnswer };