// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Navbar from "../../components/Navbar";
// import { getQuestion, submitAnswer } from "../../services/api";

// export default function Interview() {
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [questionCount, setQuestionCount] = useState(1);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();
//   const location = useLocation();

//   const role = location.state?.role || localStorage.getItem("selectedRole");
//   const token = localStorage.getItem("token");

//   // Fetch first question on page load
//   useEffect(() => {
//     if (!role) {
//       navigate("/dashboard");
//       return;
//     }
//     fetchQuestion();
//   }, []);

//   const fetchQuestion = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const data = await getQuestion(role, token);
//       if (data.question) {
//         setQuestion(data.question);
//       } else {
//         setError("Failed to load question. Please try again.");
//       }
//     } catch (err) {
//       setError("Unable to connect to server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Next button — submit current answer silently, fetch next question
//   const handleNext = async () => {
//     if (!answer.trim()) {
//       setError("Please write an answer before moving next.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       // Submit current answer silently (no feedback shown)
//       await submitAnswer({ role, question, answer }, token);

//       // Fetch next question
//       const data = await getQuestion(role, token);
//       if (data.question) {
//         setQuestion(data.question);
//         setAnswer("");
//         setQuestionCount((prev) => prev + 1);
//       } else {
//         setError("Failed to load next question.");
//       }
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Submit button — submit answer and go to feedback page
//   const handleSubmit = async () => {
//     if (!answer.trim()) {
//       setError("Please write an answer before submitting.");
//       return;
//     }

//     try {
//       setSubmitting(true);
//       setError("");

//       const data = await submitAnswer({ role, question, answer }, token);

//       if (data.score !== undefined) {
//         navigate("/feedback", {
//           state: {
//             score: data.score,
//             feedback: data.feedback,
//             question,
//             answer,
//             role,
//           },
//         });
//       } else {
//         setError("Failed to get feedback. Please try again.");
//       }
//     } catch (err) {
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-950">
//       <Navbar />

//       <div className="max-w-2xl mx-auto px-4 py-12">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-white text-2xl font-bold">Mock Interview</h1>
//             <p className="text-gray-400 text-sm mt-1 capitalize">
//               Role: {role}
//             </p>
//           </div>
//           <div className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
//             Q{questionCount}
//           </div>
//         </div>

//         {/* Question Card */}
//         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
//           {loading ? (
//             <div className="flex items-center justify-center py-8">
//               <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//               <span className="text-gray-400 text-sm ml-3">
//                 Loading question...
//               </span>
//             </div>
//           ) : (
//             <>
//               <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 font-medium">
//                 Question
//               </p>
//               <p className="text-white text-lg leading-relaxed">{question}</p>
//             </>
//           )}
//         </div>

//         {/* Answer Textarea */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-300 mb-2">
//             Your Answer
//           </label>
//           <textarea
//             rows={6}
//             placeholder="Type your answer here..."
//             value={answer}
//             onChange={(e) => {
//               setAnswer(e.target.value);
//               setError("");
//             }}
//             disabled={loading}
//             className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none disabled:opacity-50"
//           />
//         </div>

//         {/* Error */}
//         {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

//         {/* Buttons */}
//         <div className="flex gap-4">
//           <button
//             onClick={handleNext}
//             disabled={loading || submitting}
//             className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
//           >
//             {loading ? "Loading..." : "Next →"}
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading || submitting}
//             className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
//           >
//             {submitting ? "Submitting..." : "Submit ✓"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getQuestion, submitAnswer } from "../../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Proctor hook — camera stream + brightness-based face check
// ─────────────────────────────────────────────────────────────────────────────
function useProctor() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [camStatus, setCamStatus] = useState("idle");
  const [warningMsg, setWarningMsg] = useState("");

  // Push stream into video element whenever both are ready
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  const startBrightnessCheck = useCallback((video) => {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    const check = () => {
      if (!video || video.readyState < 2) return;
      ctx.drawImage(video, 0, 0, 200, 150);
      const pixels = ctx.getImageData(0, 0, 200, 150).data;
      let brightness = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      }
      brightness /= pixels.length / 4;
      if (brightness < 20) {
        setCamStatus("warning");
        setWarningMsg("Face not detected — please stay in frame");
      } else {
        setCamStatus("active");
        setWarningMsg("");
      }
    };

    const onLoaded = () => {
      setCamStatus("active");
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(check, 3000);
    };

    if (video.readyState >= 2) onLoaded();
    else video.addEventListener("loadeddata", onLoaded, { once: true });
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 200, height: 150, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        startBrightnessCheck(videoRef.current);
      } else {
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            startBrightnessCheck(videoRef.current);
            clearInterval(poll);
          } else if (attempts > 20) clearInterval(poll);
        }, 100);
      }
      setCamStatus("active");
      setWarningMsg("");
    } catch {
      setCamStatus("denied");
      setWarningMsg("Camera access denied");
    }
  }, [startBrightnessCheck]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  return { videoRef, camStatus, warningMsg, start, stop };
}

