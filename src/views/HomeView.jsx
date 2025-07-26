import ChessBoardPractice from "../components/ChessBoardPractice";
import { FaPlay, FaUser, FaChartBar, FaBook } from "react-icons/fa";

export default function HomeView({ user, setCurrentView }) {
  // Función para obtener el color del botón según el tipo de usuario
  const getButtonStyle = (baseStyle) => {
    if (!user) return baseStyle; // Si no hay usuario, usar estilo por defecto
    
    if (user.type === "profesor") {
      // Colores para profesores (azul)
      return `${baseStyle} bg-blue-600 hover:bg-blue-700 text-white border-blue-600`;
    } else {
      // Colores para estudiantes (verde)
      return `${baseStyle} bg-green-600 hover:bg-green-700 text-white border-green-600`;
    }
  };

  const getSecondaryButtonStyle = (baseStyle) => {
    if (!user) return baseStyle;
    
    if (user.type === "profesor") {
      return `${baseStyle} border-blue-600 text-blue-600 hover:bg-blue-50`;
    } else {
      return `${baseStyle} border-green-600 text-green-600 hover:bg-green-50`;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row p-6 gap-8 max-w-full mx-auto">
      {/* Tablero */}
      <section className="flex-1 flex justify-center">
        <ChessBoardPractice />
      </section>

      {/* Panel lateral */}
      <section className="flex flex-col space-y-4 max-w-sm mx-auto xl:mx-0 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView("play")}
              className={getButtonStyle("w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors")}
            >
              <FaPlay />
              <span>Jugar con un extraño</span>
            </button>
            <button
              onClick={() => setCurrentView("play")}
              className={getSecondaryButtonStyle("w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors border")}
            >
              <FaUser />
              <span>Jugar contra un amigo</span>
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={getButtonStyle("w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed")}
              disabled={!user}
            >
              <FaChartBar />
              <span>Ver estadísticas</span>
            </button>
            <button
              onClick={() => setCurrentView("classrooms")}
              className={getSecondaryButtonStyle("w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors border")}
            >
              <FaBook />
              <span>Ver aulas</span>
            </button>
          </div>
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Mi Perfil</h3>
            <div className="space-y-2">
              <p>
                <strong>Usuario:</strong> {user.name}
              </p>
              <p>
                <strong>Tipo:</strong> {user.type === "profesor" ? "Profesor" : "Estudiante"}
              </p>
              <p>
                <strong>Rating (ELO):</strong> {user.rating}
              </p>
              {user.email && (
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}