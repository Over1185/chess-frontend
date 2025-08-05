import { FaPlay, FaUsers, FaChartBar, FaBook, FaPuzzlePiece, FaTrophy } from "react-icons/fa";

export default function HomeView({ user, setCurrentView }) {
    const quickActions = [
        {
            key: "play",
            title: "Jugar",
            description: "Inicia una nueva partida",
            icon: FaPlay,
            color: "bg-blue-500 hover:bg-blue-600",
            primary: true
        },
        {
            key: "puzzles",
            title: "Puzzles",
            description: "Resuelve problemas tácticos",
            icon: FaPuzzlePiece,
            color: "bg-purple-500 hover:bg-purple-600"
        },
        {
            key: "learn",
            title: "Lecciones",
            description: "Aprende nuevas técnicas",
            icon: FaBook,
            color: "bg-green-500 hover:bg-green-600"
        },
        {
            key: "stats",
            title: "Estadísticas",
            description: "Ve tu progreso",
            icon: FaChartBar,
            color: "bg-indigo-500 hover:bg-indigo-600"
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
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <FaTrophy className="text-3xl text-blue-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Rating ELO</p>
                                    <p className="text-2xl font-bold text-blue-600">{user?.rating || 1200}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <FaUsers className="text-3xl text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Partidas Jugadas</p>
                                    <p className="text-2xl font-bold text-green-600">0</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <FaPuzzlePiece className="text-3xl text-purple-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">Puzzles Resueltos</p>
                                    <p className="text-2xl font-bold text-purple-600">0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            {quickActions.map(({ key, title, description, icon: Icon, color, primary }) => (
                                <button
                                    key={key}
                                    onClick={() => setCurrentView(key)}
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
                    <div className="text-center py-8 text-gray-500">
                        <p>No hay actividad reciente. ¡Comienza jugando una partida!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}