// ─────────────────────────────────────────────────────────────────────────────
// Speech hook — Web Speech API continuous recognition
// ─────────────────────────────────────────────────────────────────────────────
function useSpeech(onTranscript) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    let final = "";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + " ";
        else interim = t;
      }
      onTranscript(final + interim);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => {
      if (recognitionRef.current?._active) rec.start();
      else setListening(false);
    };

    recognitionRef.current = rec;
    recognitionRef.current._active = false;

    return () => { rec.stop(); };
  }, [onTranscript]);

  const toggle = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec._active = false;
      rec.stop();
      setListening(false);
    } else {
      rec._active = true;
      rec.start();
      setListening(true);
    }
  }, [listening]);

  const reset = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) { rec._active = false; try { rec.stop(); } catch {} }
    setListening(false);
  }, []);

  return { listening, supported, toggle, reset };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules data
// ─────────────────────────────────────────────────────────────────────────────
const RULES = [
  {
    icon: "📷",
    title: "Camera must stay on",
    desc: "Your webcam will be active throughout the entire test. Keep your face clearly visible in the frame at all times.",
  },
  {
    icon: "🪟",
    title: "No tab or window switching",
    desc: "Switching browser tabs, minimising the window, or switching apps during the test is strictly not allowed. Every violation is detected and recorded automatically.",
  },
  {
    icon: "🎙️",
    title: "Answer by voice or typing",
    desc: "You may speak your answer using the mic button or type it manually. Both methods are fully supported.",
  },
  {
    icon: "⏭️",
    title: "Next vs Submit",
    desc: "'Next' saves your answer silently and loads the next question. 'Submit' ends the session and shows your full score and AI feedback.",
  },
  {
    icon: "🔇",
    title: "Use a quiet environment",
    desc: "Background noise can reduce voice recognition accuracy. Find a quiet space before starting.",
  },
  {
    icon: "✅",
    title: "Attempt every question",
    desc: "Try to answer all questions before submitting. Unanswered questions receive no score.",
  },
  {
    icon: "🚫",
    title: "No external help",
    desc: "You must not use notes, search engines, AI tools, or assistance from other people during the test.",
  },
  {
    icon: "⛶",
    title: "Fullscreen is mandatory",
    desc: "The test runs in fullscreen mode. Pressing Esc or exiting fullscreen is treated as a violation — the test re-enters fullscreen automatically.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rules modal component
// ─────────────────────────────────────────────────────────────────────────────
function RulesModal({ role, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.80)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}
        className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📋</span>
            <div>
              <h2 className="text-white text-xl font-bold leading-tight">
                Test Rules &amp; Guidelines
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Read all rules before starting your{" "}
                <span className="text-indigo-400 font-semibold capitalize">{role}</span>{" "}
                interview
              </p>
            </div>
          </div>
        </div>

        {/* Rules list */}
        <div className="px-6 py-4 flex flex-col gap-3">
          {RULES.map((rule, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 bg-gray-800 border border-gray-700 rounded-xl"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{rule.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold mb-1">{rule.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agreement notice */}
        <div className="mx-6 mb-4 flex gap-3 items-start bg-yellow-950 border border-yellow-800 rounded-xl px-4 py-3">
          <span className="text-yellow-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
          <p className="text-yellow-200 text-xs leading-relaxed">
            By clicking{" "}
            <span className="font-bold text-yellow-100">"I Understand, Start Test"</span> you
            acknowledge that this session is proctored via webcam and tab-switching is
            monitored. Violations are logged automatically.
          </p>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <button
            onClick={onConfirm}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            I Understand, Start Test →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab-switch warning overlay
// ─────────────────────────────────────────────────────────────────────────────
function TabWarningOverlay({ count, onDismiss }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.90)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div className="bg-gray-900 border-2 border-red-600 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🚨</div>
        <h2 className="text-white text-lg font-bold mb-2">Tab Switch Detected!</h2>
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          You navigated away from this window during the test. This is a proctoring violation.
        </p>
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-5">
          <p className="text-red-300 text-xs font-medium">Total violations recorded</p>
          <p className="text-red-400 text-3xl font-bold mt-1">{count}</p>
        </div>
        {count >= 3 && (
          <p className="text-yellow-400 text-xs mb-5 leading-relaxed">
            ⚠️ You have {count} violations. Continued switching may result in your
            session being flagged for review.
          </p>
        )}
        <button
          onClick={onDismiss}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm transition"
        >
          Return to Test
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Interview component
// ─────────────────────────────────────────────────────────────────────────────
export default function Interview() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [error, setError] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [tabViolations, setTabViolations] = useState(0);
  const submitted = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem("selectedRole");
  const token = localStorage.getItem("token");

  const proctor = useProctor();

  const handleTranscript = useCallback((text) => {
    setAnswer(text);
    setError("");
  }, []);

  const speech = useSpeech(handleTranscript);

  useEffect(() => {
    if (!role) navigate("/dashboard");
  }, []);

  useEffect(() => () => { proctor.stop(); speech.reset(); exitFullscreen(); }, []);

  // Fullscreen helpers
  const enterFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
  };

  const exitFullscreen = () => {
    if (!document.fullscreenElement) return;
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  };

  // Detect Esc / manual fullscreen exit during test
  useEffect(() => {
    if (!testStarted) return;

    const onFullscreenChange = () => {
      if (submitted.current) return;
      if (!document.fullscreenElement) {
        setTabViolations((v) => v + 1);
        setTabWarning(true);
        // Re-enter after short delay so warning overlay is visible first
        setTimeout(() => {
          if (!submitted.current) enterFullscreen();
        }, 300);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, [testStarted]);

  // Tab-switch / window-blur detection
  useEffect(() => {
    if (!testStarted) return;

    const onVisibility = () => {
      if (submitted.current || !document.hidden) return;
      setTabViolations((v) => v + 1);
      setTabWarning(true);
    };

    const onBlur = () => {
      if (submitted.current) return;
      setTabViolations((v) => v + 1);
      setTabWarning(true);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [testStarted]);

  // Clicking "View Rules & Start" on landing screen
  const handleClickStart = () => setShowRules(true);

  // Confirming rules modal: go fullscreen + activate camera + begin
  const handleConfirmRules = async () => {
    setShowRules(false);
    enterFullscreen();
    await proctor.start();
    setTestStarted(true);
    fetchQuestion();
  };

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getQuestion(role, token);
      if (data.question) setQuestion(data.question);
      else setError("Failed to load question.");
    } catch {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!answer.trim()) { setError("Please provide an answer first."); return; }
    speech.reset();
    try {
      setLoading(true);
      setError("");
      await submitAnswer({ role, question, answer }, token);
      const data = await getQuestion(role, token);
      if (data.question) {
        setQuestion(data.question);
        setAnswer("");
        setQuestionCount((p) => p + 1);
      } else setError("Failed to load next question.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { setError("Please provide an answer first."); return; }
    speech.reset();
    submitted.current = true; // stop tab-switch detection before navigating away
    proctor.stop();
    exitFullscreen();
    try {
      setSubmitting(true);
      setError("");
      const data = await submitAnswer({ role, question, answer }, token);
      if (data.score !== undefined) {
        navigate("/feedback", {
          state: { score: data.score, feedback: data.feedback, question, answer, role },
        });
      } else {
        submitted.current = false;
        setError("Failed to get feedback.");
      }
    } catch {
      submitted.current = false;
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const camDot = {
    idle:    { color: "bg-gray-500",                 label: "Camera off" },
    active:  { color: "bg-green-500",                label: "● Proctored" },
    denied:  { color: "bg-red-500",                  label: "Camera denied" },
    warning: { color: "bg-yellow-400 animate-pulse", label: "⚠ Face missing" },
  }[proctor.camStatus];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Rules modal */}
      {showRules && <RulesModal role={role} onConfirm={handleConfirmRules} />}

      {/* Tab-switch warning overlay */}
      {tabWarning && (
        <TabWarningOverlay
          count={tabViolations}
          onDismiss={() => setTabWarning(false)}
        />
      )}

      {/* Camera widget — fixed top-right, visible only after test starts */}
      {testStarted && (
        <div
          style={{ position: "fixed", top: 72, right: 16, zIndex: 50, width: 180 }}
          className="rounded-2xl overflow-hidden border border-gray-700 bg-gray-900 shadow-2xl"
        >
          <video
            ref={proctor.videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "100%", display: "block", transform: "scaleX(-1)" }}
          />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-950">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${camDot.color}`} />
            <span className="text-xs text-gray-400 truncate">{camDot.label}</span>
          </div>
          {proctor.camStatus === "warning" && (
            <div className="bg-yellow-500 text-gray-950 text-xs font-semibold text-center py-1 px-2 leading-tight">
              {proctor.warningMsg}
            </div>
          )}
          {proctor.camStatus === "denied" && (
            <div className="bg-red-600 text-white text-xs font-semibold text-center py-1 px-2">
              {proctor.warningMsg}
            </div>
          )}
          {tabViolations > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-red-950 border-t border-red-800">
              <span className="text-red-400 text-xs">Violations</span>
              <span className="text-red-300 text-xs font-bold">{tabViolations}</span>
            </div>
          )}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Mock Interview</h1>
            <p className="text-gray-400 text-sm mt-1 capitalize">Role: {role}</p>
          </div>
          {testStarted && (
            <div className="flex items-center gap-3">
              {tabViolations > 0 && (
                <div className="bg-red-900 border border-red-700 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  ⚠ {tabViolations} violation{tabViolations > 1 ? "s" : ""}
                </div>
              )}
              <div className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                Q{questionCount}
              </div>
            </div>
          )}
        </div>

        {/* Landing screen (before test starts) */}
        {!testStarted ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-white text-xl font-semibold mb-2">Ready to begin?</h2>
            <p className="text-gray-400 text-sm mb-2">
              This session activates your{" "}
              <span className="text-indigo-400 font-medium">camera</span> for proctoring and
              enables <span className="text-indigo-400 font-medium">voice input</span> for answers.
            </p>
            <p className="text-gray-500 text-xs mb-8">
              You will be shown the full rules before the test begins.
            </p>
            <div className="flex justify-center gap-6 mb-8 text-sm text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">📷</span>
                <span>Camera proctoring</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🎙️</span>
                <span>Voice answers</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🪟</span>
                <span>No tab switching</span>
              </div>
            </div>
            <button
              onClick={handleClickStart}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-3 rounded-xl text-sm transition"
            >
              View Rules &amp; Start →
            </button>
          </div>
        ) : (
          <>
            {/* Question card */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm ml-3">Loading question...</span>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 font-medium">
                    Question
                  </p>
                  <p className="text-white text-lg leading-relaxed">{question}</p>
                </>
              )}
            </div>

            {/* Answer area */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Your Answer</label>
                {speech.supported ? (
                  <button
                    onClick={speech.toggle}
                    disabled={loading}
                    className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition
                      ${speech.listening
                        ? "bg-red-600 border-red-500 text-white animate-pulse"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {speech.listening ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-white" />
                        Stop recording
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-7 11a7 7 0 0 0 14 0h2a9 9 0 0 1-8 8.94V23h-2v-3.06A9 9 0 0 1 3 12h2z" />
                        </svg>
                        Speak answer
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-gray-600">Voice not supported (use Chrome)</span>
                )}
              </div>

              {speech.listening && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-red-950 border border-red-800 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-medium">
                    Recording — speak clearly...
                  </span>
                </div>
              )}

              <textarea
                rows={6}
                placeholder={
                  speech.supported
                    ? "Type your answer or click 'Speak answer' above..."
                    : "Type your answer here..."
                }
                value={answer}
                onChange={(e) => { setAnswer(e.target.value); setError(""); }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none disabled:opacity-50"
              />
              <p className="text-right text-xs text-gray-600 mt-1">{answer.length} chars</p>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Action buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleNext}
                disabled={loading || submitting}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                {loading ? "Loading..." : "Next →"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition"
              >
                {submitting ? "Submitting..." : "Submit ✓"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
