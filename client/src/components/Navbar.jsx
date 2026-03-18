import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedRole");
    navigate("/login");
  };

 const user = JSON.parse(localStorage.getItem("user") || "null") || {};

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-white font-bold text-lg">
          MockMate<span className="text-indigo-400">-Pro</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {user?.name && (
          <span className="text-gray-400 text-sm hidden sm:block">
            👋 {user.name}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-gray-800 hover:bg-red-600 border border-gray-700 hover:border-red-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>

    </nav>
  );
}