import { FaChessQueen, FaUser, FaChalkboardTeacher, FaSignOutAlt } from "react-icons/fa";

export default function Header({ user, onLogout, setCurrentView }) {
  // Colores según tipo de usuario
  const getUserColor = () => {
    if (!user) return "bg-purple-700";
    return user.type === "profesor" ? "bg-emerald-700" : "bg-blue-700";
  };

  return (
    <header className={`flex justify-between items-center ${getUserColor()} text-white px-6 py-4 shadow-lg`}>
      <div className="flex items-center space-x-6">
        <FaChessQueen className="text-4xl text-white" />
        <nav className="flex space-x-6 font-semibold">
          {["home", "puzzles", "learn", "play"].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view)}
              className="hover:text-purple-300 transition-colors"
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {!user ? (
          <div className="space-x-3">
            <button
              onClick={() => setCurrentView("register")}
              className="btn btn-outline btn-sm border-white text-white hover:bg-purple-600"
            >
              Registrarse
            </button>
            <button onClick={() => setCurrentView("login")} className="btn btn-sm btn-accent">
              Iniciar sesión
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {user.type === "teacher" ? (
                <FaChalkboardTeacher className="text-xl" />
              ) : (
                <FaUser className="text-xl" />
              )}
              <div>
                <span className="font-semibold">{user.name}</span>
                <div className="text-xs opacity-75">
                  {user.type === "teacher" ? "profesor" : "user"} • Rating: {user.rating}
                </div>
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-sm btn-warning">
              <FaSignOutAlt />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
