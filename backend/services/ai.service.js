const { OpenRouter } = require('@openrouter/sdk');

const buildPrompt = ({ role, difficulty, count }) => `
Generate ${count} multiple-choice interview practice questions for the role "${role}" at "${difficulty}" difficulty.

Return ONLY valid JSON in this exact shape:
{
	"questions": [
		{
			"questionText": "...",
			"options": ["A. ...", "B. ...", "C. ...", "D. ..."],
			"correctAnswer": "A",
			"explanation": "Short 1-2 line explanation"
		}
	]
}

Rules:
- Exactly ${count} questions.
- 4 options per question.
- correctAnswer must be one of: A, B, C, D.
- Keep explanations concise.
- No markdown, no code fences, only JSON.
`;

const parseJsonResponse = (text) => {
	const trimmed = String(text || '').trim();
	if (!trimmed) {
		throw new Error('AI response is empty.');
	}

	// First try direct parse (works when response is pure JSON text).
	try {
		return JSON.parse(trimmed);
	} catch {
		// Continue to fallback extraction below.
	}

	// Fallback: extract probable JSON object/array from mixed text.
	const objectStart = trimmed.indexOf('{');
	const objectEnd = trimmed.lastIndexOf('}');
	const arrayStart = trimmed.indexOf('[');
	const arrayEnd = trimmed.lastIndexOf(']');

	const candidates = [];
	if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
		candidates.push(trimmed.slice(objectStart, objectEnd + 1));
	}
	if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
		candidates.push(trimmed.slice(arrayStart, arrayEnd + 1));
	}

	for (const snippet of candidates) {
		try {
			return JSON.parse(snippet);
		} catch {
			// Try next candidate.
		}
	}

	throw new Error('AI response does not contain parseable JSON.');
};

const toQuestionObjects = (parsed) => {
	if (Array.isArray(parsed?.questions)) {
		return parsed.questions;
	}

	if (Array.isArray(parsed?.data?.questions)) {
		return parsed.data.questions;
	}

	if (Array.isArray(parsed)) {
		if (parsed.every((item) => typeof item === 'object' && item !== null)) {
			return parsed;
		}

		if (parsed.every((item) => typeof item === 'string')) {
			// Support plain string arrays by converting to minimal MCQ objects.
			return parsed.map((questionText) => ({
				questionText,
				options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
				correctAnswer: 'A',
				explanation: 'AI returned question text only. Replace with generated options and answer.',
			}));
		}
	}

	return [];
};

const findQuestionArrayDeep = (value) => {
	if (Array.isArray(value)) {
		if (
			value.length &&
			value.every((item) => typeof item === 'object' && item !== null) &&
			value.some((item) =>
				['questionText', 'question', 'prompt', 'title'].some((key) =>
					Object.prototype.hasOwnProperty.call(item, key)
				)
			)
		) {
			return value;
		}

		for (const entry of value) {
			const found = findQuestionArrayDeep(entry);
			if (found.length) return found;
		}
		return [];
	}

	if (value && typeof value === 'object') {
		for (const nested of Object.values(value)) {
			const found = findQuestionArrayDeep(nested);
			if (found.length) return found;
		}
	}

	return [];
};

const extractAnyTextFromParsed = (parsed) => {
	if (!parsed) return '';
	if (typeof parsed === 'string') return parsed;

	if (Array.isArray(parsed)) {
		if (parsed.every((item) => typeof item === 'string')) {
			return parsed.join('\n');
		}
		return '';
	}

	if (typeof parsed === 'object') {
		const candidates = [
			parsed.message,
			parsed.content,
			parsed.text,
			parsed.output,
			parsed.result,
		];

		for (const candidate of candidates) {
			if (typeof candidate === 'string') return candidate;
			if (Array.isArray(candidate) && candidate.every((item) => typeof item === 'string')) {
				return candidate.join('\n');
			}
		}
	}

	return '';
};

