import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const DIFF_STYLES = {
  easy: 'border-green-400 bg-green-50 text-green-700',
  medium: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  hard: 'border-red-400 bg-red-50 text-red-700',
}

const RoleSelect = () => {
  const navigate = useNavigate()
  const [roles, setRoles]     = useState([])
  const [diffs, setDiffs]     = useState([])
  const [counts, setCounts]   = useState([])
  const [role, setRole]       = useState('')
  const [diff, setDiff]       = useState('medium')
  const [count, setCount]     = useState(25)
  const [loading, setLoading] = useState(false)
  const [starting, setStart]  = useState(false)

  const getRoleLabel = (roleOption) =>
    typeof roleOption === 'string' ? roleOption : (roleOption?.name || '')

  useEffect(() => {
    setLoading(true)
    Promise.all([sessionAPI.getRoles(), sessionAPI.getConfig()])
      .then(([rolesRes, configRes]) => {
        const nextRoles = rolesRes.data.roles || []
        const config = configRes.data?.config || {}
        const nextDiffs = Array.isArray(config.difficulties) ? config.difficulties : []
        const nextCounts = Array.isArray(config.questionCounts) ? config.questionCounts : []

        setRoles(nextRoles)
        setDiffs(nextDiffs)
        setCounts(nextCounts)

        if (config.defaultDifficulty) setDiff(config.defaultDifficulty)
        if (config.defaultQuestionCount) setCount(Number(config.defaultQuestionCount))
      })
      .catch(() => toast.error('Failed to load interview config'))
      .finally(() => setLoading(false))
  }, [])

  const handleStart = async () => {
    if (!role) { toast.error('Please select a job role'); return }
    setStart(true)
    try {
      const res = await sessionAPI.startSession({
        role,
        difficulty: diff,
        count: count,
        type: 'interview',
      })
      toast.success('Questions ready!')
      navigate(`/session/${res.data.session.id}`, {
        state: {
          session: res.data.session,
          selectedCount: count,
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start')
    } finally { setStart(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Configure your interview</h1>
          <p className="text-sm text-gray-500 mt-1">Pick a role and difficulty — AI generates fresh questions instantly.</p>
        </div>

        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">1. Select Job Role</h2>
          {loading
            ? <div className="grid grid-cols-2 gap-2">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            : <div className="grid grid-cols-2 gap-2">
                {roles.map((r, idx) => {
                  const label = getRoleLabel(r)
                  const key = typeof r === 'string' ? r : (r?.slug || `${label}-${idx}`)
                  return (
                  <button key={key} onClick={() => setRole(label)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 text-left capitalize transition-all ${
                      role === label ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                    }`}>{label}
                  </button>
                )})}
              </div>
          }
        </div>

        <div className="card mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">2. Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-3">
            {diffs.map((d) => (
              <button key={d.value} onClick={() => setDiff(d.value)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${diff === d.value ? (DIFF_STYLES[d.value] || 'border-indigo-400 bg-indigo-50 text-indigo-700') : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                <div className="font-semibold text-sm">{d.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{d.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">3. Number of Questions</h2>
          <div className="grid grid-cols-3 gap-3">
            {counts.map((cVal) => (
              <button key={cVal} onClick={() => setCount(cVal)}
                className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  count === cVal ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                }`}>
                {cVal} questions
              </button>
            ))}
          </div>
        </div>

        {role && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 mb-4">
            <p className="text-sm text-indigo-700">
              <span className="font-semibold">{diff}-level</span> interview for <span className="font-semibold capitalize">{role}</span> with <span className="font-semibold">{count} questions</span>
            </p>
          </div>
        )}

        <button onClick={handleStart} disabled={!role || starting} className="btn-primary">
          {starting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating questions...</>
            : 'Start Interview →'
          }
        </button>
      </div>
    </div>
  )
}
export default RoleSelect