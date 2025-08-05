import { useState, useEffect } from "react";
import {
    FaUsers,
    FaGamepad,
    FaChalkboardTeacher,
    FaChartBar,
    FaUserShield,
    FaEdit,
    FaTrash,
    FaCrown,
    FaEye,
    FaSpinner,
    FaUserGraduate,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTrophy,
    FaCalendarDay,
    FaBook,
    FaPuzzlePiece,
    FaCog,
    FaArrowLeft
} from "react-icons/fa";
import { authFetch } from "../utils/auth";

export default function TeacherPanelView({ onBack, user }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [games, setGames] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editForm, setEditForm] = useState({ username: "", email: "", elo: "" });
    const [viewingStudent, setViewingStudent] = useState(null);
    const [studentDetails, setStudentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Función para cargar estudiantes
    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await authFetch("/admin/estudiantes");
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            } else {
                console.error("Error al cargar estudiantes:", response.status);
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
            } else {
                console.error("Error al cargar partidas:", response.status);
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
            } else {
                console.error("Error al cargar estadísticas:", response.status);
            }
        } catch (error) {
            console.error("Error cargando estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar estudiante
    const deleteStudent = async (studentId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este estudiante? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await authFetch(`/admin/estudiante/${studentId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setStudents(students.filter(s => s._id !== studentId));
            } else {
                console.warn("Error al eliminar estudiante");
            }
        } catch (error) {
            console.error("Error eliminando estudiante:", error);
        }
    };

    // Función para ver detalles del estudiante
    const viewStudentDetails = async (student) => {
        setViewingStudent(student._id);
        setLoadingDetails(true);

        try {
            // Cargar estadísticas específicas del estudiante
            const response = await authFetch(`/admin/estudiante/${student._id}/detalles`);

            if (response.ok) {
                const details = await response.json();

                // Usar los datos del endpoint con los datos del estudiante básico
                setStudentDetails({
                    _id: student._id,
                    username: details.username || student.username,
                    email: details.email || student.email,
                    elo: details.elo_actual || student.elo || 1200,
                    partidas_jugadas: details.partidas_jugadas || 0,
                    partidas_ganadas: details.partidas_ganadas || 0,
                    partidas_perdidas: details.partidas_perdidas || 0,
                    partidas_empatadas: details.partidas_empatadas || 0,
                    puzzles_resueltos: details.puzzles_resueltos || 0,
                    lecciones_completadas: details.lecciones_completadas || 0,
                    fecha_registro: details.fecha_registro || "No disponible",
                    ultima_conexion: details.ultima_conexion || "No disponible"
                });
            } else {
                console.error("Error al obtener detalles:", response.status);
                // Si el endpoint falla, usar datos básicos
                setStudentDetails({
                    _id: student._id,
                    username: student.username,
                    email: student.email,
                    elo: student.elo || 1200,
                    partidas_jugadas: 0,
                    partidas_ganadas: 0,
                    partidas_perdidas: 0,
                    partidas_empatadas: 0,
                    puzzles_resueltos: 0,
                    lecciones_completadas: 0,
                    fecha_registro: "No disponible",
                    ultima_conexion: "No disponible"
                });
            }
        } catch (error) {
            console.error("Error cargando detalles del estudiante:", error);
            // Usar datos básicos en caso de error
            setStudentDetails({
                _id: student._id,
                username: student.username,
                email: student.email,
                elo: student.elo || 1200,
                partidas_jugadas: 0,
                partidas_ganadas: 0,
                partidas_perdidas: 0,
                partidas_empatadas: 0,
                puzzles_resueltos: 0,
                lecciones_completadas: 0,
                fecha_registro: "No disponible",
                ultima_conexion: "No disponible"
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    // Función para cerrar detalles del estudiante
    const closeStudentDetails = () => {
        setViewingStudent(null);
        setStudentDetails(null);
        setLoadingDetails(false);
    };

    // Función para iniciar edición
    const startEdit = (student) => {
        setEditingStudent(student._id);
        setEditForm({
            username: student.username,
            email: student.email,
            elo: student.elo.toString()
        });
    };

    // Función para cancelar edición
    const cancelEdit = () => {
        setEditingStudent(null);
        setEditForm({ username: "", email: "", elo: "" });
    };

    // Función para guardar cambios
    const saveEdit = async () => {
        try {
            const response = await authFetch(`/admin/estudiante/${editingStudent}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: editForm.username,
                    email: editForm.email,
                    elo: parseInt(editForm.elo)
                })
            });

            if (response.ok) {
                setStudents(students.map(s =>
                    s._id === editingStudent
                        ? { ...s, username: editForm.username, email: editForm.email, elo: parseInt(editForm.elo) }
                        : s
                ));
                cancelEdit();
            } else {
                console.warn("Error al actualizar estudiante");
            }
        } catch (error) {
            console.error("Error actualizando estudiante:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "students") {
            loadStudents();
        } else if (activeTab === "games") {
            loadGames();
        } else if (activeTab === "overview") {
            loadStatistics();
        }
    }, [activeTab]);

    const tabs = [
        { key: "overview", label: "Resumen", icon: FaChartBar, count: null },
        { key: "students", label: "Estudiantes", icon: FaUserGraduate, count: null },
        { key: "games", label: "Partidas", icon: FaGamepad, count: null },
        { key: "content", label: "Contenido", icon: FaChalkboardTeacher, count: null },
        { key: "settings", label: "Configuración", icon: FaUserShield, count: null }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header del Panel */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Volver al Inicio</span>
                    </button>
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                            <FaCrown className="text-3xl text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            Panel del Profesor
                        </h1>
                        <p className="text-xl text-gray-600">
                            Bienvenido, {user?.username || "Profesor"}
                        </p>
                    </div>
                    <div className="w-32"></div> {/* Espaciador */}
                </div>

                {/* Tabs de navegación */}
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="flex flex-wrap border-b">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 px-6 py-4 text-center transition-all duration-200 min-w-0 ${activeTab === tab.key
                                    ? "bg-emerald-500 text-white border-b-2 border-emerald-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                                    }`}
                            >
                                <tab.icon className="text-xl mx-auto mb-2" />
                                <span className="text-sm font-medium block truncate">{tab.label}</span>
                                {tab.count !== null && (
                                    <span className="text-xs opacity-75">({tab.count})</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Contenido de los tabs */}
                    <div className="p-6">
                        {/* Tab de Resumen */}
                        {activeTab === "overview" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Resumen del Sistema
                                </h2>

                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="text-3xl text-emerald-500 animate-spin mr-3" />
                                        <span className="text-gray-600">Cargando estadísticas...</span>
                                    </div>
                                ) : statistics ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-blue-100 text-sm">Total Estudiantes</p>
                                                    <p className="text-3xl font-bold">{statistics.total_estudiantes}</p>
                                                </div>
                                                <FaUserGraduate className="text-3xl text-blue-200" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-green-100 text-sm">Total Partidas</p>
                                                    <p className="text-3xl font-bold">{statistics.total_partidas}</p>
                                                </div>
                                                <FaGamepad className="text-3xl text-green-200" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-yellow-100 text-sm">ELO Promedio</p>
                                                    <p className="text-3xl font-bold">{statistics.average_elo}</p>
                                                </div>
                                                <FaTrophy className="text-3xl text-yellow-200" />
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-purple-100 text-sm">Partidas Hoy</p>
                                                    <p className="text-3xl font-bold">{statistics.partidas_24h}</p>
                                                </div>
                                                <FaCalendarDay className="text-3xl text-purple-200" />
                                            </div>
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

                        {/* Tab de Estudiantes */}
                        {activeTab === "students" && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Gestión de Estudiantes
                                    </h2>
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
                                                        {editingStudent === student._id ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={editForm.username}
                                                                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                                                    className="border rounded px-2 py-1 text-sm"
                                                                    placeholder="Nombre de usuario"
                                                                />
                                                                <input
                                                                    type="email"
                                                                    value={editForm.email}
                                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                                    className="border rounded px-2 py-1 text-sm"
                                                                    placeholder="Email"
                                                                />
                                                                <input
                                                                    type="number"
                                                                    value={editForm.elo}
                                                                    onChange={(e) => setEditForm({ ...editForm, elo: e.target.value })}
                                                                    className="border rounded px-2 py-1 text-sm w-20"
                                                                    placeholder="ELO"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h3 className="font-semibold text-gray-800">{student.username}</h3>
                                                                <p className="text-sm text-gray-600">{student.email}</p>
                                                                <p className="text-xs text-gray-500">ELO: {student.elo || 1200}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {editingStudent === student._id ? (
                                                        <>
                                                            <button
                                                                onClick={saveEdit}
                                                                className="text-green-500 hover:text-green-700 p-2"
                                                                title="Guardar"
                                                            >
                                                                <FaCheckCircle />
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="text-red-500 hover:text-red-700 p-2"
                                                                title="Cancelar"
                                                            >
                                                                <FaExclamationTriangle />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => viewStudentDetails(student)}
                                                                className="text-blue-500 hover:text-blue-700 p-2"
                                                                title="Ver detalles"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                onClick={() => startEdit(student)}
                                                                className="text-emerald-500 hover:text-emerald-700 p-2"
                                                                title="Editar"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteStudent(student._id)}
                                                                className="text-red-500 hover:text-red-700 p-2"
                                                                title="Eliminar"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </>
                                                    )}
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
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Jugador Blanco</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Jugador Negro</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Resultado</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                                    <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {games.map((game) => (
                                                    <tr key={game._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">{game.white_player}</td>
                                                        <td className="py-3 px-4">{game.black_player}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${game.winner === "draw"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : game.winner
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                                }`}>
                                                                {game.winner === "draw" ? "Tablas" : game.winner ? `Gana ${game.winner}` : "En curso"}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">
                                                            {game.timestamp ? new Date(game.timestamp).toLocaleDateString() : "N/A"}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => alert("Ver partida en desarrollo")}
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

                        {/* Tab de Contenido */}
                        {activeTab === "content" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Gestión de Contenido
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-blue-800 mb-4">
                                            <FaBook className="inline mr-2" />
                                            Lecciones
                                        </h3>
                                        <div className="space-y-3">
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Crear Nueva Lección
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Gestionar Lecciones
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors">
                                                Asignar Lecciones
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-purple-800 mb-4">
                                            <FaPuzzlePiece className="inline mr-2" />
                                            Puzzles
                                        </h3>
                                        <div className="space-y-3">
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors">
                                                Crear Nuevo Puzzle
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors">
                                                Gestionar Puzzles
                                            </button>
                                            <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-100 transition-colors">
                                                Categorías de Puzzles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab de Configuración */}
                        {activeTab === "settings" && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                    Configuración del Sistema
                                </h2>

                                <div className="text-center py-16">
                                    <FaCog className="text-6xl text-gray-300 mx-auto mb-6" />
                                    <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                                        Próximamente
                                    </h3>
                                    <p className="text-lg text-gray-500 mb-2">
                                        La configuración del sistema es una característica
                                    </p>
                                    <p className="text-lg text-gray-500">
                                        que se implementará en futuras versiones.
                                    </p>
                                    <div className="mt-8 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                                        <FaUserShield className="mr-2" />
                                        <span className="text-sm font-medium">En desarrollo</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalles del Estudiante */}
            {viewingStudent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header del Modal */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    Detalles del Estudiante
                                </h3>
                                <button
                                    onClick={closeStudentDetails}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loadingDetails ? (
                                <div className="flex items-center justify-center py-12">
                                    <FaSpinner className="text-3xl text-emerald-500 animate-spin mr-3" />
                                    <span className="text-gray-600">Cargando detalles...</span>
                                </div>
                            ) : studentDetails && (
                                <div className="space-y-6">
                                    {/* Información Básica */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-blue-800 mb-4">
                                            Información Personal
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Nombre de Usuario</p>
                                                <p className="font-medium text-gray-800">{studentDetails.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium text-gray-800">{studentDetails.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">ELO Actual</p>
                                                <p className="font-medium text-gray-800">{studentDetails.elo || 1200}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Fecha de Registro</p>
                                                <p className="font-medium text-gray-800">
                                                    {studentDetails.fecha_registro ?
                                                        new Date(studentDetails.fecha_registro).toLocaleDateString()
                                                        : "No disponible"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Estadísticas de Partidas */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-green-800 mb-4">
                                            Estadísticas de Partidas
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {studentDetails.partidas_jugadas}
                                                </p>
                                                <p className="text-sm text-gray-600">Jugadas</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {studentDetails.partidas_ganadas}
                                                </p>
                                                <p className="text-sm text-gray-600">Ganadas</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-red-600">
                                                    {studentDetails.partidas_perdidas}
                                                </p>
                                                <p className="text-sm text-gray-600">Perdidas</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {studentDetails.partidas_empatadas}
                                                </p>
                                                <p className="text-sm text-gray-600">Empates</p>
                                            </div>
                                        </div>
                                        {studentDetails.partidas_jugadas > 0 && (
                                            <div className="mt-4 text-center">
                                                <p className="text-sm text-gray-600">
                                                    Tasa de Victoria: {
                                                        Math.round((studentDetails.partidas_ganadas / studentDetails.partidas_jugadas) * 100)
                                                    }%
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progreso de Aprendizaje */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-purple-800 mb-4">
                                            Progreso de Aprendizaje
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="text-center p-4 bg-white rounded-lg">
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {studentDetails.puzzles_resueltos}
                                                </p>
                                                <p className="text-sm text-gray-600">Puzzles Resueltos</p>
                                            </div>
                                            <div className="text-center p-4 bg-white rounded-lg">
                                                <p className="text-2xl font-bold text-pink-600">
                                                    {studentDetails.lecciones_completadas}
                                                </p>
                                                <p className="text-sm text-gray-600">Lecciones Completadas</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad Reciente */}
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                                        <h4 className="text-lg font-semibold text-orange-800 mb-4">
                                            Actividad Reciente
                                        </h4>
                                        <div>
                                            <p className="text-sm text-gray-600">Última Conexión</p>
                                            <p className="font-medium text-gray-800">
                                                {studentDetails.ultima_conexion !== "No disponible" ?
                                                    new Date(studentDetails.ultima_conexion).toLocaleString()
                                                    : "No disponible"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => {
                                                closeStudentDetails();
                                                startEdit(studentDetails);
                                            }}
                                            className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                                        >
                                            <FaEdit />
                                            <span>Editar Estudiante</span>
                                        </button>
                                        <button
                                            onClick={closeStudentDetails}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
