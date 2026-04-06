import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

const History = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    sessionAPI.getHistory()
      .then(r => setSessions(r.data.sessions || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.difficulty === filter)
  const dc = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Session History</h1>
            <p className="text-sm text-gray-500 mt-0.5">{sessions.length} completed sessions</p>
          </div>
          <button onClick={() => navigate('/role-select')}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            + New Session
          </button>
        </div>

        <div className="flex gap-2 mb-5">
          {['all', 'easy', 'medium', 'hard'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}>{f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-500 text-sm">No sessions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => (
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
                    <span className={`badge capitalize ${dc[s.difficulty] || 'bg-gray-100 text-gray-600'}`}>{s.difficulty}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
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
export default History