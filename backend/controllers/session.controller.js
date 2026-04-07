const Role = require('../models/Role');

const DEFAULT_ROLES = [
	{ name: 'Frontend Developer', slug: 'frontend-developer', sortOrder: 1 },
	{ name: 'Backend Developer', slug: 'backend-developer', sortOrder: 2 },
	{ name: 'Full Stack Developer', slug: 'full-stack-developer', sortOrder: 3 },
	{ name: 'Data Analyst', slug: 'data-analyst', sortOrder: 4 },
	{ name: 'Data Scientist', slug: 'data-scientist', sortOrder: 5 },
	{ name: 'DevOps Engineer', slug: 'devops-engineer', sortOrder: 6 },
	{ name: 'Product Manager', slug: 'product-manager', sortOrder: 7 },
	{ name: 'UI UX Designer', slug: 'ui-ux-designer', sortOrder: 8 },
];

const bootstrapRolesIfEmpty = async () => {
	const count = await Role.estimatedDocumentCount();
	if (count > 0) return;
	await Role.insertMany(DEFAULT_ROLES);
};

// GET /api/sessions/roles
exports.getRoles = async (req, res, next) => {
	try {
		await bootstrapRolesIfEmpty();

		const roles = await Role.find({ isActive: true })
			.sort({ sortOrder: 1, name: 1 })
			.select('name -_id');

		res.status(200).json({
			success: true,
			roles: roles.map((role) => role.name),
		});
	} catch (err) {
		next(err);
	}
};

const Session = require('../models/Session');
const { generateMcqQuestions } = require('../services/ai.service');

const toAnswerLetter = (answerValue = '') => {
  const trimmed = String(answerValue).trim();
  if (['A', 'B', 'C', 'D'].includes(trimmed)) return trimmed;
  const match = trimmed.match(/^([A-D])\./i);
  return match ? match[1].toUpperCase() : trimmed.toUpperCase();
};

// POST /api/sessions/start
exports.startSession = async (req, res, next) => {
  try {
    const { role, difficulty, count, durationMinutes, type } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Role and difficulty are required',
      });
    }

    const safeCount = Math.max(1, Math.min(Number(count) || 5, 30));
    const safeDuration = Number(durationMinutes) || 20;
    const safeType = type || 'practice';

    const generatedQuestions = await generateMcqQuestions({
      role,
      difficulty,
      count: safeCount,
    });

    const questions = generatedQuestions.map((q, idx) => ({
      questionId: q.questionId || `q${idx + 1}`,
      question: q.questionText,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    }));
    
    const session = await Session.create({
      user: req.user.id,
      role,
      difficulty,
      count: safeCount,
      durationMinutes: safeDuration,
      type: safeType,
      questions,
    });

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        role: session.role,
        difficulty: session.difficulty,
        type: session.type,
        durationMinutes: session.durationMinutes,
        questions: session.questions,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/history
exports.getHistory = async (req, res, next) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);
    
    res.status(200).json({
      success: true,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions/:id/submit
exports.submitSession = async (req, res, next) => {
  try {
    const { answers } = req.body;
    
    const session = await Session.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const answerMap = new Map(
      Array.isArray(answers)
        ? answers.map((item) => [String(item.questionId), item.userAnswer])
        : []
    );

    let correctCount = 0;

    session.questions = session.questions.map((questionDoc, idx) => {
      const question = questionDoc.toObject();
      const fallbackId = question.questionId || `q${idx + 1}`;
      const incomingAnswer = answerMap.get(String(fallbackId)) || '';
      const selected = toAnswerLetter(incomingAnswer);
      const correct = toAnswerLetter(question.correctAnswer);
      const isCorrect = selected === correct;

      if (isCorrect) correctCount += 1;

      return {
        ...question,
        questionId: fallbackId,
        userAnswer: selected,
        isCorrect,
        score: isCorrect ? 10 : 0,
        feedback: isCorrect
          ? `Correct. ${question.explanation || ''}`.trim()
          : `Incorrect. Correct answer: ${correct}. ${question.explanation || ''}`.trim(),
      };
    });

    session.overallScore = session.questions.length
      ? Number(((correctCount / session.questions.length) * 10).toFixed(1))
      : 0;
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({ success: true, result: session });
  } catch (err) {
    next(err);
  }
};
