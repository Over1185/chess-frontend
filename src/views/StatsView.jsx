import { FaChartBar, FaTrophy, FaPuzzlePiece, FaGamepad, FaClock, FaSpinner, FaChevronLeft, FaChevronRight, FaEye, FaUsers } from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import GameReplayModal from "../components/GameReplayModal";

export default function StatsView({ user }) {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentAchievementPage, setCurrentAchievementPage] = useState(1);
    const gamesPerPage = 6;
    const achievementsPerPage = 4;

    // Estados para el modal de replay
    const [showReplayModal, setShowReplayModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);

    // Función para manejar la visualización de una partida
    const handleViewGame = useCallback(async (partida) => {
        try {
            // Obtener los datos completos de la partida del backend
            const response = await fetch(`http://localhost:8000/games/${partida.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const gameData = await response.json();
                console.log('Datos de partida recibidos:', gameData);
                console.log('Tipo de moves en gameData:', typeof gameData.moves, gameData.moves);
                setSelectedGame(gameData);
                setShowReplayModal(true);
            } else {
                console.error('Error obteniendo datos de la partida:', response.statusText);
                alert('Error al cargar los datos de la partida');
            }
        } catch (error) {
            console.error('Error cargando partida:', error);
            alert('Error al cargar la partida');
        }
    }, []);

    // Función para cerrar el modal
    const handleCloseModal = useCallback(() => {
        setShowReplayModal(false);
        setSelectedGame(null);
    }, []);

    const obtenerEstadisticas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Para la ruta de estadísticas, no necesitamos autenticación
            const response = await fetch(`http://localhost:8000/estadisticas/${user.username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setEstadisticas(data);
            // Reiniciar a la primera página cuando se cargan nuevas estadísticas
            setCurrentPage(1);
            setCurrentAchievementPage(1);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user.username]);

    useEffect(() => {
        if (user?.username) {
            obtenerEstadisticas();
        }
    }, [user, obtenerEstadisticas]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="text-4xl text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar estadísticas</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={obtenerEstadisticas}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!estadisticas) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">No se pudieron cargar las estadísticas</p>
                </div>
            </div>
        );
    }

    const stats = estadisticas.estadisticas;
    const achievements = estadisticas.logros;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        <FaChartBar className="inline mr-3 text-indigo-600" />
                        Estadísticas y Progreso
                    </h1>
                    <p className="text-xl text-gray-600">
                        Revisa tu rendimiento y progreso en ajedrez
                    </p>
                </div>

                {/* Estadísticas principales */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Rating ELO</h3>
                        <p className="text-3xl font-bold text-yellow-600">{estadisticas.usuario.elo}</p>
                        <p className="text-sm font-medium text-indigo-600 mt-2">
                            {estadisticas.usuario.elo < 1000 ? 'Principiante' :
                                estadisticas.usuario.elo < 1400 ? 'Intermedio' :
                                    estadisticas.usuario.elo < 1800 ? 'Avanzado' : 'Experto'}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaGamepad className="text-4xl text-blue-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Partidas</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.partidas_jugadas}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaPuzzlePiece className="text-4xl text-purple-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Puzzles</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.puzzles_resueltos}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaClock className="text-4xl text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Tiempo Total</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.tiempo_total}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Estadísticas de partidas */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaUsers className="mr-2 text-blue-500" />
                            Rendimiento en Partidas
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Partidas Ganadas</span>
                                <span className="font-semibold text-green-600">{stats.victorias}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Partidas Perdidas</span>
                                <span className="font-semibold text-red-600">{stats.derrotas}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Partidas Empatadas</span>
                                <span className="font-semibold text-yellow-600">{stats.tablas}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Porcentaje de Victoria</span>
                                <span className="font-semibold text-blue-600">{stats.winrate}%</span>
                            </div>
                        </div>

                        {/* Progreso de Rating */}
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-700 mb-3">Progreso de Rating (Últimas partidas)</h4>
                            {estadisticas.historial_rating.length > 0 ? (
                                <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end space-x-1">
                                    {estadisticas.historial_rating.map((punto, index) => (
                                        <div key={index} className="flex-1 bg-indigo-500 rounded-t"
                                            style={{ height: `${(punto.elo - 800) / 10}px` }}
                                            title={`Partida ${punto.partida}: ${punto.elo} ELO`}>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">No hay datos de progreso aún</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logros */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaTrophy className="mr-2 text-yellow-500" />
                            Logros ({achievements.filter(a => a.earned).length}/{achievements.length})
                        </h3>

                        {(() => {
                            const totalAchievements = achievements.length;
                            const totalAchievementPages = Math.ceil(totalAchievements / achievementsPerPage);
                            const startIndex = (currentAchievementPage - 1) * achievementsPerPage;
                            const endIndex = startIndex + achievementsPerPage;
                            const currentAchievements = achievements.slice(startIndex, endIndex);

                            return (
                                <>
                                    <div className="space-y-3">
                                        {currentAchievements.map((achievement) => (
                                            <div
                                                key={achievement.name}
                                                className={`p-4 rounded-lg border-2 transition-all ${achievement.earned
                                                    ? 'border-green-200 bg-green-50 shadow-sm'
                                                    : 'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <FaTrophy className={`text-xl ${achievement.earned ? 'text-yellow-500' : 'text-gray-400'
                                                        }`} />
                                                    <div>
                                                        <h4 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'
                                                            }`}>
                                                            {achievement.name}
                                                            {achievement.earned && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">✓ Conseguido</span>}
                                                        </h4>
                                                        <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                            {achievement.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Paginación de logros - solo se muestra cuando hay más de 4 logros */}
                                    {totalAchievements > achievementsPerPage && (
                                        <div className="mt-6 flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                Mostrando {startIndex + 1}-{Math.min(endIndex, totalAchievements)} de {totalAchievements} logros
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {/* Botón página anterior */}
                                                <button
                                                    onClick={() => setCurrentAchievementPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentAchievementPage === 1}
                                                    className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${currentAchievementPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                        }`}
                                                >
                                                    <FaChevronLeft className="w-3 h-3" />
                                                    <span>Anterior</span>
                                                </button>

                                                {/* Números de página */}
                                                <div className="flex space-x-1">
                                                    {Array.from({ length: totalAchievementPages }, (_, i) => i + 1).map(pageNumber => (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => setCurrentAchievementPage(pageNumber)}
                                                            className={`px-3 py-2 rounded-lg transition-colors ${currentAchievementPage === pageNumber
                                                                ? 'bg-yellow-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Botón página siguiente */}
                                                <button
                                                    onClick={() => setCurrentAchievementPage(prev => Math.min(prev + 1, totalAchievementPages))}
                                                    disabled={currentAchievementPage === totalAchievementPages}
                                                    className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${currentAchievementPage === totalAchievementPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                        }`}
                                                >
                                                    <span>Siguiente</span>
                                                    <FaChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Partidas Recientes */}
                {estadisticas.partidas_recientes.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaGamepad className="mr-2 text-blue-500" />
                            Partidas Recientes
                        </h3>

                        {(() => {
                            const totalGames = estadisticas.partidas_recientes.length;
                            const totalPages = Math.ceil(totalGames / gamesPerPage);
                            const startIndex = (currentPage - 1) * gamesPerPage;
                            const endIndex = startIndex + gamesPerPage;
                            const currentGames = estadisticas.partidas_recientes.slice(startIndex, endIndex);

                            return (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="pb-2 text-gray-600">Oponente</th>
                                                    <th className="pb-2 text-gray-600">Color</th>
                                                    <th className="pb-2 text-gray-600">Resultado</th>
                                                    <th className="pb-2 text-gray-600">Fecha</th>
                                                    <th className="pb-2 text-gray-600">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentGames.map((partida, index) => (
                                                    <tr key={startIndex + index} className="border-b last:border-b-0">
                                                        <td className="py-3 font-medium">{partida.oponente}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded text-xs ${partida.color === 'Blancas' ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'}`}>
                                                                {partida.color}
                                                            </span>
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${partida.resultado === 'Victoria' ? 'bg-green-100 text-green-800' :
                                                                partida.resultado === 'Derrota' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {partida.resultado}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-gray-600">{partida.fecha || 'Sin fecha'}</td>
                                                        <td className="py-3">
                                                            <button
                                                                onClick={() => handleViewGame(partida)}
                                                                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                                                title="Ver replay de la partida"
                                                            >
                                                                <FaEye className="w-3 h-3" />
                                                                <span>Ver</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Paginación - solo se muestra cuando hay más de 6 partidas */}
                                    {totalGames > gamesPerPage && (
                                        <div className="mt-6 flex justify-between items-center">
                                            <div className="text-sm text-gray-600">
                                                Mostrando {startIndex + 1}-{Math.min(endIndex, totalGames)} de {totalGames} partidas
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {/* Botón página anterior */}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${currentPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        }`}
                                                >
                                                    <FaChevronLeft className="w-3 h-3" />
                                                    <span>Anterior</span>
                                                </button>

                                                {/* Números de página */}
                                                <div className="flex space-x-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            className={`px-3 py-2 rounded-lg transition-colors ${currentPage === pageNumber
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Botón página siguiente */}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${currentPage === totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                                        }`}
                                                >
                                                    <span>Siguiente</span>
                                                    <FaChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Modal de replay de partida */}
            <GameReplayModal
                isOpen={showReplayModal}
                onClose={handleCloseModal}
                gameData={selectedGame}
                playerUsername={user?.username}
            />
        </div>
    );
}
