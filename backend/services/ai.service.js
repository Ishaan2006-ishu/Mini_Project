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
	const trimmed = text.trim();
	const start = trimmed.indexOf('{');
	const end = trimmed.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('AI response does not contain valid JSON object.');
	}
	return JSON.parse(trimmed.slice(start, end + 1));
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

const generateMcqQuestions = async ({ role, difficulty = 'medium', count = 5 }) => {
	const safeCount = Math.max(1, Math.min(Number(count) || 5, 30));
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey || apiKey === 'your_gemini_api_key_here') {
		throw new Error('GEMINI_API_KEY is missing or invalid. Configure a valid API key to generate questions.');
	}

	try {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ parts: [{ text: buildPrompt({ role, difficulty, count: safeCount }) }] }],
				generationConfig: {
					temperature: 0.7,
					topP: 0.9,
					responseMimeType: 'application/json',
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`Gemini API failed with status ${response.status}`);
		}

		const payload = await response.json();
		const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
		if (!text) {
			throw new Error('Gemini API returned empty content');
		}

		const parsed = parseJsonResponse(text);
		const aiQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
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
