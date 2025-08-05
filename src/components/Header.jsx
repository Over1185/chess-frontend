import { FaChessQueen, FaUser, FaChalkboardTeacher, FaSignOutAlt, FaPuzzlePiece, FaPlay, FaBook, FaChartBar, FaCrown } from "react-icons/fa";

export default function Header({ user, onLogout, setCurrentView }) {
  // Colores según tipo de usuario
  const getUserColor = () => {
    if (!user) return "bg-slate-800";
    return user.type === "profesor" ? "bg-emerald-700" : "bg-blue-700";
  };

  const getNavigationItems = () => {
    const baseItems = [
      { key: "home", label: "Inicio", icon: FaChessQueen },
      { key: "play", label: "Jugar", icon: FaPlay },
      { key: "puzzles", label: "Puzzles", icon: FaPuzzlePiece },
      { key: "learn", label: "Lecciones", icon: FaBook },
      { key: "stats", label: "Estadísticas", icon: FaChartBar },
    ];

    if (user?.type === "profesor") {
      baseItems.push(
        { key: "classrooms", label: "Aulas", icon: FaChalkboardTeacher },
        { key: "teacher-panel", label: "Panel Profesor", icon: FaCrown }
      );
    }

    return baseItems;
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
            {getNavigationItems().map(({ key, label, icon: IconComponent }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
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
          {getNavigationItems().map(({ key, label, icon: IconComponent }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
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
