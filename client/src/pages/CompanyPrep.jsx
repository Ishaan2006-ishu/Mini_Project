import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { companyAPI } from '../services/api'

const levelColor = {
  Entry:  'bg-emerald-100 text-emerald-700',
  Mid:    'bg-indigo-100 text-indigo-700',
  Senior: 'bg-purple-100 text-purple-700',
}

const CompanyPrep = () => {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadCompanies = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await companyAPI.getCompanies()
        if (!mounted) return
        setCompanies(Array.isArray(data?.companies) ? data.companies : [])
      } catch (err) {
        if (!mounted) return
        setError(err.response?.data?.message || 'Failed to load companies. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCompanies()

    return () => {
      mounted = false
    }
  }, [])

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSchedule = (company, role) => {
    navigate('/premium', {
      state: {
        company: company.name,
        role: role.title,
        level: role.level,
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-bold text-gray-900">Company-wise Prep</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pick a company and role — get targeted AI interview questions and schedule a mock session.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          />
        </div>

        {/* Premium Banner */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-300 text-sm">⭐</span>
              <span className="text-white font-bold text-sm">Premium Feature</span>
            </div>
            <p className="text-white/75 text-sm">
              Unlock scheduled interviews, company-specific AI questions, and detailed feedback reports.
            </p>
          </div>
          <button
            onClick={() => navigate('/premium')}
            className="flex-shrink-0 bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap shadow-sm"
          >
            Upgrade to Premium →
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading companies...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No companies found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(company => (
              <div
                key={company.id}
                className={`card bg-white rounded-2xl border ${company.border} overflow-hidden transition-all hover:shadow-md`}
              >
                {/* Company Header */}
                <div className={`bg-gradient-to-br ${company.color} px-5 pt-5 pb-4 border-b ${company.border}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">
                      {company.logo}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{company.name}</h2>
                      <p className="text-xs text-gray-500">{company.roles.length} roles available</p>
                    </div>
                  </div>
                </div>

                {/* Roles */}
                <div className="divide-y divide-gray-50">
                  {(expanded === company.id ? company.roles : company.roles.slice(0, 2)).map((role, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{role.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor[role.level]}`}>
                            {role.level}
                          </span>
                          <span className="text-xs text-gray-400">{role.questions} questions</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSchedule(company, role)}
                        className="flex-shrink-0 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Schedule →
                      </button>
                    </div>
                  ))}
                </div>

                {/* Show more / less */}
                {company.roles.length > 2 && (
                  <button
                    onClick={() => setExpanded(expanded === company.id ? null : company.id)}
                    className="w-full text-xs text-indigo-500 hover:text-indigo-700 font-medium py-2.5 border-t border-gray-50 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                  >
                    {expanded === company.id
                      ? '▲ Show less'
                      : `▼ Show ${company.roles.length - 2} more role${company.roles.length - 2 > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyPrep