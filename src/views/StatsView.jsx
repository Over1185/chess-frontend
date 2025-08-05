import { FaChartBar, FaTrophy, FaUsers, FaPuzzlePiece, FaGamepad, FaClock, FaSpinner } from "react-icons/fa";
import { useState, useEffect } from "react";
import { authFetch } from "../utils/auth";

export default function StatsView({ user }) {
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.username) {
            obtenerEstadisticas();
        }
    }, [user]);

    const obtenerEstadisticas = async () => {
        try {
            setLoading(true);
            const response = await authFetch(`/estadisticas/${user.username}`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setEstadisticas(data);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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

                        <div className="space-y-3">
                            {achievements.map((achievement) => (
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
                    </div>
                </div>

                {/* Partidas Recientes */}
                {estadisticas.partidas_recientes.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaGamepad className="mr-2 text-blue-500" />
                            Partidas Recientes
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-2 text-gray-600">Oponente</th>
                                        <th className="pb-2 text-gray-600">Color</th>
                                        <th className="pb-2 text-gray-600">Resultado</th>
                                        <th className="pb-2 text-gray-600">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estadisticas.partidas_recientes.map((partida, index) => (
                                        <tr key={index} className="border-b last:border-b-0">
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Estadísticas adicionales */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaPuzzlePiece className="mr-2 text-purple-500" />
                            Rendimiento en Puzzles
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Puzzles Resueltos</span>
                                <span className="font-semibold text-purple-600">{stats.puzzles_resueltos}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Intentados</span>
                                <span className="font-semibold text-gray-600">{stats.puzzles_totales}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Tasa de Éxito</span>
                                <span className="font-semibold text-purple-600">
                                    {stats.puzzles_totales > 0 ? Math.round((stats.puzzles_resueltos / stats.puzzles_totales) * 100) : 0}%
                                </span>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mt-4">
                            <div className="bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-purple-500 rounded-full h-3 transition-all duration-300"
                                    style={{
                                        width: `${stats.puzzles_totales > 0 ? (stats.puzzles_resueltos / stats.puzzles_totales) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaUsers className="mr-2 text-indigo-500" />
                            Información del Jugador
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Nombre de Usuario</span>
                                <span className="font-semibold text-gray-800">{estadisticas.usuario.username}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Rol</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${estadisticas.usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                                    estadisticas.usuario.rol === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {estadisticas.usuario.rol === 'admin' ? 'Administrador' :
                                        estadisticas.usuario.rol === 'teacher' ? 'Profesor' : 'Estudiante'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Rating Actual</span>
                                <span className="font-semibold text-yellow-600">{estadisticas.usuario.elo} ELO</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Nivel</span>
                                <span className="font-semibold text-indigo-600">
                                    {estadisticas.usuario.elo < 1000 ? 'Principiante' :
                                        estadisticas.usuario.elo < 1400 ? 'Intermedio' :
                                            estadisticas.usuario.elo < 1800 ? 'Avanzado' : 'Experto'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
