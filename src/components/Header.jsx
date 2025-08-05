import { FaChessQueen, FaUser, FaSignOutAlt, FaPuzzlePiece, FaPlay, FaBook, FaChartBar, FaCrown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Colores según tipo de usuario
  const getUserColor = () => {
    if (!user) return "bg-slate-800";
    return user.type === "profesor" ? "bg-emerald-700" : "bg-blue-700";
  };

  const getNavigationItems = () => {
    if (user?.type === "profesor") {
      // Navegación para profesores - sin puzzles, lecciones ni aulas
      return [
        { path: "/home", label: "Inicio", icon: FaChessQueen },
        { path: "/play", label: "Jugar", icon: FaPlay },
        { path: "/stats", label: "Estadísticas", icon: FaChartBar },
        { path: "/teacher-panel", label: "Panel Profesor", icon: FaCrown }
      ];
    } else {
      // Navegación para estudiantes - con puzzles y lecciones
      return [
        { path: "/home", label: "Inicio", icon: FaChessQueen },
        { path: "/play", label: "Jugar", icon: FaPlay },
        { path: "/puzzles", label: "Puzzles", icon: FaPuzzlePiece },
        { path: "/learn", label: "Lecciones", icon: FaBook },
        { path: "/stats", label: "Estadísticas", icon: FaChartBar },
      ];
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path ||
      (path === "/learn" && location.pathname.startsWith("/learn/"));
  };

  return (
    <header className={`${getUserColor()} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-2">
            <FaChessQueen className="text-2xl" />
            <h1 className="text-xl font-bold">ChessEdu</h1>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-6">
            {getNavigationItems().map(({ path, label, icon: IconComponent }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActivePath(path)
                    ? "bg-white/20 text-white"
                    : "hover:bg-white/10"
                  }`}
              >
                <IconComponent className="text-sm" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Usuario y logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-lg">
              <FaUser className="text-sm" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || user?.username}</p>
                <p className="text-xs opacity-75 capitalize">{user?.type}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="text-sm" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        <nav className="md:hidden mt-4 flex space-x-1 overflow-x-auto">
          {getNavigationItems().map(({ path, label, icon: IconComponent }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${isActivePath(path)
                  ? "bg-white/20 text-white"
                  : "hover:bg-white/10"
                }`}
            >
              <IconComponent className="text-sm" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
