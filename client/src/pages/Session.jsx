import { useState } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const Session = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const session = state?.session
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSub]  = useState(false)

  if (!session) { navigate('/role-select'); return null }

  const qs = session.questions || []
  const q  = qs[current]

  const handleSubmit = async () => {
    const allDone = qs.every(q => answers[q.questionId]?.trim())
    if (!allDone) { toast.error('Please answer all questions before submitting'); return }
    setSub(true)
    try {
      const arr = qs.map(q => ({ questionId: q.questionId, userAnswer: answers[q.questionId] || '' }))
      const res = await sessionAPI.submitSession(id, arr)
      toast.success('AI is evaluating your answers...')
      navigate(`/feedback/${id}`, { state: { result: res.data.result } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setSub(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider capitalize">{session.role}</p>
            <h1 className="text-base font-bold text-gray-900">Question {current + 1} of {qs.length}</h1>
          </div>
          <span className={`badge capitalize ${session.difficulty === 'easy' ? 'bg-green-100 text-green-700' : session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {session.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${((current) / qs.length) * 100}%` }} />
        </div>

        {/* Question card */}
        <div className="card mb-4">
          <div className="flex gap-3 mb-5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              {current + 1}
            </div>
            <p className="text-gray-900 font-semibold leading-relaxed">{q?.question}</p>
          </div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your Answer</label>
          <textarea rows={6}
            value={answers[q?.questionId] || ''}
            onChange={e => setAnswers({ ...answers, [q.questionId]: e.target.value })}
            placeholder="Write a detailed answer. The AI evaluates based on accuracy, depth, and clarity."
            className="w-full px-3.5 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all" />
          <p className="text-xs text-gray-400 mt-1.5 text-right">{(answers[q?.questionId] || '').length} characters</p>
        </div>

        {/* Dots */}
        <div className="flex gap-1.5 justify-center mb-5">
          {qs.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-indigo-600' : answers[qs[i]?.questionId] ? 'w-2 bg-indigo-300' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} className="btn-secondary flex-1">← Previous</button>
          )}
          {current < qs.length - 1 ? (
            <button onClick={() => {
              if (!answers[q?.questionId]?.trim()) { toast.error('Please write an answer first'); return }
              setCurrent(c => c + 1)
            }} className="btn-primary flex-1">Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Evaluating...</>
                : '✓ Submit & Get Feedback'
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default Session