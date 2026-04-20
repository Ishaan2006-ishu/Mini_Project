

// import { Routes, Route, Navigate } from 'react-router-dom'
// import { Toaster } from 'react-hot-toast'
// import { AuthProvider } from './context/AuthContext'
// import ProtectedRoute from './components/ProtectedRoute'
// import Login         from './pages/Login'
// import ForgotPassword from './pages/ForgotPassword'
// import Register      from './pages/Register'
// import VerifyOtp     from './pages/VerifyOtp'
// import Dashboard     from './pages/Dashboard'
// import RoleSelect    from './pages/RoleSelect'
// import PracticeSelect from './pages/PracticeSelect'
// import Session       from './pages/Session'
// import FeedBack      from './pages/Feedback'
// import History       from './pages/History'
// import CompanyPrep   from './pages/CompanyPrep'   // ← NEW
// import Premium       from './pages/Premium'        // ← NEW
// import Profile       from './pages/Profile'

// const App = () => (
//   <AuthProvider>
//     <Toaster position="top-right" toastOptions={{
//       duration: 3500,
//       style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '10px' }
//     }} />
//     <Routes>
//       <Route path="/"               element={<Navigate to="/login" replace />} />
//       <Route path="/login"          element={<Login />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="/register"       element={<Register />} />
//       <Route path="/verify-otp"     element={<VerifyOtp />} />
//       <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//       <Route path="/role-select"    element={<ProtectedRoute><RoleSelect /></ProtectedRoute>} />
//       <Route path="/practice-select" element={<ProtectedRoute><PracticeSelect /></ProtectedRoute>} />
//       <Route path="/session/:id"    element={<ProtectedRoute><Session /></ProtectedRoute>} />
//       <Route path="/feedback/:id"   element={<ProtectedRoute><FeedBack /></ProtectedRoute>} />
//       <Route path="/history"        element={<ProtectedRoute><History /></ProtectedRoute>} />
//       <Route path="/company-prep"   element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />  {/* ← NEW */}
//       <Route path="/premium"        element={<ProtectedRoute><Premium /></ProtectedRoute>} />        {/* ← NEW */}
//       <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//       <Route path="*"               element={<Navigate to="/login" replace />} />
//     </Routes>
//   </AuthProvider>
// )

// export default App















import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login          from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register       from './pages/Register';
import VerifyOtp      from './pages/VerifyOtp';
import Dashboard      from './pages/Dashboard';
import RoleSelect     from './pages/RoleSelect';
import PracticeSelect from './pages/PracticeSelect';
import Session        from './pages/Session';
import FeedBack       from './pages/Feedback';
import History        from './pages/History';
import CompanyPrep    from './pages/CompanyPrep';
import Premium        from './pages/Premium';
import Profile        from './pages/Profile';

// ── NEW: Live AI Interview ──────────────────────────────────────
import InterviewSetup from './pages/InterviewSetup';
import LiveInterview  from './pages/LiveInterview';

const App = () => (
  <AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: { fontFamily: 'Inter, sans-serif', fontSize: 14, borderRadius: 10 },
      }}
    />
    <Routes>
      <Route path="/"                element={<Navigate to="/login" replace />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/verify-otp"      element={<VerifyOtp />} />

      <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/role-select"     element={<ProtectedRoute><RoleSelect /></ProtectedRoute>} />
      <Route path="/practice-select" element={<ProtectedRoute><PracticeSelect /></ProtectedRoute>} />
      <Route path="/session/:id"     element={<ProtectedRoute><Session /></ProtectedRoute>} />
      <Route path="/feedback/:id"    element={<ProtectedRoute><FeedBack /></ProtectedRoute>} />
      <Route path="/history"         element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/company-prep"    element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
      <Route path="/premium"         element={<ProtectedRoute><Premium /></ProtectedRoute>} />
      <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* ── Live AI Interview routes ── */}
      <Route path="/interview-setup"        element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
      <Route path="/live-interview/:id"     element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </AuthProvider>
);

export default App;