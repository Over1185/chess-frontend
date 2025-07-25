import { FaChartBar, FaPuzzlePiece } from "react-icons/fa";

export default function StatsView({ user, onBack }) {
  if (!user)
    return (
      <div className="p-6 text-center text-red-600">
        Debes iniciar sesión para ver estadísticas
        <br />
        <button onClick={onBack} className="btn btn-outline mt-4">
          Volver al Home
        </button>
      </div>
    );

  const stats = {
    gamesPlayed: 45,
    wins: 28,
    losses: 12,
    draws: 5,
    winRate: 62,
    puzzlesSolved: 134,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Mis Estadísticas</h1>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <FaChartBar className="text-4xl text-blue-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{stats.gamesPlayed}</h3>
          <p className="text-gray-600">Partidas Jugadas</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl text-green-500 mx-auto mb-2">🏆</div>
          <h3 className="text-2xl font-bold">{stats.wins}</h3>
          <p className="text-gray-600">Victorias</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl text-red-500 mx-auto mb-2">❌</div>
          <h3 className="text-2xl font-bold">{stats.losses}</h3>
          <p className="text-gray-600">Derrotas</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl text-yellow-500 mx-auto mb-2">🤝</div>
          <h3 className="text-2xl font-bold">{stats.draws}</h3>
          <p className="text-gray-600">Empates</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-4xl text-purple-500 mx-auto mb-2">📊</div>
          <h3 className="text-2xl font-bold">{stats.winRate}%</h3>
          <p className="text-gray-600">Tasa de Victoria</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <FaPuzzlePiece className="text-4xl text-orange-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{stats.puzzlesSolved}</h3>
          <p className="text-gray-600">Puzzles Resueltos</p>
        </div>
      </div>
    </div>
  );
}
