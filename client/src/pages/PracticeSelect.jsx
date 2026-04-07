import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const DIFFS = [
  { v: 'easy',   label: 'Easy',   desc: 'Beginner level',     c: 'border-green-400 bg-green-50 text-green-700'    },
  { v: 'medium', label: 'Medium', desc: 'Intermediate level', c: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { v: 'hard',   label: 'Hard',   desc: 'Advanced level',     c: 'border-red-400 bg-red-50 text-red-700'          },
]

const COUNTS = [20, 25, 30]

const PracticeSelect = () => {
  const navigate = useNavigate()
  const [roles, setRoles]     = useState([])
  const [role, setRole]       = useState('')
  const [diff, setDiff]       = useState('medium')
  const [count, setCount]     = useState(25)
  const [loading, setLoading] = useState(false)
  const [starting, setStart]  = useState(false)

  const getRoleLabel = (roleOption) =>
    typeof roleOption === 'string' ? roleOption : (roleOption?.name || '')

  useEffect(() => {
    setLoading(true)
    sessionAPI.getRoles()
      .then(r => setRoles(r.data.roles || []))
      .catch(() => toast.error('Failed to load roles'))
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
        type: 'practice'
      })
      toast.success('Practice questions ready!')
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
          <h1 className="text-xl font-bold text-gray-900">Configure your practice test</h1>
          <p className="text-sm text-gray-500 mt-1">Pick a role and difficulty — AI generates fresh MCQs instantly.</p>
        </div>

        <div className="card mb-4 border-teal-100">
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
                      role === label ? 'border-teal-500 bg-teal-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                    }`}>{label}
                  </button>
                )})}
              </div>
          }
        </div>

        <div className="card mb-4 border-teal-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">2. Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-3">
            {DIFFS.map(d => (
              <button key={d.v} onClick={() => setDiff(d.v)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${diff === d.v ? d.c : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                <div className="font-semibold text-sm">{d.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-6 border-teal-100">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">3. Number of Questions (MCQs)</h2>
          <div className="grid grid-cols-3 gap-3">
            {COUNTS.map((cVal) => (
              <button key={cVal} onClick={() => setCount(cVal)}
                className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  count === cVal ? 'border-teal-500 bg-teal-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300'
                }`}>
                {cVal} questions
              </button>
            ))}
          </div>
        </div>

        {role && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 mb-4">
            <p className="text-sm text-teal-800">
              <span className="font-semibold">{diff}-level</span> practice test for <span className="font-semibold capitalize">{role}</span> with <span className="font-semibold">{count} questions</span>
            </p>
          </div>
        )}

        <button onClick={handleStart} disabled={!role || starting} className="btn-primary w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500">
          {starting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block align-middle mr-2" />Generating questions...</>
            : 'Start Practice Test →'
          }
        </button>
      </div>
    </div>
  )
}
export default PracticeSelect
