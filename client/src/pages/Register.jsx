import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email || !/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await authAPI.register({ name: form.name.trim(), email: form.email, password: form.password })
      toast.success('OTP sent to your email!')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center px-14 bg-indigo-600 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <span className="text-white font-bold text-xl">MockMate Pro</span>
          </div>
          <h1 className="text-white font-bold text-4xl leading-tight mb-4">Start practising<br/>smarter.</h1>
          <p className="text-white/70 text-sm leading-relaxed mb-10">Create your free account and begin preparing for your dream job with AI-powered mock interviews.</p>
          {['Free account forever', 'AI questions for 10+ roles', 'Instant answer scoring', 'Session history & analytics'].map(f => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <span className="text-white/85 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-7">Join MockMate Pro — it's free.</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input className={`input-field ${errors.name ? 'input-error' : ''}`} type="text"
                placeholder="Your full name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input className={`input-field ${errors.email ? 'input-error' : ''}`} type="email"
                placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                  type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input className={`input-field ${errors.confirm ? 'input-error' : ''}`}
                type="password" placeholder="Re-enter password" value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })} />
              {errors.confirm && <p className="text-xs text-red-500 mt-1">{errors.confirm}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary !mt-6">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default Register