import { FaPuzzlePiece, FaTools, FaCog, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PuzzlesView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Botón de regreso */}
                <button
                    onClick={() => navigate("/")}
                    className="mb-6 flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                    <FaArrowLeft className="text-lg" />
                    <span className="font-medium">Volver al inicio</span>
                </button>

                {/* Contenido principal de construcción */}
                <div className="text-center">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
                        {/* Iconos animados */}
                        <div className="flex justify-center items-center space-x-4 mb-8">
                            <FaPuzzlePiece className="text-6xl text-purple-600" />
                            <div className="relative">
                                <FaTools className="text-5xl text-orange-500 animate-bounce" />
                                <FaCog className="text-2xl text-gray-400 absolute -top-2 -right-2 animate-spin" />
                            </div>
                        </div>

                        {/* Título principal */}
                        <h1 className="text-5xl font-bold text-gray-800 mb-6">
                            Puzzles de Ajedrez
                        </h1>

                        {/* Estado de construcción */}
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-8">
                            <h2 className="text-3xl font-bold text-purple-700 mb-4">
                                🚧 En Construcción 🚧
                            </h2>
                            <p className="text-xl text-gray-700 mb-4">
                                Estamos perfeccionando los últimos detalles para ofrecerte la mejor experiencia de puzzles de ajedrez.
                            </p>
                            <div className="bg-white rounded-lg p-4 shadow-inner">
                                <p className="text-lg text-gray-600">
                                    <strong>¿Qué estamos preparando?</strong>
                                </p>
                                <ul className="text-left mt-3 space-y-2 text-gray-600">
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                        Puzzles tácticos de diferentes niveles de dificultad
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                        Sistema de puntuación y progreso personalizado
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                        Análisis detallado de cada solución
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                        Categorías temáticas (mates, tácticas, finales)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Mensaje motivacional */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 mb-8">
                            <h3 className="text-2xl font-bold mb-3">
                                ¡Pronto estará disponible!
                            </h3>
                            <p className="text-lg opacity-90">
                                Mientras tanto, puedes seguir mejorando tu juego con las partidas contra la IA o explorar las lecciones disponibles.
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate("/ai-play")}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                                <FaPuzzlePiece className="text-xl" />
                                <span>Jugar contra IA</span>
                            </button>
                            <button
                                onClick={() => navigate("/learn")}
                                className="bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                            >
                                <FaCog className="text-xl" />
                                <span>Ver Lecciones</span>
                            </button>
                        </div>
                    </div>

                    {/* Progreso visual */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">
                            Progreso de Desarrollo
                        </h4>
                        <div className="bg-gray-200 rounded-full h-4 mb-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-gray-600">85% completado</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
