// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { authAPI } from '../services/api'
// import { useAuth } from '../context/AuthContext'
// import toast from 'react-hot-toast'

// const Login = () => {
//   const navigate = useNavigate()
//   const { login } = useAuth()
//   const [form, setForm]       = useState({ email: '', password: '' })
//   const [errors, setErrors]   = useState({})
//   const [loading, setLoading] = useState(false)
//   const [showPw, setShowPw]   = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const errs = {}
//     if (!form.email)    errs.email    = 'Email is required'
//     if (!form.password) errs.password = 'Password is required'
//     if (Object.keys(errs).length) { setErrors(errs); return }
//     setErrors({})
//     setLoading(true)
//     try {
//       const res = await authAPI.login(form)
      
//       // Extract token from response
//       const token = res?.data?.token || res?.data?.data?.token || res?.data?.accessToken || res?.data?.auth?.token
//       const userData = res?.data?.user || res?.data?.data?.user || res?.data?.profile || null

//       if (!token) {
//         toast.error('Login succeeded but token was not returned by server')
//         setLoading(false)
//         return
//       }

//       // Ensure token is stored and context is updated
//       try { 
//         login(token, userData) 
//       } catch (e) {
//         // Fallback: store token manually if login helper fails
//         localStorage.setItem('mm_token', token)
//         if (userData) localStorage.setItem('mm_user', JSON.stringify(userData))
//       }

//       toast.success(`Welcome back, ${userData?.name || 'user'}!`)
//       navigate('/dashboard')
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || err.message || 'Login failed'
//       toast.error(errorMsg)
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen grid lg:grid-cols-2">
//       {/* Left Panel */}
//       <div className="hidden lg:flex flex-col justify-center px-14 bg-indigo-600 relative overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
//         <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
//         <div className="relative z-10 max-w-sm">
//           <div className="flex items-center gap-3 mb-12">
//             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                 <path d="M9 11l3 3L22 4"/>
//                 <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
//               </svg>
//             </div>
//             <span className="text-white font-bold text-xl">MockMate Pro</span>
//           </div>
//           <h1 className="text-white font-bold text-4xl leading-tight mb-4">Ace your next<br/>interview.</h1>
//           <p className="text-white/70 text-sm leading-relaxed mb-10">
//             AI-powered mock interviews tailored to your role. Get instant feedback and track your improvement.
//           </p>
//           {['Role-specific AI questions', 'Instant scoring & feedback', 'Track your progress', 'Free to get started'].map(f => (
//             <div key={f} className="flex items-center gap-3 mb-3">
//               <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                 <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
//               </div>
//               <span className="text-white/85 text-sm">{f}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right Form */}
//       <div className="flex items-center justify-center px-6 py-12 bg-gray-50">
//         <div className="w-full max-w-md">
//           <div className="flex items-center gap-2.5 mb-8 lg:hidden">
//             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                 <path d="M9 11l3 3L22 4"/>
//               </svg>
//             </div>
//             <span className="font-bold text-gray-900">MockMate Pro</span>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
//           <p className="text-sm text-gray-500 mb-7">Welcome back! Enter your credentials to continue.</p>

//           <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
//             <p className="font-semibold mb-2">Demo account</p>
//             <div className="space-y-1 text-indigo-800">
//               <p><span className="font-medium">Email:</span> testuser@gmail.com</p>
//               <p><span className="font-medium">Password:</span> testpassword@1234</p>
//             </div>
//             <p className="mt-3 text-xs leading-relaxed text-indigo-700">
//               If you do not want to register, use the demo credentials above.
//               Backend is deployed on Render, so the first request may take 50-60 seconds to respond.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} noValidate className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
//               <input className={`input-field ${errors.email ? 'input-error' : ''}`} type="email"
//                 placeholder="you@example.com" value={form.email}
//                 onChange={e => setForm({ ...form, email: e.target.value })} />
//               {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <input className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
//                   type={showPw ? 'text' : 'password'} placeholder="Enter your password"
//                   value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
//                 <button type="button" onClick={() => setShowPw(!showPw)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   {showPw
//                     ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
//                     : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
//                   }
//                 </button>
//               </div>
//               {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary !mt-6">
//               {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>