const toQuestionObjectsFromPlainText = (text) => {
	const raw = String(text || '').trim();
	if (!raw) return [];

	// Some providers return escaped newlines and/or quote-wrapped blocks.
	const normalized = raw
		.replace(/\\n/g, '\n')
		.replace(/^['"`]+|['"`]+$/g, '')
		.trim();

	const numberedRegex = /(?:^|\n)\s*["'`\-\s]*\d+[.)]\s*(.+?)(?=(?:\n\s*["'`\-\s]*\d+[.)]\s)|$)/gs;
	const numberedQuestions = [];
	for (const match of normalized.matchAll(numberedRegex)) {
		const question = String(match[1] || '').trim();
		if (question) numberedQuestions.push(question);
	}

	// Fallback for single-line outputs like: "1. ... 2. ... 3. ..."
	if (!numberedQuestions.length) {
		const chunks = normalized
			.split(/\s+(?=\d+[.)]\s+)/g)
			.map((chunk) => chunk.trim())
			.filter((chunk) => /^\d+[.)]\s+/.test(chunk))
			.map((chunk) => chunk.replace(/^\d+[.)]\s+/, '').trim())
			.filter(Boolean);

		numberedQuestions.push(...chunks);
	}

	if (!numberedQuestions.length) {
		return [];
	}

	return numberedQuestions.map((questionText) => ({
		questionText,
		options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
		correctAnswer: 'A',
		explanation: 'Generated from plain-text AI output. Review options and answer before using.',
	}));
};

