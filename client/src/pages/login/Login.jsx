// import { useState } from "react";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [focusedField, setFocusedField] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // TODO: connect to your auth API
//     setTimeout(() => setLoading(false), 2000);
//   };

//   return (
//     <div className="min-h-screen flex" style={{ background: "#0a0a0f", fontFamily: "'Sora', sans-serif" }}>

//       {/* Google Font */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

//         @keyframes float {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-20px) rotate(3deg); }
//         }
//         @keyframes float2 {
//           0%, 100% { transform: translateY(0px) rotate(0deg); }
//           50% { transform: translateY(-14px) rotate(-4deg); }
//         }
//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         @keyframes fadeSlideUp {
//           from { opacity: 0; transform: translateY(30px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes pulse-ring {
//           0% { transform: scale(0.8); opacity: 1; }
//           100% { transform: scale(1.6); opacity: 0; }
//         }
//         @keyframes scanline {
//           0% { top: -10%; }
//           100% { top: 110%; }
//         }

//         .logo-ring::after {
//           content: '';
//           position: absolute;
//           inset: -4px;
//           border-radius: 50%;
//           border: 2px solid #6366f1;
//           animation: pulse-ring 2s ease-out infinite;
//         }

//         .input-field {
//           background: rgba(255,255,255,0.04);
//           border: 1.5px solid rgba(255,255,255,0.08);
//           color: #f0f0f0;
//           transition: all 0.3s ease;
//           outline: none;
//           width: 100%;
//           padding: 14px 16px;
//           border-radius: 12px;
//           font-family: 'Sora', sans-serif;
//           font-size: 14px;
//         }
//         .input-field:focus {
//           border-color: #6366f1;
//           background: rgba(99,102,241,0.07);
//           box-shadow: 0 0 0 4px rgba(99,102,241,0.12);
//         }
//         .input-field::placeholder { color: rgba(255,255,255,0.25); }

//         .login-btn {
//           background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4);
//           background-size: 200% 200%;
//           animation: gradientShift 3s ease infinite;
//           border: none;
//           color: white;
//           padding: 15px;
//           border-radius: 12px;
//           font-family: 'Sora', sans-serif;
//           font-weight: 600;
//           font-size: 15px;
//           cursor: pointer;
//           width: 100%;
//           transition: transform 0.2s ease, box-shadow 0.2s ease;
//           letter-spacing: 0.5px;
//         }
//         .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.4); }
//         .login-btn:active { transform: translateY(0); }
//         .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

//         .card-animate { animation: fadeSlideUp 0.7s ease both; }
//         .card-animate-delay { animation: fadeSlideUp 0.7s ease 0.15s both; }

//         .scanline {
//           position: absolute;
//           left: 0; right: 0;
//           height: 2px;
//           background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
//           animation: scanline 4s linear infinite;
//           pointer-events: none;
//         }

//         .feature-chip {
//           background: rgba(255,255,255,0.05);
//           border: 1px solid rgba(255,255,255,0.08);
//           border-radius: 100px;
//           padding: 6px 14px;
//           font-size: 12px;
//           color: rgba(255,255,255,0.6);
//           font-family: 'Space Mono', monospace;
//         }

//         .divider-line {
//           flex: 1;
//           height: 1px;
//           background: rgba(255,255,255,0.08);
//         }
//       `}</style>

//       {/* LEFT PANEL — Branding */}
//       <div
//         className="hidden lg:flex flex-col justify-between relative overflow-hidden"
//         style={{ width: "52%", background: "linear-gradient(145deg, #0f0e1a 0%, #13111f 60%, #0c1628 100%)", padding: "48px" }}
//       >
//         {/* Animated blobs */}
//         <div style={{
//           position: "absolute", top: "15%", left: "10%", width: 320, height: 320,
//           background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
//           borderRadius: "50%", animation: "float 7s ease-in-out infinite"
//         }} />
//         <div style={{
//           position: "absolute", bottom: "20%", right: "5%", width: 240, height: 240,
//           background: "radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)",
//           borderRadius: "50%", animation: "float2 6s ease-in-out infinite"
//         }} />

//         {/* Scanline effect */}
//         <div className="scanline" />

//         {/* Grid overlay */}
//         <div style={{
//           position: "absolute", inset: 0, opacity: 0.04,
//           backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
//           backgroundSize: "40px 40px"
//         }} />

//         {/* Logo */}
//         <div style={{ position: "relative", zIndex: 10 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div className="logo-ring" style={{ position: "relative", width: 44, height: 44, background: "linear-gradient(135deg, #6366f1, #06b6d4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <span style={{ color: "white", fontWeight: 700, fontSize: 18, fontFamily: "Space Mono" }}>M</span>
//             </div>
//             <span style={{ color: "white", fontWeight: 700, fontSize: 20, fontFamily: "Space Mono", letterSpacing: "1px" }}>
//               MockMate<span style={{ color: "#6366f1" }}>-Pro</span>
//             </span>
//           </div>
//         </div>

//         {/* Main hero text */}
//         <div style={{ position: "relative", zIndex: 10 }}>
//           <div className="feature-chip" style={{ display: "inline-block", marginBottom: 24 }}>
//             🎯 AI-POWERED INTERVIEWS
//           </div>
//           <h1 style={{
//             fontFamily: "Sora", fontWeight: 700, fontSize: "clamp(36px, 3.5vw, 52px)",
//             lineHeight: 1.15, color: "white", marginBottom: 20
//           }}>
//             Ace every<br />
//             <span style={{
//               background: "linear-gradient(90deg, #6366f1, #06b6d4, #8b5cf6)",
//               backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
//               backgroundSize: "200%", animation: "gradientShift 3s ease infinite"
//             }}>
//               interview
//             </span><br />
//             you face.
//           </h1>
//           <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
//             Practice with AI interviewers, get real-time feedback, and build confidence before the big day.
//           </p>

