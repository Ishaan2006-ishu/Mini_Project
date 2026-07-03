const Session = require('../models/Session');
const { generateInterviewQuestion, evaluateInterviewAnswer } = require('../services/interviewAI.service');

// POST /api/interview/start
exports.startInterview = async (req, res, next) => {
  try {
    const { role, level } = req.body;
    if (!role || !level) {
      return res.status(400).json({ success: false, message: 'Role and level are required' });
    }

    const levelMap = {
      fresher: { difficulty: 'easy',   questionCount: 5,  label: 'Fresher'  },
      junior:  { difficulty: 'medium', questionCount: 8,  label: 'Junior'   },
      senior:  { difficulty: 'hard',   questionCount: 10, label: 'Senior'   },
    };

    const config = levelMap[level.toLowerCase()];
    if (!config) {
      return res.status(400).json({ success: false, message: 'Invalid level. Use: fresher, junior, senior' });
    }

    // Generate the FIRST question from AI
    const firstQuestion = await generateInterviewQuestion({
      role,
      level: config.label,
      difficulty: config.difficulty,
      conversationHistory: [],
      questionNumber: 1,
      totalQuestions: config.questionCount,
    });

    // Save session to DB
    const session = await Session.create({
      user: req.user.id,
      role,
      difficulty: config.difficulty,
      count: config.questionCount,
      durationMinutes: config.questionCount * 3,
      type: 'interview',
      questions: [],            // filled on submit
    });

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        role,
        level: config.label,
        difficulty: config.difficulty,
        totalQuestions: config.questionCount,
      },
      firstQuestion,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/:id/respond
// Called after user answers each question
exports.respondToAnswer = async (req, res, next) => {
  try {
    const { userAnswer, conversationHistory, questionNumber, totalQuestions } = req.body;
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const isLast = questionNumber >= totalQuestions;

    // AI evaluates answer + generates next question (or closing)
    const aiResponse = await evaluateInterviewAnswer({
      role: session.role,
      level: req.body.level || 'Junior',
      conversationHistory,
      userAnswer,
      questionNumber,
      totalQuestions,
      isLast,
    });

    res.json({
      success: true,
      nextQuestion: aiResponse.nextQuestion,   // null if last
      feedback: aiResponse.quickFeedback,       // brief real-time reaction
      isLast,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/interview/:id/finish
// Called at the very end — saves full transcript & scores
exports.finishInterview = async (req, res, next) => {
  try {
    const { conversationHistory, level } = req.body;
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const { OpenAI } = require('openai');
    const client = new OpenAI({
      baseURL: process.env.OPENROUTER_API_URL,
      apiKey:  process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'MockMate Pro',
      },
    });

    const systemPrompt = `You are an expert technical interviewer.
You just completed a ${level} level interview for the role: ${session.role}.

Based on the full conversation below, provide a JSON evaluation.
Return ONLY valid JSON in this format:
{
  "overallScore": <number 0-10>,
  "technicalScore": <number 0-10>,
  "communicationScore": <number 0-10>,
  "confidenceScore": <number 0-10>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "summary": "2-3 sentence overall feedback",
  "questionScores": [
    { "question": "...", "answer": "...", "score": <0-10>, "feedback": "..." }
  ]
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: 'Please evaluate the full interview now.' },
    ];

    let evaluation;
    try {
      const modelName = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';
      console.debug(`[InterviewAI:finishInterview] using model: ${modelName}`);
      const result = await client.chat.completions.create({
        model: modelName,
        messages,
        max_tokens: 2000,
      });

      const raw = result.choices[0].message.content.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (err) {
      const status = err?.status || err?.response?.status || 'unknown';
      const msg = err?.message || 'Unknown provider error';
      console.error(`[InterviewAI:finishInterview] Provider error (${status}): ${msg}`);
      const error = new Error(`AI provider error while finishing interview: ${msg}`);
      error.statusCode = 502;
      throw error;
    }

    // Build questions array for Session model
    const questions = (evaluation.questionScores || []).map((q, idx) => ({
      questionId: `q${idx + 1}`,
      questionText: q.question || `Question ${idx + 1}`,
      question: q.question || `Question ${idx + 1}`,
      options: [],
      correctAnswer: '',
      userAnswer: q.answer || '',
      isCorrect: (q.score || 0) >= 5,
      score: q.score || 0,
      feedback: q.feedback || '',
      explanation: q.feedback || '',
    }));

    session.questions = questions;
    session.overallScore = evaluation.overallScore || 0;
    session.completedAt = new Date();
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      evaluation,
    });
  } catch (err) {
    next(err);
  }
};