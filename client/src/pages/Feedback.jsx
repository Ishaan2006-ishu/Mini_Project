import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { sessionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const FeedBack = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(state?.result || null);
  const [loading, setLoading] = useState(!state?.result);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'questions'

  // ── Fetch from API if no state (refresh-safe) ──────────────────────────────
  useEffect(() => {
    if (result) return;
    setLoading(true);
    sessionAPI
      .getSession(id)
      .then((r) => setResult(r.data.session))
      .catch(() => setError('Session not found or you are not authorised.'))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) return <Loader text="Loading feedback..." />;

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Unable to load feedback</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate('/history')} className="btn-primary">
            Go to History
          </button>
        </div>
      </div>
    );

  if (!result) return null;

  // ── Derived values ─────────────────────────────────────────────────────────
  const score = Number(result.overallScore ?? 0);
  const questions = Array.isArray(result.questions) ? result.questions : [];
  const total = questions.length;
  const correct = questions.filter((q) => q.isCorrect).length;
  const incorrect = total - correct;
  const unanswered = questions.filter((q) => !q.userAnswer).length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;

  const getGrade = (pct) => {
    if (pct >= 90) return { grade: 'A+', label: 'Excellent!', emoji: '🏆' };
    if (pct >= 75) return { grade: 'A',  label: 'Great job!', emoji: '🎉' };
    if (pct >= 60) return { grade: 'B',  label: 'Good effort', emoji: '👍' };
    if (pct >= 40) return { grade: 'C',  label: 'Keep practising', emoji: '📚' };
    return           { grade: 'D',  label: 'Needs improvement', emoji: '💪' };
  };

  const { grade, label, emoji } = getGrade(percentage);

  const scoreStyle =
    percentage >= 75
      ? { ring: 'border-green-400',  bg: 'bg-green-50',  text: 'text-green-600',  badge: 'bg-green-100 text-green-700' }
      : percentage >= 50
      ? { ring: 'border-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700' }
      : { ring: 'border-red-400',    bg: 'bg-red-50',    text: 'text-red-600',    badge: 'bg-red-100 text-red-700' };

  const getQuestionText = (q) => q?.questionText || q?.question || 'Question';
  const getDisplayAnswer = (q) => {
    if (!q.userAnswer) return null;
    if (!Array.isArray(q.options)) return q.userAnswer;
    const matched = q.options.find((o) => o.startsWith(q.userAnswer + '.'));
    return matched || q.userAnswer;
  };

  const diffBadge = {
    easy:   'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard:   'bg-red-100 text-red-700',
  };

  const completedDate = result.completedAt
    ? new Date(result.completedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to History
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Session Results</h1>
            <span className={`badge capitalize ${diffBadge[result.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {result.difficulty}
            </span>
            <span className="badge capitalize bg-indigo-100 text-indigo-700">
              {result.type || 'practice'}
            </span>
            {result.company && (
              <span className="badge capitalize bg-purple-100 text-purple-700">
                {result.company}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">{result.role}</p>
          {completedDate && (
            <p className="text-xs text-gray-400 mt-0.5">Completed · {completedDate}</p>
          )}
        </div>

        {/* ── Score hero card ── */}
        <div className={`card border-2 ${scoreStyle.ring} ${scoreStyle.bg} mb-6 text-center py-8`}>
          <div className="text-5xl mb-2">{emoji}</div>
          <div className={`text-6xl font-black ${scoreStyle.text} mb-1`}>{percentage}%</div>
          <div className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${scoreStyle.badge} mb-3`}>
            Grade {grade} · {label}
          </div>
          <p className="text-gray-500 text-sm">
            {correct} correct out of {total} questions · Score {score}/10
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '✅', value: correct,   label: 'Correct',   color: 'text-green-600'  },
            { icon: '❌', value: incorrect, label: 'Incorrect', color: 'text-red-500'    },
            { icon: '⬜', value: unanswered,label: 'Skipped',   color: 'text-gray-400'   },
          ].map(({ icon, value, label, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {['overview', 'questions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'overview' ? '📊 Overview' : `📝 Questions (${total})`}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">

            {/* Performance bar */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Correct Answers', value: correct,   total, color: 'bg-green-500' },
                  { label: 'Incorrect',        value: incorrect, total, color: 'bg-red-400'   },
                  { label: 'Skipped',          value: unanswered,total, color: 'bg-gray-300'  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{label}</span>
                      <span className="font-semibold">{value} / {total}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{ width: total ? `${(value / total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session info */}
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Session Details</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {[
                  { label: 'Role',       value: result.role },
                  { label: 'Difficulty', value: result.difficulty },
                  { label: 'Type',       value: result.type || 'practice' },
                  { label: 'Questions',  value: total },
                  ...(result.company ? [{ label: 'Company', value: result.company }] : []),
                  ...(result.durationMinutes ? [{ label: 'Duration', value: `${result.durationMinutes} min` }] : []),
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-gray-400 text-xs uppercase tracking-wide block">{label}</span>
                    <span className="font-semibold text-gray-800 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational tip */}
            <div className="card p-5 bg-indigo-50 border border-indigo-200">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-indigo-900 mb-1">
                    {percentage >= 75 ? 'Keep up the great work!' : 'Room to grow!'}
                  </h3>
                  <p className="text-sm text-indigo-700 leading-relaxed">
                    {percentage >= 75
                      ? 'You are performing well. Review the questions you missed to push towards a perfect score.'
                      : 'Review the incorrect answers below — understanding why you got them wrong is the fastest way to improve.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUESTIONS TAB ── */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            {questions.map((q, i) => {
              const isOpen = open === i;
              const display = getDisplayAnswer(q);
              const correctOption = Array.isArray(q.options)
                ? q.options.find((o) => o.startsWith(q.correctAnswer + '.'))
                : q.correctAnswer;

              return (
                <div
                  key={i}
                  className={`card overflow-hidden border-l-4 ${
                    q.isCorrect
                      ? 'border-l-green-400'
                      : q.userAnswer
                      ? 'border-l-red-400'
                      : 'border-l-gray-300'
                  }`}
                >
                  {/* Question header — always visible */}
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Status icon */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                          q.isCorrect
                            ? 'bg-green-100 text-green-600'
                            : q.userAnswer
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {q.isCorrect ? '✓' : q.userAnswer ? '✗' : '—'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">Q{i + 1}</p>
                        <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
                          {getQuestionText(q)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {q.isCorrect ? '+10' : '0'}
                      </span>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-4">

                      {/* Full question */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                          Question
                        </p>
                        <p className="text-sm text-gray-800 leading-relaxed">{getQuestionText(q)}</p>
                      </div>

                      {/* All options */}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Options
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, oi) => {
                              const letter = String.fromCharCode(65 + oi);
                              const isCorrectOpt = letter === q.correctAnswer;
                              const isUserOpt = letter === q.userAnswer;
                              return (
                                <div
                                  key={oi}
                                  className={`px-3 py-2 rounded-lg text-sm border ${
                                    isCorrectOpt
                                      ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                                      : isUserOpt && !isCorrectOpt
                                      ? 'bg-red-50 border-red-300 text-red-800'
                                      : 'bg-gray-50 border-gray-200 text-gray-600'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {opt}
                                    {isCorrectOpt && (
                                      <span className="ml-auto text-xs text-green-600 font-bold">✓ Correct</span>
                                    )}
                                    {isUserOpt && !isCorrectOpt && (
                                      <span className="ml-auto text-xs text-red-500 font-bold">✗ Your answer</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Your answer vs correct */}
                      {!Array.isArray(q.options) && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                              Your Answer
                            </p>
                            <p className={`text-sm font-medium ${q.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                              {display || <span className="italic text-gray-400">No answer</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                              Correct Answer
                            </p>
                            <p className="text-sm font-medium text-green-700">
                              {correctOption || q.correctAnswer}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {(q.explanation || q.feedback) && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">
                            Explanation
                          </p>
                          <p className="text-sm text-indigo-800 leading-relaxed">
                            {q.explanation || q.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── CTA buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            type="button"
            onClick={() => navigate('/practice-select')}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            🔄 Practice Again
          </button>
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            📋 View History
          </button>
        </div>

      </div>
    </div>
  );
};

export default FeedBack;