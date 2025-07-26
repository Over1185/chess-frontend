import { FaChartBar, FaPuzzlePiece } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function StatsView({ user, onBack }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener datos del usuario desde el API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username && !user?.id) {
        setError("No se encontró información del usuario");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Usar el username o id del usuario logueado
        const userId = user.username || user.id;
        const response = await fetch(`http://localhost:8000/perfil/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Mostrar error si no hay usuario
  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        Debes iniciar sesión para ver estadísticas
        <br />
        <button onClick={onBack} className="btn btn-outline mt-4">
          Volver al Home
        </button>
      </div>
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
        <p className="text-gray-600">Cargando estadísticas...</p>
        <button onClick={onBack} className="btn btn-outline mt-4">
          Volver al Home
        </button>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Error al cargar estadísticas</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary mr-4"
        >
          Reintentar
        </button>
        <button onClick={onBack} className="btn btn-outline">
          Volver al Home
        </button>
      </div>
    );
  }

  // Usar datos del API con la estructura correcta
  const stats = {
    gamesPlayed: userData?.partidas?.total || 0,
    wins: userData?.partidas?.victorias || 0,
    losses: userData?.partidas?.derrotas || 0,
    draws: userData?.partidas?.tablas || 0,
    winRate: userData?.partidas?.total > 0 ? Math.round((userData.partidas.victorias / userData.partidas.total) * 100) : 0,
    puzzlesSolved: userData?.puzzles?.resueltos_correctamente || 0,
    puzzlesFailed: userData?.puzzles?.resueltos_incorrectamente || 0,
    elo: userData?.elo || 1200
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Mis Estadísticas</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-ghost btn-sm"
            title="Actualizar datos"
          >
            🔄
          </button>
          <button onClick={onBack} className="btn btn-outline">
            Volver al Home
          </button>
        </div>
      </div>

      {/* Mostrar nombre del usuario */}
      <div className="text-center mb-4">
        <h2 className="text-xl text-gray-600">
          Estadísticas de: <span className="font-bold text-purple-600">
            {userData?.username || userData?.nombre || user?.username || 'Usuario'}
          </span>
        </h2>
      </div>

      {/* Tarjeta de ELO destacada */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-center text-white mb-6">
        <h2 className="text-3xl font-bold mb-2">Rating ELO</h2>
        <div className="text-5xl font-bold">{stats.elo}</div>
        <p className="text-purple-200 mt-2">Tu puntuación actual</p>
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
          <FaPuzzlePiece className="text-4xl text-green-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{stats.puzzlesSolved}</h3>
          <p className="text-gray-600">Puzzles Correctos</p>
        </div>

        {/* Nueva tarjeta para puzzles incorrectos */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center md:col-span-2 lg:col-span-1">
          <FaPuzzlePiece className="text-4xl text-red-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold">{stats.puzzlesFailed}</h3>
          <p className="text-gray-600">Puzzles Incorrectos</p>
        </div>

        {/* Tarjeta de lecciones vistas */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center md:col-span-2 lg:col-span-1">
          <div className="text-4xl text-blue-500 mx-auto mb-2">📚</div>
          <h3 className="text-2xl font-bold">
            {userData?.lecciones_vistas ? userData.lecciones_vistas.length : 0}
          </h3>
          <p className="text-gray-600">Lecciones Completadas</p>
        </div>

        {/* Tarjeta de aulas - temporalmente mostrar 0 hasta que tengas datos */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center md:col-span-2 lg:col-span-1">
          <div className="text-4xl text-orange-500 mx-auto mb-2">🏫</div>
          <h3 className="text-2xl font-bold">0</h3>
          <p className="text-gray-600">Aulas Activas</p>
        </div>
      </div>

      {/* Información adicional si hay historial de puzzles */}
      {userData?.puzzles?.historial && userData.puzzles.historial.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Actividad Reciente</h3>
          <p className="text-gray-600">
            Total de puzzles intentados: {userData.puzzles.historial.length}
          </p>
          <p className="text-gray-600">
            Precisión en puzzles: {
              userData.puzzles.historial.length > 0 
                ? Math.round((stats.puzzlesSolved / userData.puzzles.historial.length) * 100)
                : 0
            }%
          </p>
        </div>
      )}

      {/* Historial de partidas recientes */}
      {userData?.partidas?.historial && userData.partidas.historial.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Partidas Recientes</h3>
          <div className="grid gap-2 max-h-40 overflow-y-auto">
            {userData.partidas.historial.slice(0, 5).map((partida, index) => (
              <div key={partida.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">vs {partida.vs}</span>
                <span className={`text-sm font-bold ${
                  partida.resultado === 'win' ? 'text-green-600' : 
                  partida.resultado === 'loss' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {partida.resultado === 'win' ? '🏆' : 
                   partida.resultado === 'loss' ? '❌' : '🤝'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información de última actualización */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Datos actualizados: {new Date().toLocaleString()}
      </div>
    </div>
  );
}