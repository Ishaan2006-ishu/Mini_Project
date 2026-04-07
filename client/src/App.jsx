import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login      from './pages/Login'
import Register   from './pages/Register'
import VerifyOtp  from './pages/VerifyOtp'
import Dashboard  from './pages/Dashboard'
import RoleSelect from './pages/RoleSelect'
import PracticeSelect from './pages/PracticeSelect'
import Session    from './pages/Session'
import FeedBack   from './pages/Feedback'
import History    from './pages/History'

const App = () => (
  <AuthProvider>
    <Toaster position="top-right" toastOptions={{
      duration: 3500,
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' }
    }} />
    <Routes>
      <Route path="/"            element={<Navigate to="/login" replace />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/register"    element={<Register />} />
      <Route path="/verify-otp"  element={<VerifyOtp />} />
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/role-select" element={<ProtectedRoute><RoleSelect /></ProtectedRoute>} />
      <Route path="/practice-select" element={<ProtectedRoute><PracticeSelect /></ProtectedRoute>} />
      <Route path="/session/:id" element={<ProtectedRoute><Session /></ProtectedRoute>} />
      <Route path="/feedback/:id" element={<ProtectedRoute><FeedBack /></ProtectedRoute>} />
      <Route path="/history"     element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="*"            element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
)

export default App