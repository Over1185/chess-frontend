import { useState, useEffect } from "react";
import {
    FaUsers,
    FaGamepad,
    FaChalkboardTeacher,
    FaChartBar,
    FaUserShield,
    FaPlus,
    FaEdit,
    FaTrash,
    FaCrown,
    FaEye,
    FaSpinner,
    FaUserPlus,
    FaUserGraduate
} from "react-icons/fa";
import { authFetch } from "../utils/auth";

export default function AdminPanelView() {
    const [activeTab, setActiveTab] = useState("students");
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [games, setGames] = useState([]);
    const [statistics, setStatistics] = useState(null);

    // Función para cargar estudiantes
    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await authFetch("/admin/estudiantes");
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar partidas
    const loadGames = async () => {
        setLoading(true);
        try {
            const response = await authFetch("/admin/partidas");
            if (response.ok) {
                const data = await response.json();
                setGames(data);
            }
        } catch (error) {
            console.error("Error cargando partidas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar estadísticas generales
    const loadStatistics = async () => {
        setLoading(true);
        try {
            const response = await authFetch("/admin/estadisticas-generales");
            if (response.ok) {
                const data = await response.json();
                setStatistics(data);
            }
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "students") {
            loadStudents();
        } else if (activeTab === "games") {
            loadGames();
        } else if (activeTab === "stats") {
            loadStatistics();
        }
    }, [activeTab]);

    const tabs = [
        { key: "students", label: "Estudiantes", icon: FaUserGraduate, count: students.length },
        { key: "games", label: "Partidas", icon: FaGamepad, count: games.length },
        { key: "stats", label: "Estadísticas", icon: FaChartBar, count: null },
        { key: "management", label: "Gestión", icon: FaUserShield, count: null }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header del Panel */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                        <FaCrown className="text-3xl text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Panel de Administración
                    </h1>
                    <p className="text-xl text-gray-600">
                        Gestiona estudiantes, partidas y el contenido de la plataforma
                    </p>
                </div>

                {/* Tabs de navegación */}
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="flex flex-wrap border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 min-w-0 px-6 py-4 text-center transition-all duration-200 ${activeTab === tab.key
                                        ? "bg-emerald-500 text-white shadow-lg"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <tab.icon className="inline mr-2 text-lg" />
                                <span className="font-medium">{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${activeTab === tab.key
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-200 text-gray-600"
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenido de cada tab */}
                    <div className="p-6">
                        {/* Tab de Estudiantes */}
                        {activeTab === "students" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Gestión de Estudiantes
                                    </h2>
                                    <button
                                        onClick={() => alert("Función en desarrollo")}
                                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                                    >
                                        <FaUserPlus />
                                        <span>Crear Estudiante</span>
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="text-3xl text-emerald-500 animate-spin mr-3" />
                                        <span className="text-gray-600">Cargando estudiantes...</span>
                                    </div>
                                ) : students.length > 0 ? (
                                    <div className="grid gap-4">
                                        {students.map((student) => (
                                            <div key={student._id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <FaUserGraduate className="text-white text-lg" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{student.username}</h3>
                                                        <p className="text-sm text-gray-600">{student.email}</p>
                                                        <p className="text-xs text-gray-500">ELO: {student.elo || 1200}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => alert("Ver detalles en desarrollo")}
                                                        className="text-blue-500 hover:text-blue-700 p-2"
                                                        title="Ver detalles"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="text-emerald-500 hover:text-emerald-700 p-2"
                                                        title="Editar"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-2"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaUserGraduate className="text-6xl mx-auto mb-4 opacity-30" />
                                        <p className="text-xl">No hay estudiantes registrados</p>
                                        <p className="text-sm">Los estudiantes aparecerán aquí cuando se registren</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab de Partidas */}
                        {activeTab === "games" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Partidas del Sistema
                                </h2>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="text-3xl text-emerald-500 animate-spin mr-3" />
                                        <span className="text-gray-600">Cargando partidas...</span>
                                    </div>
                                ) : games.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Jugadores</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Resultado</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Duración</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {games.map((game) => (
                                                    <tr key={game._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm">
                                                                <span className="font-medium">{game.white_player}</span>
                                                                <span className="text-gray-500"> vs </span>
                                                                <span className="font-medium">{game.black_player}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${game.winner === 'draw' ? 'bg-yellow-100 text-yellow-800' :
                                                                    game.winner ? 'bg-green-100 text-green-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {game.winner === 'draw' ? 'Tablas' :
                                                                    game.winner ? `Ganó ${game.winner}` : 'En progreso'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {game.duration || "N/A"}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {game.created_at ? new Date(game.created_at).toLocaleDateString() : "N/A"}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                className="text-blue-500 hover:text-blue-700 p-1"
                                                                title="Ver partida"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaGamepad className="text-6xl mx-auto mb-4 opacity-30" />
                                        <p className="text-xl">No hay partidas registradas</p>
                                        <p className="text-sm">Las partidas aparecerán aquí cuando los estudiantes jueguen</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab de Estadísticas */}
                        {activeTab === "stats" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Estadísticas Generales
                                </h2>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="text-3xl text-emerald-500 animate-spin mr-3" />
                                        <span className="text-gray-600">Cargando estadísticas...</span>
                                    </div>
                                ) : statistics ? (
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50 rounded-xl p-6 text-center">
                                            <FaUsers className="text-4xl text-blue-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-blue-800">Total Usuarios</h3>
                                            <p className="text-3xl font-bold text-blue-600">{statistics.total_users || 0}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-xl p-6 text-center">
                                            <FaGamepad className="text-4xl text-green-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-green-800">Total Partidas</h3>
                                            <p className="text-3xl font-bold text-green-600">{statistics.total_games || 0}</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-6 text-center">
                                            <FaChartBar className="text-4xl text-purple-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-purple-800">ELO Promedio</h3>
                                            <p className="text-3xl font-bold text-purple-600">{statistics.average_elo || 1200}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaChartBar className="text-6xl mx-auto mb-4 opacity-30" />
                                        <p className="text-xl">No hay estadísticas disponibles</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab de Gestión */}
                        {activeTab === "management" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Herramientas de Gestión
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                                            <FaChalkboardTeacher className="inline mr-2" />
                                            Gestión de Contenido
                                        </h3>
                                        <div className="space-y-3">
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Gestionar Lecciones
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Gestionar Puzzles
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Configurar Aulas
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                                            <FaUserShield className="inline mr-2" />
                                            Administración
                                        </h3>
                                        <div className="space-y-3">
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-100 transition-colors">
                                                Configuración del Sistema
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-100 transition-colors">
                                                Backup de Datos
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-emerald-100 transition-colors">
                                                Logs del Sistema
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
