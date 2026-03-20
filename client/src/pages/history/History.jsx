import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getHistory } from "../../services/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getHistory(token);
      if (Array.isArray(data)) {
        setHistory(data.reverse()); // latest first
      } else {
        setError("Failed to load history.");
      }
    } catch (err) {
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-green-400/10 border-green-400/20";
    if (score >= 5) return "bg-yellow-400/10 border-yellow-400/20";
    return "bg-red-400/10 border-red-400/20";
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Interview History</h1>
            <p className="text-gray-400 text-sm mt-1">
              All your past practice sessions
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            ← Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm ml-3">
              Loading history...
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-white font-semibold text-lg mb-2">
              No history yet
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Complete your first interview to see results here.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition"
            >
              Start Practicing
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl"
              >
                {/* Top row — role + score */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                    {item.role}
                  </span>
                  <div className={`border rounded-full px-3 py-1 ${getScoreBg(item.score)}`}>
                    <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                      {item.score}/10
                    </span>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-medium">
                    Question
                  </p>
                  <p className="text-white text-sm leading-relaxed">
                    {item.question}
                  </p>
                </div>

                {/* Answer */}
                <div className="mb-3">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-medium">
                    Your Answer
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {item.answer}
                  </p>
                </div>

                {/* Feedback */}
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-medium">
                    Feedback
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}