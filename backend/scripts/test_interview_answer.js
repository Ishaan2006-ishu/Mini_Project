require('dotenv').config();
const { evaluateInterviewAnswer } = require('./services/interviewAI.service');

(async () => {
  try {
    const response = await evaluateInterviewAnswer({
      role: 'Frontend Developer',
      level: 'Junior',
      conversationHistory: [
        { role: 'system', content: 'You are a professional interviewer.' },
        { role: 'assistant', content: 'What is your experience with React and frontend development?' },
        { role: 'user', content: 'I have built a few React apps using hooks and context.' },
      ],
      userAnswer: 'I have used hooks extensively for state and effects, and I have built reusable components.',
      questionNumber: 2,
      totalQuestions: 5,
      isLast: false,
    });
    console.log('AI response:', response);
  } catch (err) {
    console.error('ERROR:', err.message);
    console.error('ERR STATUS:', err.statusCode || err?.status || err?.response?.status);
    if (err.response?.data) console.error('RESPONSE DATA:', err.response.data);
    console.error(err.stack);
    process.exit(1);
  }
})();
