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
  const durationMinutes = session.durationMinutes || state?.selectedDuration || null
  const progressPercent = qs.length ? (current / qs.length) * 100 : 0
  const getQuestionId = (question) => question?.questionId || question?._id
  const getQuestionText = (question) => question?.questionText || question?.question || ''
  const getOptions = (question) => Array.isArray(question?.options) ? question.options : []

  const handleSubmit = async () => {
    const allDone = qs.every((question) => {
      const questionId = getQuestionId(question)
      return questionId && answers[questionId]
    })
    if (!allDone) { toast.error('Please answer all questions before submitting'); return }
    setSub(true)
    try {
      const arr = qs.map((question) => {
        const questionId = getQuestionId(question)
        return { questionId, userAnswer: answers[questionId] || '' }
      })
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
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{session.role}</p>
            <h1 className="text-base font-bold text-gray-900">Question {current + 1} of {qs.length}</h1>
            {durationMinutes && (
              <p className="text-xs text-gray-500 mt-1">Planned duration: {durationMinutes} minutes</p>
            )}
          </div>
          <span className={`badge capitalize ${session.difficulty === 'easy' ? 'bg-green-100 text-green-700' : session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {session.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }} />
        </div>

        {qs.length === 0 && (
          <div className="card mb-4">
            <p className="text-sm text-gray-600">Questions are not available for this session yet. Please start a new practice test.</p>
          </div>
        )}

        {/* Question card */}
        {qs.length > 0 && (<div className="card mb-4">
          <div className="flex gap-3 mb-5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
              {current + 1}
            </div>
            <p className="text-gray-900 font-semibold leading-relaxed">{getQuestionText(q)}</p>
          </div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Choose One Option</label>
          <div className="space-y-2.5">
            {getOptions(q).map((option, optionIdx) => {
              const qid = getQuestionId(q)
              const isSelected = answers[qid] === option
              return (
                <button
                  key={`${option}-${optionIdx}`}
                  type="button"
                  onClick={() => setAnswers({ ...answers, [qid]: option })}
                  className={`w-full text-left px-3.5 py-3 rounded-xl border text-sm transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 bg-white text-gray-800 hover:border-indigo-300'
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>)}

        {/* Dots */}
        {qs.length > 0 && (<div className="flex gap-1.5 justify-center mb-5">
          {qs.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current
                  ? 'w-6 bg-indigo-600'
                  : answers[getQuestionId(qs[i])] ? 'w-2 bg-indigo-300' : 'w-2 bg-gray-300'
              }`} />
          ))}
        </div>)}

        {/* Navigation */}
        {qs.length > 0 && (<div className="flex gap-3">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} className="btn-secondary flex-1">← Previous</button>
          )}
          {current < qs.length - 1 ? (
            <button onClick={() => {
              const qid = getQuestionId(q)
              if (!answers[qid]) { toast.error('Please select an option first'); return }
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
        </div>)}
      </div>
    </div>
  )
}
export default Session