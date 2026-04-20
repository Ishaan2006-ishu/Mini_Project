import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interviewAPI, sessionAPI } from '../services/api';
import toast from 'react-hot-toast';

const LEVELS = [
  {
    id: 'fresher',
    label: 'Fresher',
    icon: '🌱',
    desc: 'No experience or < 1 year',
    detail: '5 questions · Basic concepts · Entry level',
    color: 'border-emerald-400 bg-emerald-50',
    active: 'border-emerald-500 bg-emerald-500 text-white',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'junior',
    label: 'Junior',
    icon: '🚀',
    desc: '1–3 years experience',
    detail: '8 questions · Practical scenarios · Mid level',
    color: 'border-indigo-300 bg-indigo-50',
    active: 'border-indigo-500 bg-indigo-500 text-white',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'senior',
    label: 'Senior',
    icon: '⚡',
    desc: '3+ years experience',
    detail: '10 questions · System design · Advanced',
    color: 'border-purple-300 bg-purple-50',
    active: 'border-purple-500 bg-purple-500 text-white',
    badge: 'bg-purple-100 text-purple-700',
  },
];

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [roles, setRoles]       = useState([]);
  const [role, setRole]         = useState('');
  const [level, setLevel]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    sessionAPI.getRoles()
      .then(r => setRoles(Array.isArray(r.data.roles) ? r.data.roles : []))
      .catch(() => toast.error('Failed to load roles'))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async () => {
    if (!role)  return toast.error('Please select a role');
    if (!level) return toast.error('Please select your experience level');
    setStarting(true);
    try {
      const { data } = await interviewAPI.start({ role, level });
      if (!data?.success) throw new Error(data?.message || 'Failed to start interview');
      navigate(`/live-interview/${data.session.id}`, {
        state: { session: data.session, firstQuestion: data.firstQuestion },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  const selectedLevel = LEVELS.find(l => l.id === level);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            🎤 Live AI Interview
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Interview</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI interviewer listens to your answers and asks follow-up questions — just like a real interview.
          </p>
        </div>

        {/* Step 1 — Role */}
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
            Select Job Role
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {roles.map(r => {
                const label = typeof r === 'string' ? r : r?.name;
                return (
                  <button
                    key={label}
                    onClick={() => setRole(label)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 text-left capitalize transition-all ${
                      role === label
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2 — Level */}
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
            Select Experience Level
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  level === l.id ? l.active : l.color + ' hover:opacity-90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${level === l.id ? 'text-white' : 'text-gray-900'}`}>
                        {l.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        level === l.id ? 'bg-white/20 text-white' : l.badge
                      }`}>
                        {l.desc}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${level === l.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {l.detail}
                    </p>
                  </div>
                  {level === l.id && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="card p-4 mb-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-sm font-bold text-indigo-900 mb-2">🧠 How the AI Interview works</h3>
          <ul className="space-y-1.5 text-xs text-indigo-800">
            {[
              '🎤 AI asks a question — you speak your answer aloud (or type)',
              '🔊 AI listens, understands, and asks a smart follow-up',
              '🧠 AI remembers everything said — just like a real interviewer',
              '📊 At the end, get a detailed score with category-wise feedback',
            ].map(tip => (
              <li key={tip} className="flex items-start gap-1.5">
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!role || !level || starting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-indigo-600/20"
        >
          {starting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing your interview...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🎤 Start Live Interview
              {role && selectedLevel && (
                <span className="text-white/70 font-normal text-sm">
                  · {role} · {selectedLevel.label}
                </span>
              )}
            </span>
          )}
        </button>

      </div>
    </div>
  );
};

export default InterviewSetup;