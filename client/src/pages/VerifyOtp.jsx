import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email  = state?.email || ''
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [timer, setTimer]     = useState(600)
  const [loading, setLoading] = useState(false)
  const [resending, setRe]    = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (!email) { navigate('/register'); return }
    inputs.current[0]?.focus()
    const id = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [])

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    const d = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (d.length === 6) { setOtp(d.split('')); inputs.current[5]?.focus() }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Please enter all 6 digits'); return }
    setLoading(true)
    try {
      await authAPI.verifyOtp({ email, otp: code })
      toast.success('Email verified! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setRe(true)
    try {
      await authAPI.resendOtp(email)
      setTimer(600); setOtp(['', '', '', '', '', ''])
      toast.success('New OTP sent!')
      inputs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend')
    } finally { setRe(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="card text-center shadow-md">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8">
              <rect x="2" y="4" width="20" height="16" rx="2.5"/>
              <path d="M22 7l-10 7L2 7"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Check your email</h2>
          <p className="text-sm text-gray-500 mb-1">We sent a 6-digit OTP to</p>
          <p className="text-sm font-semibold text-indigo-600 mb-6 truncate">{email}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => inputs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-white focus:outline-none transition-all ${
                    digit ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 focus:border-indigo-500'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs font-medium mb-4 ${timer > 0 ? 'text-gray-500' : 'text-red-500'}`}>
              {timer > 0 ? `Expires in ${fmt(timer)}` : 'OTP expired — please resend'}
            </p>
            <button type="submit" disabled={loading || otp.join('').length < 6} className="btn-primary mb-3">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <button onClick={handleResend} disabled={resending || timer > 540}
            className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
            {resending ? 'Sending...' : "Didn't receive it? Resend"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Wrong email? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Go back</Link>
        </p>
      </div>
    </div>
  )
}
export default VerifyOtp