import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { sessionAPI, paymentAPI } from '../services/api'
import Navbar from '../components/Navbar'
import Loader from '../components/Loader'

const History = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [sessions, setSessions] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]     = useState('all')
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'sessions') // 'sessions' or 'transactions'

  const fetchTransactions = async () => {
    try {
      const transactionsRes = await paymentAPI.getTransactionHistory()
      setTransactions(transactionsRes.data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleRefreshTransactions = async () => {
    setRefreshing(true)
    await fetchTransactions()
    setRefreshing(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsRes, transactionsRes] = await Promise.all([
          sessionAPI.getHistory(),
          paymentAPI.getTransactionHistory(),
        ])
        setSessions(sessionsRes.data.sessions || [])
        setTransactions(transactionsRes.data.transactions || [])
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Loader />

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.difficulty === filter)
  const dc = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' }
  const tc = { practice: 'bg-emerald-100 text-emerald-700', interview: 'bg-indigo-100 text-indigo-700' }
  const getSessionType = (session) => (session?.type === 'practice' ? 'practice' : 'interview')

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">History</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeTab === 'sessions' 
                ? `${sessions.length} completed sessions` 
                : `${transactions.length} transactions`}
            </p>
          </div>
          {activeTab === 'sessions' && (
            <button onClick={() => navigate('/role-select')}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
              + New Session
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'sessions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <>
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
                        <span className={`badge capitalize ${tc[getSessionType(s)]}`}>{getSessionType(s)}</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(s.completedAt)}
                        </span>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            <div className="mb-5 flex justify-end">
              <button
                onClick={handleRefreshTransactions}
                disabled={refreshing}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshing ? 'animate-spin' : ''}>
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M3 8h8v8"/>
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            {transactions.length === 0 ? (
              <div className="card py-12 text-center">
                <div className="text-4xl mb-3">💳</div>
                <p className="text-gray-500 text-sm">No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => (
                  <div key={t._id}
                    className="card p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{t.planName}</h3>
                          <span className={`badge capitalize text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(t.status)}`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Transaction ID</p>
                            <p className="font-mono text-xs font-semibold">{t.razorpayPaymentId || 'Pending'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                            <p className="font-semibold">{t.planPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Plan Period</p>
                            <p className="font-semibold">{t.planPeriod}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Date & Time</p>
                            <p className="text-xs">{formatDate(t.createdAt)} {formatTime(t.createdAt)}</p>
                          </div>
                        </div>
                        {t.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            Error: {t.errorMessage}
                          </div>
                        )}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Order ID: <span className="font-mono text-gray-700">{t.razorpayOrderId}</span></p>
                          
                          {/* Action Buttons */}
                          {t.status === 'pending' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await paymentAPI.cancelTransaction(t._id)
                                    await handleRefreshTransactions()
                                  } catch (err) {
                                    console.error('Error cancelling transaction:', err)
                                  }
                                }}
                                className="flex-1 px-2 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                          {t.status === 'failed' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  navigate('/premium')
                                }}
                                className="flex-1 px-2 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                              >
                                Retry Payment
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        t.status === 'success' ? 'bg-green-100' : t.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        {t.status === 'success' ? '✓' : t.status === 'failed' ? '✕' : '⏳'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
export default History