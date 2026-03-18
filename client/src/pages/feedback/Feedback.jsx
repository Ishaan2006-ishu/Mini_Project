import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();

  const { score, feedback, question, answer, role } = location.state || {};

  // If someone directly visits /feedback without data, send back
  if (!score && !feedback) {
    navigate("/dashboard");
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return "Excellent!";
    if (score >= 5) return "Good effort!";
    return "Needs improvement";
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-white text-2xl font-bold mb-2">
            Interview Feedback
          </h1>
          <p className="text-gray-400 text-sm capitalize">Role: {role}</p>
        </div>

        {/* Score Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6 shadow-xl text-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">
            Your Score
          </p>
          <p className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}<span className="text-2xl text-gray-500">/10</span>
          </p>
          <p className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
        </div>

        {/* Feedback Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 shadow-xl">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 font-medium">
            Feedback
          </p>
          <p className="text-white text-sm leading-relaxed">{feedback}</p>
        </div>

        {/* Question & Answer Review */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-medium">
              Question
            </p>
            <p className="text-white text-sm leading-relaxed">{question}</p>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-medium">
              Your Answer
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">{answer}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            Practice Again
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl text-sm transition"
          >
            View History
          </button>
        </div>

      </div>
    </div>
  );
}