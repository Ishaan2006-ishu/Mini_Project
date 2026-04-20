import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const scoreBg = (s) =>
  s >= 7
    ? 'bg-green-100 text-green-700'
    : s >= 5
    ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-600';

const diffBadge = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

const typeBadge = {
  practice: 'bg-emerald-100 text-emerald-700',
  interview: 'bg-indigo-100 text-indigo-700',
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActive] = useState('overview');

  useEffect(() => {
    sessionAPI
      .getHistory()
      .then((r) =>
        setHistory(Array.isArray(r.data.sessions) ? r.data.sessions : [])
      )
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const completed = history.filter((s) => s.completedAt);
  const total = completed.length;

  const avgScore = total
    ? (
        completed.reduce((acc, s) => acc + (s.overallScore || 0), 0) / total
      ).toFixed(1)
    : null;

  const bestScore = total
    ? Math.max(...completed.map((s) => s.overallScore || 0))
    : null;

  const uniqueRoles = [...new Set(history.map((s) => s.role))].length;

  const scoreDist = { excellent: 0, good: 0, average: 0, poor: 0 };
  completed.forEach((s) => {
    const pct = (s.overallScore || 0) * 10;
    if (pct >= 80) scoreDist.excellent++;
    else if (pct >= 60) scoreDist.good++;
    else if (pct >= 40) scoreDist.average++;
    else scoreDist.poor++;
  });

  const roleCounts = {};
  history.forEach((s) => {
    roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
  });
  const topRoles = Object.entries(roleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const diffCounts = { easy: 0, medium: 0, hard: 0 };
  history.forEach((s) => {
    if (diffCounts[s.difficulty] !== undefined) diffCounts[s.difficulty]++;
  });

  const days = [
    ...new Set(completed.map((s) => new Date(s.completedAt).toDateString())),
  ].sort((a, b) => new Date(b) - new Date(a));

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (days[i] === expected.toDateString()) streak++;
    else break;
  }

  const recentSessions = history.slice(0, 6);

  const kpis = [
    { icon: '🎯', label: 'Sessions Done', value: total },
    {
      icon: '📊',
      label: 'Average Score',
      value: avgScore ? avgScore + '/10' : '—',
    },
    {
      icon: '🏆',
      label: 'Best Score',
      value: bestScore !== null ? bestScore + '/10' : '—',
    },
    {
      icon: '🎭',
      label: 'Roles Explored',
      value: uniqueRoles,
    },
    {
      icon: '🔥',
      label: 'Day Streak',
      value: streak || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {greet()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total === 0
                ? 'You have not started any sessions yet. Lets begin!'
                : 'You have completed ' +
                  total +
                  ' session' +
                  (total !== 1 ? 's' : '') +
                  ' so far. Keep it up!'}
            </p>
          </div>

          {user?.isPremium && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 self-start sm:self-auto">
              ⭐ Premium Member
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {kpis.map(({ icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="relative bg-indigo-600 rounded-2xl p-5 mb-6 overflow-hidden shadow-lg">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-base mb-1">
                Ready for your next session?
              </h2>
              <p className="text-white/70 text-sm">
                Select a role and start practice or interview instantly.
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/practice-select')}
                className="bg-white text-indigo-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-sm"
              >
                🧪 Practice
              </button>

              <button
                onClick={() => navigate('/interview-setup')}
                className="bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-indigo-400 transition-colors border border-white/20"
              >
                🎤 Interview
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          {[
            { id: 'overview', label: '📊 Overview' },
            {
              id: 'recent',
              label: '🕑 Recent Sessions (' + recentSessions.length + ')',
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={
                'flex-1 py-2 text-sm font-semibold rounded-lg transition-all ' +
                (activeTab === t.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Score Distribution
              </h3>

              {total === 0 ? (
                <p className="text-sm text-gray-400 italic">No sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    {
                      label: 'Excellent (80-100%)',
                      count: scoreDist.excellent,
                      color: 'bg-green-500',
                    },
                    {
                      label: 'Good (60-79%)',
                      count: scoreDist.good,
                      color: 'bg-blue-500',
                    },
                    {
                      label: 'Average (40-59%)',
                      count: scoreDist.average,
                      color: 'bg-yellow-400',
                    },
                    {
                      label: 'Poor (0-39%)',
                      count: scoreDist.poor,
                      color: 'bg-red-400',
                    },
                  ].map(({ label, count, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{label}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={'h-full rounded-full transition-all duration-700 ' + color}
                          style={{ width: total ? (count / total) * 100 + '%' : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Difficulty Split
              </h3>

              {history.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No sessions yet.</p>
              ) : (
                <div className="space-y-3">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <div key={d}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span className="capitalize">{d}</span>
                        <span className="font-semibold">{diffCounts[d]} sessions</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={
                            'h-full rounded-full transition-all duration-700 ' +
                            (d === 'easy'
                              ? 'bg-green-400'
                              : d === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-red-400')
                          }
                          style={{
                            width: history.length
                              ? (diffCounts[d] / history.length) * 100 + '%'
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Top Roles Practised
              </h3>

              {topRoles.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No sessions yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {topRoles.map(([role, count]) => (
                    <div key={role} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                        {role.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate capitalize">
                          {role}
                        </p>
                        <p className="text-xs text-gray-400">
                          {count} session{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: topRoles[0][1]
                              ? (count / topRoles[0][1]) * 100 + '%'
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <h3 className="text-sm font-bold text-indigo-900 mb-3">
                💡 Quick Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  { tip: 'Practise daily to build a streak 🔥', done: streak > 0 },
                  { tip: 'Try Hard difficulty to level up', done: diffCounts.hard > 0 },
                  {
                    tip: 'Try an Interview mode session',
                    done: history.some((s) => s.type === 'interview'),
                  },
                  { tip: 'Aim for 80%+ in every session', done: scoreDist.excellent > 0 },
                ].map(({ tip, done }) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-indigo-800">
                    <span
                      className={
                        'flex-shrink-0 mt-0.5 ' +
                        (done ? 'text-green-500' : 'text-indigo-300')
                      }
                    >
                      {done ? '✓' : '○'}
                    </span>
                    <span className={done ? 'line-through text-indigo-400' : ''}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div>
            {recentSessions.length === 0 ? (
              <div className="card py-16 text-center">
                <div className="text-5xl mb-3">📭</div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No sessions yet
                </h3>
                <p className="text-sm text-gray-500 mb-5">
                  Start your first session to see it here.
                </p>
                <button
                  onClick={() => navigate('/practice-select')}
                  className="btn-primary inline-flex"
                >
                  Start First Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => navigate('/feedback/' + s._id)}
                    className="card p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div
                      className={
                        'w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold flex-shrink-0 ' +
                        scoreBg(s.overallScore || 0)
                      }
                    >
                      <span className="text-base leading-none">
                        {s.overallScore || 0}
                      </span>
                      <span className="text-xs opacity-70">/10</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm capitalize truncate">
                        {s.role}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className={
                            'badge capitalize ' +
                            (diffBadge[s.difficulty] || 'bg-gray-100 text-gray-600')
                          }
                        >
                          {s.difficulty}
                        </span>
                        <span
                          className={
                            'badge capitalize ' +
                            (typeBadge[s.type] || 'bg-gray-100 text-gray-600')
                          }
                        >
                          {s.type || 'practice'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {fmtDate(s.completedAt || s.createdAt)}
                        </span>
                      </div>
                    </div>

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-300 flex-shrink-0"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                ))}

                {history.length > 6 && (
                  <button
                    onClick={() => navigate('/history')}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 text-center transition-colors"
                  >
                    {'View all ' + history.length + ' sessions →'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;