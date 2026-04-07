import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sessionAPI.getHistory()
      .then(r => setHistory(r.data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const total = history.length
  const avg   = total ? (history.reduce((a, s) => a + (s.overallScore || 0), 0) / total).toFixed(1) : null
  const best  = total ? Math.max(...history.map(s => s.overallScore || 0)) : null
  const recent = history.slice(0, 5)

  const diffColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }
  const typeColor = { practice: 'bg-emerald-100 text-emerald-700', interview: 'bg-indigo-100 text-indigo-700' }
  const getSessionType = (session) => (session?.type === 'practice' ? 'practice' : 'interview')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Greeting */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-gray-900">
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total === 0 ? "You haven't started any sessions yet. Let's begin!" : `You've completed ${total} session${total > 1 ? 's' : ''} so far.`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {[
            { icon: '📋', label: 'Total Sessions',  value: total },
            { icon: '⭐', label: 'Average Score',   value: avg  ? `${avg}/10`  : '—' },
            { icon: '🏆', label: 'Best Score',      value: best ? `${best}/10` : '—' },
            { icon: '💼', label: 'Roles Practised', value: [...new Set(history.map(s => s.role))].length },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative bg-indigo-600 rounded-2xl p-6 mb-4 overflow-hidden shadow-lg shadow-indigo-600/20">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-base mb-1">Ready for your next interview?</h2>
              <p className="text-white/70 text-sm">Select a role — AI generates fresh questions just for you.</p>
            </div>
            <button onClick={() => navigate('/role-select')}
              className="flex-shrink-0 bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-sm">
              Start Interview →
            </button>
          </div>
        </div>

        {/* Practice Test CTA */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-7 overflow-hidden shadow-lg shadow-teal-500/20">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-12 top-4 w-12 h-12 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-base mb-1">Take a Practice Test (MCQs)</h2>
              <p className="text-white/80 text-sm">Test your knowledge with AI-generated multiple choice questions.</p>
            </div>
            <button onClick={() => navigate('/practice-select')}
              className="flex-shrink-0 bg-white text-teal-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors whitespace-nowrap shadow-sm">
              Start Practice →
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Recent Sessions</h2>
          {history.length > 5 && (
            <button onClick={() => navigate('/history')} className="text-sm text-indigo-600 hover:underline font-medium">View all →</button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-700 font-semibold mb-1">No sessions yet</p>
            <p className="text-sm text-gray-400 mb-5">Start your first mock interview to see results here.</p>
            <button onClick={() => navigate('/role-select')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              Start now →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(s => (
              <div key={s._id} onClick={() => navigate(`/feedback/${s._id}`)}
                className="card p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold flex-shrink-0 ${
                  s.overallScore >= 7 ? 'bg-green-100 text-green-700' : s.overallScore >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                }`}>
                  <span className="text-base leading-none">{s.overallScore}</span>
                  <span className="text-xs opacity-70">/10</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm capitalize">{s.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge capitalize ${diffColor[s.difficulty] || 'bg-gray-100 text-gray-600'}`}>{s.difficulty}</span>
                    <span className={`badge capitalize ${typeColor[getSessionType(s)]}`}>{getSessionType(s)}</span>
                    <span className="text-xs text-gray-400">{new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default Dashboard