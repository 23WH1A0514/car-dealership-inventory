import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        <Link
          to="/"
          className="text-2xl font-bold text-slate-900"
        >
          Car<span className="text-blue-600">Deal</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            Inventory
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}