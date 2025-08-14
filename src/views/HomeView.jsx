import {
    FaPlay,
    FaPuzzlePiece,
    FaBook,
    FaChartBar,
    FaTrophy,
    FaUsers,
    FaSpinner,
    FaCrown
} from "react-icons/fa";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/auth";

export default function HomeView({ user }) {
    const navigate = useNavigate();
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);

    const obtenerEstadisticas = useCallback(async () => {
        try {
            setLoading(true);
            const response = await authFetch(`/estadisticas/${user.username}`);
            const data = await response.json();
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            setEstadisticas(null);
        } finally {
            setLoading(false);
        }
    }, [user.username]);

    useEffect(() => {
        if (user?.username) {
            obtenerEstadisticas();
        }
    }, [user, obtenerEstadisticas]);

    // Configurar acciones rápidas según el tipo de usuario
    const quickActions = user?.type === "profesor" ? [
        // Acciones para profesores
        {
            key: "play",
            title: "Jugar",
            description: "Inicia una nueva partida",
            icon: FaPlay,
            color: "bg-blue-500 hover:bg-blue-600",
            primary: true,
            path: "/play"
        },
        {
            key: "stats",
            title: "Estadísticas",
            description: "Ve tu progreso",
            icon: FaChartBar,
            color: "bg-indigo-500 hover:bg-indigo-600",
            path: "/stats"
        },
        {
            key: "teacher-panel",
            title: "Panel del Profesor",
            description: "Gestiona estudiantes y contenido",
            icon: FaCrown,
            color: "bg-emerald-500 hover:bg-emerald-600",
            primary: true,
            path: "/teacher-panel"
        }
    ] : [
        // Acciones para usuarios regulares
        {
            key: "play",
            title: "Jugar",
            description: "Inicia una nueva partida",
            icon: FaPlay,
            color: "bg-blue-500 hover:bg-blue-600",
            primary: true,
            path: "/play"
        },
        {
            key: "puzzles",
            title: "Puzzles",
            description: "Resuelve problemas tácticos",
            icon: FaPuzzlePiece,
            color: "bg-purple-500 hover:bg-purple-600",
            path: "/puzzles"
        },
        {
            key: "learn",
            title: "Lecciones",
            description: "Aprende nuevas técnicas",
            icon: FaBook,
            color: "bg-green-500 hover:bg-green-600",
            path: "/learn"
        },
        {
            key: "stats",
            title: "Estadísticas",
            description: "Ve tu progreso",
            icon: FaChartBar,
            color: "bg-indigo-500 hover:bg-indigo-600",
            path: "/stats"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Bienvenida */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        ¡Bienvenido de vuelta, {user?.name || user?.username}!
                    </h1>
                    <p className="text-xl text-gray-600">
                        {user?.type === "profesor"
                            ? "Gestiona tus clases y estudiantes"
                            : "Continúa tu entrenamiento de ajedrez"
                        }
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Estadísticas del usuario */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Tu Progreso</h3>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <FaSpinner className="text-2xl text-indigo-600 animate-spin mr-2" />
                                    <span className="text-gray-600">Cargando estadísticas...</span>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <FaTrophy className="text-3xl text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Rating ELO</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {estadisticas?.usuario?.elo || user?.rating || 1200}
                                        </p>
                                        <p className="text-xs font-medium text-indigo-600 mt-1">
                                            {(() => {
                                                const elo = estadisticas?.usuario?.elo || user?.rating || 1200;
                                                return elo < 1000 ? 'Principiante' :
                                                    elo < 1400 ? 'Intermedio' :
                                                        elo < 1800 ? 'Avanzado' : 'Experto';
                                            })()}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <FaUsers className="text-3xl text-green-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Partidas Jugadas</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {estadisticas?.estadisticas?.partidas_jugadas || 0}
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <FaPuzzlePiece className="text-3xl text-purple-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Puzzles Resueltos</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {estadisticas?.estadisticas?.puzzles_resueltos || 0}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            {quickActions.map(({ key, title, description, icon: Icon, color, primary, path }) => (
                                <button
                                    key={key}
                                    onClick={() => navigate(path)}
                                    className={`w-full p-4 rounded-lg text-white font-medium transition-all transform hover:scale-105 active:scale-95 ${color} ${primary ? "shadow-lg" : "shadow-md"} flex items-center justify-between`}
                                >
                                    <div className="text-left">
                                        <h4 className="font-bold">{title}</h4>
                                        <p className="text-sm opacity-90">{description}</p>
                                    </div>
                                    <Icon className="text-2xl" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actividad reciente */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h3>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <FaSpinner className="text-xl text-indigo-600 animate-spin mr-2" />
                            <span className="text-gray-600">Cargando actividad...</span>
                        </div>
                    ) : estadisticas?.partidas_recientes?.length > 0 ? (
                        <div className="space-y-3">
                            {estadisticas.partidas_recientes.slice(0, 3).map((partida, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${partida.resultado === 'Victoria' ? 'bg-green-500' :
                                            partida.resultado === 'Derrota' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                            }`}></div>
                                        <div>
                                            <p className="font-medium">vs {partida.oponente}</p>
                                            <p className="text-sm text-gray-600">{partida.color} • {partida.resultado}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">{partida.fecha}</span>
                                </div>
                            ))}
                            {estadisticas.partidas_recientes.length > 3 && (
                                <button
                                    onClick={() => navigate('/stats')}
                                    className="w-full text-center text-indigo-600 hover:text-indigo-800 text-sm font-medium py-2"
                                >
                                    Ver todas las partidas
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No hay actividad reciente. ¡Comienza jugando una partida!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}