const toQuestionObjectsFromSentences = (text) => {
	const content = String(text || '');
	const sentences = content
		.split(/(?<=\?)\s+/g)
		.map((part) => part.replace(/^[\d.)\-\s"'`]+/, '').trim())
		.filter((part) => part.endsWith('?'));

	if (!sentences.length) return [];

	return sentences.map((questionText) => ({
		questionText,
		options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
		correctAnswer: 'A',
		explanation: 'Generated from AI text output. Review options and answer before using.',
	}));
};

const normalizeQuestion = (q, idx) => {
	const options = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
	const normalizedOptions = options.map((option, optionIndex) => {
		const label = String.fromCharCode(65 + optionIndex);
		const value = String(option || '').trim();
		if (!value) return `${label}. Option ${label}`;
		return /^[A-D]\./.test(value) ? value : `${label}. ${value}`;
	});

	while (normalizedOptions.length < 4) {
		const label = String.fromCharCode(65 + normalizedOptions.length);
		normalizedOptions.push(`${label}. Option ${label}`);
	}

	const correctAnswer = ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
		? q.correctAnswer
		: 'A';

	return {
		questionId: `q${idx + 1}`,
		questionText: String(q.questionText || `Question ${idx + 1}`).trim(),
		options: normalizedOptions,
		correctAnswer,
		explanation: String(q.explanation || 'Review the core concept and reasoning behind the correct option.').trim(),
	};
};

const MODEL_CANDIDATES = [
	process.env.OPENROUTER_MODEL,
	'mistralai/mixtral-8x7b-instruct',
	'google/gemini-2.0-flash-001',
	'openai/gpt-4o-mini',
].filter(Boolean);

const isAiDebug = process.env.AI_DEBUG === 'true';

const getOpenRouterClient = (apiKey) =>
	new OpenRouter({
		apiKey,
	});

const getMessageContentText = (content) => {
	if (typeof content === 'string') return content;

	if (Array.isArray(content)) {
		return content
			.map((part) => {
				if (typeof part === 'string') return part;
				if (part && typeof part === 'object' && typeof part.text === 'string') {
					return part.text;
				}
				return '';
			})
			.join('\n')
			.trim();
	}

	if (content && typeof content === 'object' && typeof content.text === 'string') {
		return content.text;
	}

	return '';
};

const extractApiErrorMessage = (error) => {
	if (!error) return '';
	if (typeof error?.message === 'string') return error.message;
	if (typeof error === 'string') return error;
	return '';
};

const callOpenRouterWithModel = async ({ apiKey, model, prompt }) => {
	try {
		const openRouter = getOpenRouterClient(apiKey);
		const completion = await openRouter.chat.send({
			httpReferer: process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
			appTitle: process.env.OPENROUTER_SITE_NAME || 'MockMate Pro',
			chatRequest: {
				model,
				messages: [{ role: 'user', content: prompt }],
				responseFormat: { type: 'json_object' },
				maxCompletionTokens: Number(process.env.OPENROUTER_MAX_COMPLETION_TOKENS) || 1800,
				stream: false,
				temperature: 0.7,
			},
		});

		const content = completion?.choices?.[0]?.message?.content;
		const text = getMessageContentText(content);

		if (!text) {
			throw new Error('OpenRouter returned empty message content');
		}

		return text;
	} catch (error) {
		const err = new Error(`OpenRouter request failed: ${extractApiErrorMessage(error)}`);
		err.status = error?.status || error?.statusCode;
		throw err;
	}
};

const generateMcqQuestions = async ({ role, difficulty = 'medium', count = 5 }) => {
	const safeCount = Math.max(1, Math.min(Number(count) || 5, 30));
	const apiKey = process.env.OPENROUTER_API_KEY;

	if (!apiKey) {
		throw new Error('OPENROUTER_API_KEY is missing or invalid. Configure a valid API key to generate questions.');
	}

	if (!MODEL_CANDIDATES.length) {
		throw new Error('No OpenRouter model configured. Set OPENROUTER_MODEL or keep defaults enabled.');
	}

	try {
		const allQuestions = [];
		const batchSize = Math.max(1, Math.min(Number(process.env.OPENROUTER_BATCH_SIZE) || 5, 10));

		while (allQuestions.length < safeCount) {
			const remaining = safeCount - allQuestions.length;
			const currentBatchCount = Math.min(batchSize, remaining);
			const prompt = buildPrompt({ role, difficulty, count: currentBatchCount });

			let text = '';
			let lastError = null;

			for (const model of MODEL_CANDIDATES) {
				try {
					text = await callOpenRouterWithModel({ apiKey, model, prompt });
					lastError = null;
					break;
				} catch (error) {
					lastError = error;

					// Keep trying fallback models for unsupported/rate-limited/upstream errors.
					if (error?.status === 401 || error?.status === 403) break;
				}
			}

			if (!text) {
				throw lastError || new Error('OpenRouter API request failed for all configured models.');
			}

			if (isAiDebug) {
				console.log('[AI_DEBUG] response type:', typeof text, 'len:', String(text).length);
				console.log('[AI_DEBUG] response preview:', String(text).slice(0, 300));
			}

			let aiQuestions = [];
			let parsed = null;
			try {
				parsed = parseJsonResponse(text);
				aiQuestions = toQuestionObjects(parsed);
				if (!aiQuestions.length) {
					aiQuestions = findQuestionArrayDeep(parsed);
				}
				if (isAiDebug) {
					console.log('[AI_DEBUG] parsed JSON keys:', parsed && typeof parsed === 'object' ? Object.keys(parsed) : 'n/a');
					console.log('[AI_DEBUG] after JSON extraction:', aiQuestions.length);
				}
			} catch {
				aiQuestions = toQuestionObjectsFromPlainText(text);
				if (isAiDebug) {
					console.log('[AI_DEBUG] JSON parse failed, plain text extracted:', aiQuestions.length);
				}
			}

			if (!aiQuestions.length) {
				const parsedText = extractAnyTextFromParsed(parsed);
				aiQuestions = toQuestionObjectsFromPlainText(parsedText || text);
				if (isAiDebug) {
					console.log('[AI_DEBUG] parsed/text fallback extracted:', aiQuestions.length);
				}
			}

			if (!aiQuestions.length) {
				aiQuestions = toQuestionObjectsFromSentences(text);
				if (isAiDebug) {
					console.log('[AI_DEBUG] sentence fallback extracted:', aiQuestions.length);
				}
			}

			if (!aiQuestions.length) {
				throw new Error('AI returned no questions');
			}

			allQuestions.push(...aiQuestions.slice(0, currentBatchCount));
		}

		return allQuestions.slice(0, safeCount).map(normalizeQuestion);
	} catch (error) {
		throw new Error(`Failed to generate AI MCQ questions: ${error.message}`);
	}
};

module.exports = {
	generateMcqQuestions,
};
