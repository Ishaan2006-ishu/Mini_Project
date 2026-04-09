import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [isSecureMode, setIsSecureMode] = useState(Boolean(document.fullscreenElement))
  const [securityViolations, setSecurityViolations] = useState(0)
  const autoSubmittedRef = useRef(false)
  const maxViolations = 3

  const qs = useMemo(() => session?.questions || [], [session])
  const q  = qs[current]
  const durationMinutes = session?.durationMinutes || state?.selectedDuration || null
  const progressPercent = qs.length ? (current / qs.length) * 100 : 0
  const getQuestionId = (question) => question?.questionId || question?._id
  const getQuestionText = (question) => question?.questionText || question?.question || ''
  const getOptions = (question) => Array.isArray(question?.options) ? question.options : []

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
      setIsSecureMode(Boolean(document.fullscreenElement))
      toast.success('Secure fullscreen mode enabled')
    } catch {
      toast.error('Fullscreen permission was denied. Please allow fullscreen to continue the test.')
    }
  }

  useEffect(() => {
    if (!session) {
      navigate('/role-select')
    }
  }, [session, navigate])

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement)
      setIsSecureMode(active)
      if (!active && qs.length > 0) {
        setSecurityViolations((count) => count + 1)
        toast.error('Fullscreen exited. Return to fullscreen to continue the test.')
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden && qs.length > 0) {
        setSecurityViolations((count) => count + 1)
        toast.error('Tab switch detected. This action is logged as a violation.')
      }
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [qs.length])

  const handleSubmit = useCallback(async (forceSubmit = false) => {
    const allDone = qs.every((question) => {
      const questionId = question?.questionId || question?._id
      return questionId && answers[questionId]
    })
    if (!forceSubmit && !allDone) { toast.error('Please answer all questions before submitting'); return }
    setSub(true)
    try {
      const arr = qs.map((question) => {
        const questionId = question?.questionId || question?._id
        return { questionId, userAnswer: answers[questionId] || '' }
      })
      const res = await sessionAPI.submitSession(id, arr)
      toast.success('AI is evaluating your answers...')
      navigate(`/feedback/${id}`, { state: { result: res.data.result } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally { setSub(false) }
  }, [qs, answers, id, navigate])

  useEffect(() => {
    if (securityViolations < maxViolations || submitting || qs.length === 0 || autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    toast.error('Too many security violations. Submitting your test automatically.')
    handleSubmit(true)
  }, [securityViolations, submitting, qs.length, handleSubmit])

  if (!session) return null

  const answeredCount = qs.filter((question) => {
    const questionId = getQuestionId(question)
    return questionId && answers[questionId]
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {!isSecureMode && qs.length > 0 && (
        <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Secure Test Mode</h2>
            <p className="text-sm text-slate-600 mb-4">
              This test runs in fullscreen mode. Exiting fullscreen or switching tabs increases violation count.
            </p>
            <div className="text-xs text-slate-500 mb-5">
              Violations: <span className="font-semibold text-slate-900">{securityViolations}</span> / {maxViolations}
            </div>
            <button type="button" onClick={enterFullscreen} className="btn-primary">
              Enter Fullscreen & Continue
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-6">
          <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{session?.role}</p>
            <h1 className="text-base font-bold text-gray-900">Question {current + 1} of {qs.length}</h1>
            {durationMinutes && (
              <p className="text-xs text-gray-500 mt-1">Planned duration: {durationMinutes} minutes</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Answered: {answeredCount}/{qs.length}</p>
          </div>
          <span className={`badge capitalize ${session?.difficulty === 'easy' ? 'bg-green-100 text-green-700' : session?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {session?.difficulty}
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

        {/* Navigation */}
        {qs.length > 0 && (<div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCurrent(c => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          {current < qs.length - 1 ? (
            <button type="button" onClick={() => {
              const qid = getQuestionId(q)
              if (!answers[qid]) { toast.error('Please select an option first'); return }
              setCurrent(c => c + 1)
            }} className="btn-primary flex-1">Next →</button>
          ) : (
            <button type="button" onClick={() => handleSubmit(false)} disabled={submitting} className="btn-primary flex-1">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Evaluating...</>
                : '✓ Submit & Get Feedback'
              }
            </button>
          )}
        </div>)}

          </div>

          {/* Question palette */}
          {qs.length > 0 && (
            <aside className="mt-6 lg:mt-0">
              <div className="card lg:sticky lg:top-20">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Question Navigator</h2>
                <div className="grid grid-cols-5 gap-2">
                  {qs.map((question, index) => {
                    const qid = getQuestionId(question)
                    const attempted = Boolean(answers[qid])
                    const active = index === current

                    let paletteClass = 'bg-white text-gray-700 border-gray-300'
                    if (attempted) paletteClass = 'bg-green-100 text-green-700 border-green-300'
                    if (active) paletteClass = 'bg-indigo-600 text-white border-indigo-600'

                    return (
                      <button
                        key={qid || index}
                        type="button"
                        onClick={() => setCurrent(index)}
                        className={`h-9 rounded-lg border text-xs font-semibold transition-all ${paletteClass}`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />Attempted</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-white border border-gray-300 mr-2" />Not attempted</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-600 mr-2" />Current question</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
export default Session