//           <div className="text-right mt-3">
//             <Link to="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">
//               Forgot password?
//             </Link>
//           </div>

//           <p className="text-center text-sm text-gray-500 mt-6">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
// export default Login



// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { authAPI } from '../services/api'
// import { useAuth } from '../context/AuthContext'
// import toast from 'react-hot-toast'

// const Login = () => {
//   const navigate = useNavigate()
//   const { login } = useAuth()
//   const [form, setForm]       = useState({ email: '', password: '' })
//   const [errors, setErrors]   = useState({})
//   const [loading, setLoading] = useState(false)
//   const [showPw, setShowPw]   = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const errs = {}
//     if (!form.email)    errs.email    = 'Email is required'
//     if (!form.password) errs.password = 'Password is required'
//     if (Object.keys(errs).length) { setErrors(errs); return }
//     setErrors({})
//     setLoading(true)
//     try {
//       const res = await authAPI.login(form)

//       // Extract token from response
//       const token = res?.data?.token || res?.data?.data?.token || res?.data?.accessToken || res?.data?.auth?.token
//       const userData = res?.data?.user || res?.data?.data?.user || res?.data?.profile || null

//       if (!token) {
//         toast.error('Login succeeded but token was not returned by server')
//         setLoading(false)
//         return
//       }

//       // Ensure token is stored and context is updated
//       try {
//         login(token, userData)
//       } catch (e) {
//         // Fallback: store token manually if login helper fails
//         localStorage.setItem('mm_token', token)
//         if (userData) localStorage.setItem('mm_user', JSON.stringify(userData))
//       }

//       toast.success(`Welcome back, ${userData?.name || 'user'}!`)
//       navigate('/dashboard')
//     } catch (err) {
//       const errorMsg = err.response?.data?.message || err.message || 'Login failed'
//       toast.error(errorMsg)
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen grid lg:grid-cols-2">
//       {/* Left Panel */}
//       <div className="hidden lg:flex flex-col justify-center px-14 bg-indigo-600 relative overflow-hidden">
//         <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
//         <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
//         <div className="relative z-10 max-w-sm">
//           <div className="flex items-center gap-3 mb-12">
//             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
//               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                 <path d="M9 11l3 3L22 4"/>
//                 <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
//               </svg>
//             </div>
//             <span className="text-white font-bold text-xl">MockMate Pro</span>
//           </div>
//           <h1 className="text-white font-bold text-4xl leading-tight mb-4">Ace your next<br/>interview.</h1>
//           <p className="text-white/70 text-sm leading-relaxed mb-10">
//             AI-powered mock interviews tailored to your role. Get instant feedback and track your improvement.
//           </p>
//           {['Role-specific AI questions', 'Instant scoring & feedback', 'Track your progress', 'Free to get started'].map(f => (
//             <div key={f} className="flex items-center gap-3 mb-3">
//               <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                 <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
//               </div>
//               <span className="text-white/85 text-sm">{f}</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right Form */}
//       <div className="flex items-center justify-center px-6 py-12 bg-gray-50">
//         <div className="w-full max-w-md">
//           <div className="flex items-center gap-2.5 mb-8 lg:hidden">
//             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                 <path d="M9 11l3 3L22 4"/>
//               </svg>
//             </div>
//             <span className="font-bold text-gray-900">MockMate Pro</span>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
//           <p className="text-sm text-gray-500 mb-7">Welcome back! Enter your credentials to continue.</p>

