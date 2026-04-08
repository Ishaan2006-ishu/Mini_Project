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
	process.env.GEMINI_MODEL,
	'gemini-3-flash-preview',
	'gemini-2.0-flash',
	'gemini-1.5-flash',
	'gemini-flash-latest',
].filter(Boolean);

const extractApiErrorMessage = (payload) => {
	if (!payload) return '';
	if (typeof payload === 'string') return payload;
	if (payload.error?.message) return payload.error.message;
	return '';
};

const callGeminiWithModel = async ({ apiKey, model, prompt }) => {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-goog-api-key': apiKey,
		},
		body: JSON.stringify({
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: 0.7,
				topP: 0.9,
				responseMimeType: 'application/json',
			},
		}),
	});

	let payload;
	try {
		payload = await response.json();
	} catch {
		payload = null;
	}

	if (!response.ok) {
		const message = extractApiErrorMessage(payload);
		const err = new Error(
			`Gemini API failed with status ${response.status}${message ? `: ${message}` : ''}`
		);
		err.status = response.status;
		throw err;
	}

	const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) {
		throw new Error('Gemini API returned empty content');
	}

	return text;
};

const generateMcqQuestions = async ({ role, difficulty = 'medium', count = 5 }) => {
	const safeCount = Math.max(1, Math.min(Number(count) || 5, 30));
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is missing or invalid. Configure a valid API key to generate questions.');
	}

	if (!MODEL_CANDIDATES.length) {
		throw new Error('No Gemini model configured. Set GEMINI_MODEL or keep defaults enabled.');
	}

	try {
		const prompt = buildPrompt({ role, difficulty, count: safeCount });
		let text = '';
		let lastError = null;

		for (const model of MODEL_CANDIDATES) {
			try {
				text = await callGeminiWithModel({ apiKey, model, prompt });
				lastError = null;
				break;
			} catch (error) {
				lastError = error;
				// Continue trying other models for model-not-found or quota/rate issues.
				if (![404, 429].includes(error?.status)) {
					break;
				}
			}
		}

		if (!text) {
			throw lastError || new Error('Gemini API request failed for all configured models.');
		}

		const parsed = parseJsonResponse(text);
		const aiQuestions = toQuestionObjects(parsed);
		if (!aiQuestions.length) {
			throw new Error('AI returned no questions');
		}

		return aiQuestions.slice(0, safeCount).map(normalizeQuestion);
	} catch (error) {
		throw new Error(`Failed to generate AI MCQ questions: ${error.message}`);
	}
};

module.exports = {
	generateMcqQuestions,
};
