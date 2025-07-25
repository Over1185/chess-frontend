import ChessBoardPractice from "../components/ChessBoardPractice";
import { FaPlay, FaUser, FaChartBar, FaBook } from "react-icons/fa";

export default function HomeView({ user, setCurrentView }) {
  return (
    <div className="flex flex-col lg:flex-row p-6 gap-8 max-w-7xl mx-auto">
      {/* Tablero */}
      <section className="flex-1 max-w-[500px] mx-auto lg:mx-0">
        <ChessBoardPractice />
      </section>

      {/* Panel lateral */}
      <section className="flex flex-col space-y-4 max-w-sm mx-auto lg:mx-0">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView("play")}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              <FaPlay />
              <span>Jugar con un extraño</span>
            </button>
            <button
              onClick={() => setCurrentView("play")}
              className="btn btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <FaUser />
              <span>Jugar contra un amigo</span>
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className="btn btn-accent w-full flex items-center justify-center space-x-2"
              disabled={!user}
            >
              <FaChartBar />
              <span>Ver estadísticas</span>
            </button>
            <button
              onClick={() => setCurrentView("classrooms")}
              className="btn btn-info w-full flex items-center justify-center space-x-2"
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
                <strong>Tipo:</strong> {user.type === "teacher" ? "Profesor" : "Estudiante"}
              </p>
              <p>
                <strong>Rating:</strong> {user.rating}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