//           {/* Feature pills */}
//           <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
//             {["🤖 AI Feedback", "⏱ Live Timer", "📊 Analytics"].map(f => (
//               <span className="feature-chip" key={f}>{f}</span>
//             ))}
//           </div>
//         </div>

//         {/* Bottom stat strip */}
//         <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 40 }}>
//           {[["12K+", "Interviews"], ["94%", "Success Rate"], ["50+", "Job Roles"]].map(([val, label]) => (
//             <div key={label}>
//               <div style={{ fontFamily: "Space Mono", fontWeight: 700, fontSize: 22, color: "white" }}>{val}</div>
//               <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{label}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* RIGHT PANEL — Login Form */}
//       <div className="flex flex-col justify-center items-center flex-1 relative" style={{ padding: "40px 24px" }}>

//         {/* Mobile logo */}
//         <div className="lg:hidden" style={{ marginBottom: 32, textAlign: "center" }}>
//           <span style={{ color: "white", fontWeight: 700, fontSize: 22, fontFamily: "Space Mono", letterSpacing: "1px" }}>
//             MockMate<span style={{ color: "#6366f1" }}>-Pro</span>
//           </span>
//         </div>

//         <div className="card-animate" style={{ width: "100%", maxWidth: 420 }}>

//           {/* Card */}
//           <div style={{
//             background: "rgba(255,255,255,0.03)",
//             border: "1px solid rgba(255,255,255,0.07)",
//             borderRadius: 24,
//             padding: "40px 36px",
//             backdropFilter: "blur(20px)",
//             boxShadow: "0 25px 60px rgba(0,0,0,0.5)"
//           }}>
//             <div style={{ marginBottom: 32 }}>
//               <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: 26, color: "white", marginBottom: 8 }}>
//                 Welcome back 👋
//               </h2>
//               <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
//                 Sign in to continue your mock interview journey
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

//               {/* Email */}
//               <div>
//                 <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
//                   Email Address
//                 </label>
//                 <div style={{ position: "relative" }}>
//                   <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: 15 }}>✉</span>
//                   <input
//                     type="email"
//                     className="input-field"
//                     placeholder="you@example.com"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     onFocus={() => setFocusedField("email")}
//                     onBlur={() => setFocusedField(null)}
//                     style={{ paddingLeft: 40 }}
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
//                   Password
//                 </label>
//                 <div style={{ position: "relative" }}>
//                   <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", fontSize: 15 }}>🔐</span>
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     className="input-field"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     style={{ paddingLeft: 40, paddingRight: 48 }}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 14, padding: 4 }}
//                   >
//                     {showPassword ? "🙈" : "👁"}
//                   </button>
//                 </div>
//               </div>

//               {/* Forgot */}
//               <div style={{ textAlign: "right", marginTop: -8 }}>
//                 <a href="#" style={{ color: "#6366f1", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
//                   Forgot password?
//                 </a>
//               </div>

//               {/* Submit */}
//               <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: 4 }}>
//                 {loading ? (
//                   <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
//                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
//                       <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//                       <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
//                     </svg>
//                     Signing in...
//                   </span>
//                 ) : "Sign In →"}
//               </button>


//             </form>
//           </div>

//           {/* Sign up link */}
//           <p className="card-animate-delay" style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14, marginTop: 24 }}>
//             New to MockMate-Pro?{" "}
//             <a href="/register" style={{ color: "#6366f1", fontWeight: 600, textDecoration: "none" }}>
//               Create an account
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }









// import { useState } from "react";
// import {Link} from "react-router-dom"

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     // TODO: connect to your auth API
//     setTimeout(() => setLoading(false), 2000);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
//       <div className="w-full max-w-md">

//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
//             <span className="text-white font-bold text-xl">M</span>
//           </div>
//           <h1 className="text-white text-2xl font-bold tracking-tight">
//             MockMate<span className="text-indigo-400">-Pro</span>
//           </h1>
//           <p className="text-gray-400 text-sm mt-1">AI-Powered Mock Interview Platform</p>
//         </div>

//         {/* Card */}
//         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

//           <div className="mb-6">
//             <h2 className="text-white text-xl font-semibold">Sign in to your account</h2>
//             <p className="text-gray-400 text-sm mt-1">Welcome back! Enter your credentials to continue.</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1.5">
//                 Email Address
//               </label>
//               <input
//                 type="email"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <div className="flex items-center justify-between mb-1.5">
//                 <label className="block text-sm font-medium text-gray-300">
//                   Password
//                 </label>
//                 <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-12"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm transition"
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>

//           </form>
//         </div>

//         {/* Register link */}
//         <p className="text-center text-gray-500 text-sm mt-6">
//           Don't have an account?{" "}
//           <a  className="text-indigo-400 hover:text-indigo-300 font-medium transition">
//           <Link to="/register">Create one</Link>
//           </a>
//         </p>

//       </div>
//     </div>
//   );
// }

























import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
      } else {
        // Save token to localStorage
        localStorage.setItem("token", data.token);
if (data.user) {
  localStorage.setItem("user", JSON.stringify(data.user));
} else {
  localStorage.setItem("user", JSON.stringify({ name: data.name || "" }));
}

        console.log("Login successful", data);

        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            MockMate<span className="text-indigo-400">-Pro</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">AI-Powered Mock Interview Platform</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

          <div className="mb-6">
            <h2 className="text-white text-xl font-semibold">Sign in to your account</h2>
            <p className="text-gray-400 text-sm mt-1">Welcome back! Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}