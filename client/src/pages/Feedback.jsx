import { useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

const FeedBack = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [result, setResult]   = useState(state?.result || null)
  const [loading, setLoading] = useState(!result)
  const [open, setOpen]       = useState(null)

  useEffect(() => {
    if (!result) {
      sessionAPI.getSession(id)
        .then(r => setResult(r.data.session))
        .catch(() => navigate('/history'))
        .finally(() => setLoading(false))
    }
  }, [])

  if (loading) return <Loader text="Loading feedback..." />
  if (!result) return null

  const s = result.overallScore || 0
  const scoreColor = s >= 7 ? 'text-green-600' : s >= 5 ? 'text-yellow-600' : 'text-red-500'
  const scoreBg    = s >= 7 ? 'border-green-200 bg-green-50' : s >= 5 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Score Banner */}
        <div className={`card border-2 text-center mb-6 ${scoreBg}`}>
          <div className={`text-5xl font-bold mb-1 ${scoreColor}`}>{s}/10</div>
          <p className="font-semibold text-gray-800 mb-1">Overall Score</p>
          <div className="flex justify-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{result.role}</span>
            <span>·</span>
            <span className="capitalize">{result.difficulty}</span>
          </div>
        </div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-lg">💪</span>
              <h3 className="font-semibold text-sm text-gray-900">Strengths</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{result.strengths || 'Not available'}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-lg">📈</span>
              <h3 className="font-semibold text-sm text-gray-900">Areas to Improve</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{result.improvements || 'Not available'}</p>
          </div>
        </div>

        {/* Per Question */}
        <h2 className="text-base font-bold text-gray-900 mb-3">Question-by-Question Feedback</h2>
        <div className="space-y-3 mb-8">
          {(result.questions || []).map((q, i) => (
            <div key={i} className="card p-4 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm font-medium text-gray-800 leading-snug">{q.question}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-bold text-base ${q.score >= 7 ? 'text-green-600' : q.score >= 5 ? 'text-yellow-600' : 'text-red-500'}`}>{q.score ?? '—'}/10</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-gray-400 transition-transform ${open === i ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              {open === i && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Your Answer</p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3">
                      {q.userAnswer || <span className="italic text-gray-400">No answer provided</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">AI Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50 rounded-xl p-3">{q.feedback || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/role-select')} className="btn-primary flex-1">Practice Again →</button>
          <button onClick={() => navigate('/history')} className="btn-secondary flex-1">View History</button>
        </div>
      </div>
    </div>
  )
}
export default FeedBack