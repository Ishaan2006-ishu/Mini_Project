import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getQuestion, submitAnswer } from "../../services/api";

export default function Interview() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || localStorage.getItem("selectedRole");
  const token = localStorage.getItem("token");

  // Fetch first question on page load
  useEffect(() => {
    if (!role) {
      navigate("/dashboard");
      return;
    }
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getQuestion(role, token);
      if (data.question) {
        setQuestion(data.question);
      } else {
        setError("Failed to load question. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Next button — submit current answer silently, fetch next question
  const handleNext = async () => {
    if (!answer.trim()) {
      setError("Please write an answer before moving next.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Submit current answer silently (no feedback shown)
      await submitAnswer({ role, question, answer }, token);

      // Fetch next question
      const data = await getQuestion(role, token);
      if (data.question) {
        setQuestion(data.question);
        setAnswer("");
        setQuestionCount((prev) => prev + 1);
      } else {
        setError("Failed to load next question.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit button — submit answer and go to feedback page
  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Please write an answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const data = await submitAnswer({ role, question, answer }, token);

      if (data.score !== undefined) {
        navigate("/feedback", {
          state: {
            score: data.score,
            feedback: data.feedback,
            question,
            answer,
            role,
          },
        });
      } else {
        setError("Failed to get feedback. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Mock Interview</h1>
            <p className="text-gray-400 text-sm mt-1 capitalize">
              Role: {role}
            </p>
          </div>
          <div className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            Q{questionCount}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400 text-sm ml-3">
                Loading question...
              </span>
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

        {/* Answer Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Answer
          </label>
          <textarea
            rows={6}
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError("");
            }}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none disabled:opacity-50"
          />
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Buttons */}
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

      </div>
    </div>
  );
}