//           {/* AI Ready Badge */}
//           <div className="mb-6 relative rounded-2xl border border-indigo-100 bg-white p-4 overflow-hidden shadow-sm">
//             <div
//               className="absolute inset-0 opacity-40 pointer-events-none"
//               style={{
//                 background: 'linear-gradient(120deg, transparent 30%, rgba(99,102,241,0.15) 50%, transparent 70%)',
//                 backgroundSize: '200% 100%',
//                 animation: 'shimmer 2.5s linear infinite'
//               }}
//             />
//             <div className="relative flex items-center gap-3">
//               <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
//                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
//               </span>
//               <p className="text-sm font-semibold text-gray-900">AI Interview Coach is online</p>
//             </div>
//             <p className="relative text-xs text-gray-500 mt-1.5 leading-relaxed">
//               Sign in to get role-specific questions, instant scoring, and real-time feedback on your answers.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} noValidate className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
//               <input className={`input-field ${errors.email ? 'input-error' : ''}`} type="email"
//                 placeholder="you@example.com" value={form.email}
//                 onChange={e => setForm({ ...form, email: e.target.value })} />
//               {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <input className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
//                   type={showPw ? 'text' : 'password'} placeholder="Enter your password"
//                   value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
//                 <button type="button" onClick={() => setShowPw(!showPw)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                   {showPw
//                     ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
//                     : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
//                   }
//                 </button>
//               </div>
//               {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary !mt-6">
//               {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>

//           <div className="text-right mt-3">
//             <Link to="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">
//               Forgot password?
//             </Link>
//           </div>

//           <p className="text-center text-sm text-gray-500 mt-6">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
//           </p>
//         </div>
//       </div>

//       {/* Shimmer animation keyframes */}
//       <style>{`
//         @keyframes shimmer {
//           0% { background-position: 200% 0; }
//           100% { background-position: -200% 0; }
//         }
//       `}</style>
//     </div>
//   )
// }
// export default Login


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const FEATURES = [
  'Secure JWT authentication with email OTP verification',
  'Role-based questions across easy, medium, hard levels',
  'Real-time feedback with performance analytics dashboard',
  'Secure subscription payments powered by Razorpay',
  'Track your interview history and improvement over time',
]

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email)    errs.email    = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await authAPI.login(form)

      const token = res?.data?.token || res?.data?.data?.token || res?.data?.accessToken || res?.data?.auth?.token
      const userData = res?.data?.user || res?.data?.data?.user || res?.data?.profile || null

      if (!token) {
        toast.error('Login succeeded but token was not returned by server')
        setLoading(false)
        return
      }

      try {
        login(token, userData)
      } catch (e) {
        localStorage.setItem('mm_token', token)
        if (userData) localStorage.setItem('mm_user', JSON.stringify(userData))
      }

      toast.success(`Welcome back, ${userData?.name || 'user'}!`)
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed'
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-14 bg-indigo-600 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="relative z-10 max-w-sm">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl">MockMate Pro</span>
          </div>
          <h1 className="text-white font-bold text-4xl leading-tight mb-4">Ace your next<br/>interview.</h1>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            AI-powered mock interviews tailored to your role. Get instant feedback and track your improvement.
          </p>
          {['Role-specific AI questions', 'Instant scoring & feedback', 'Track your progress', 'Free to get started'].map(f => (
            <div key={f} className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <span className="text-white/85 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9 11l3 3L22 4"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">MockMate Pro</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-7">Welcome back! Enter your credentials to continue.</p>

          {/* Feature Highlight Card */}
          <div className="mb-6 relative rounded-2xl border border-indigo-100 bg-white p-6 overflow-hidden shadow-sm">
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background: 'linear-gradient(120deg, transparent 30%, rgba(99,102,241,0.15) 50%, transparent 70%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s linear infinite'
              }}
            />
            <div className="relative flex items-center gap-3 mb-3">
              <span className="relative flex h-3 w-3 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <p className="text-sm font-semibold text-gray-900">MockMate Pro is ready</p>
            </div>

            <div className="relative h-5 overflow-hidden">
              <div className="animate-feature-cycle">
                {FEATURES.map((f, i) => (
                  <p key={i} className="text-xs text-gray-500 leading-relaxed h-5 flex items-center">
                    {f}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                  type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary !mt-6">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="text-right mt-3">
            <Link to="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes feature-cycle {
          0%, 14%   { transform: translateY(0); }
          20%, 34%  { transform: translateY(-20px); }
          40%, 54%  { transform: translateY(-40px); }
          60%, 74%  { transform: translateY(-60px); }
          80%, 94%  { transform: translateY(-80px); }
          100%      { transform: translateY(-80px); }
        }
        .animate-feature-cycle {
          animation: feature-cycle 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
export default Login