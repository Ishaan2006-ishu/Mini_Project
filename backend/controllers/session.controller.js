const Role = require('../models/Role');
const InterviewConfig = require('../models/InterviewConfig');

const DEFAULT_ROLES = [
  { name: 'Frontend Developer', slug: 'frontend-developer', sortOrder: 1 },
  { name: 'Backend Developer', slug: 'backend-developer', sortOrder: 2 },
  { name: 'Full Stack Developer', slug: 'full-stack-developer', sortOrder: 3 },
  { name: 'DevOps Engineer', slug: 'devops-engineer', sortOrder: 4 },
  { name: 'Data Analyst', slug: 'data-analyst', sortOrder: 5 },
  { name: 'Data Scientist', slug: 'data-scientist', sortOrder: 6 },
  { name: 'Machine Learning Engineer', slug: 'machine-learning-engineer', sortOrder: 7 },
  { name: 'QA Engineer', slug: 'qa-engineer', sortOrder: 8 },
  { name: 'Product Manager', slug: 'product-manager', sortOrder: 9 },
  { name: 'UI/UX Designer', slug: 'ui-ux-designer', sortOrder: 10 },
];


const bootstrapRolesIfEmpty = async () => {
	const count = await Role.estimatedDocumentCount();
	if (count > 0) return;
	await Role.insertMany(DEFAULT_ROLES);
};

const DEFAULT_INTERVIEW_CONFIG = {
  key: 'default',
  difficulties: [
    { value: 'easy', label: 'Easy', description: 'Beginner level', sortOrder: 1 },
    { value: 'medium', label: 'Medium', description: 'Intermediate level', sortOrder: 2 },
    { value: 'hard', label: 'Hard', description: 'Advanced level', sortOrder: 3 },
  ],
  questionCounts: [20, 25, 30],
  defaultDifficulty: 'medium',
  defaultQuestionCount: 25,
};

const bootstrapInterviewConfigIfMissing = async () => {
  const existing = await InterviewConfig.findOne({ key: 'default' });
  if (existing) return;
  await InterviewConfig.create(DEFAULT_INTERVIEW_CONFIG);
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

// GET /api/sessions/config
exports.getSessionConfig = async (req, res, next) => {
  try {
    await bootstrapInterviewConfigIfMissing();

    const config = await InterviewConfig.findOne({ key: 'default' })
      .select('difficulties questionCounts defaultDifficulty defaultQuestionCount -_id');

    const difficulties = (config?.difficulties || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => ({
        value: item.value,
        label: item.label,
        description: item.description,
      }));

    const questionCounts = [...(config?.questionCounts || [])]
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);

    res.status(200).json({
      success: true,
      config: {
        difficulties,
        questionCounts,
        defaultDifficulty: config?.defaultDifficulty || 'medium',
        defaultQuestionCount: Number(config?.defaultQuestionCount) || 25,
      },
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
// In exports.startSession — change this block:
exports.startSession = async (req, res, next) => {
  try {
    const { role, difficulty, count, durationMinutes, type, company } = req.body; // ← added company

    if (!role || !difficulty)
      return res.status(400).json({ success: false, message: "Role and difficulty are required" });

    const safeCount    = Math.max(1, Math.min(Number(count) || 5, 30));
    const safeDuration = Number(durationMinutes) || 20;
    const safeType     = type || "practice";
    const safeCompany  = company ? String(company).trim() : null; // ← NEW

    const generatedQuestions = await generateMcqQuestions(
      role, difficulty, safeCount, safeCompany   // ← pass company to AI
    );

    const session = await Session.create({
      user: req.user.id, role, difficulty,
      count: safeCount, durationMinutes: safeDuration,
      type: safeType,
      company: safeCompany,  // ← save to DB
      questions: generatedQuestions.map((q, idx) => ({
        questionId: q.questionId || `q${idx + 1}`,
        question: q.questionText, questionText: q.questionText,
        options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation,
      })),
    });

    res.status(201).json({ success: true, session: {
      id: session.id, role: session.role, difficulty: session.difficulty,
      type: session.type, company: session.company,
      durationMinutes: session.durationMinutes, questions: session.questions,
    }});
  } catch (err) { next(err); }
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
