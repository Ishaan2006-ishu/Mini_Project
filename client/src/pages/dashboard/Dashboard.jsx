import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const [showRoles, setShowRoles] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/interview", { state: { role } });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[90vh] px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-bold mb-3">
            Ready to Practice?
          </h1>
          <p className="text-gray-400 text-sm">
            Select your role and start your mock interview session.
          </p>
        </div>

        {/* Start Test Button */}
        {!showRoles && (
          <button
            onClick={() => setShowRoles(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition"
          >
            Start Test
          </button>
        )}

        {/* Role Selection */}
        {showRoles && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl w-full max-w-sm text-center">
            <h2 className="text-white text-lg font-semibold mb-2">
              Select Your Role
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Choose the domain you want to practice for.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleRoleSelect("frontend")}
                className="bg-gray-800 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 text-white font-semibold py-4 rounded-xl transition"
              >
                💻 Frontend
              </button>
              <button
                onClick={() => handleRoleSelect("backend")}
                className="bg-gray-800 hover:bg-indigo-600 border border-gray-700 hover:border-indigo-500 text-white font-semibold py-4 rounded-xl transition"
              >
                ⚙️ Backend
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={() => setShowRoles(false)}
              className="mt-5 text-gray-500 hover:text-gray-300 text-sm transition"
            >
              ← Go back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}