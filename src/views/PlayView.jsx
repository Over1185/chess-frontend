import { FaPlay, FaUsers, FaRobot } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function PlayView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    ¿Cómo quieres jugar?
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Jugar contra la computadora */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaRobot className="text-3xl text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Contra la Computadora
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Juega contra Stockfish con diferentes niveles de dificultad
                            </p>
                            <button
                                onClick={() => navigate("/ai-play")}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                            >
                                <FaPlay />
                                <span>Jugar vs IA</span>
                            </button>
                        </div>
                    </div>

                    {/* Jugar contra otro jugador */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:scale-105">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUsers className="text-3xl text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Contra Otro Jugador
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Busca una partida en línea o juega con un amigo
                            </p>
                            <button
                                onClick={() => navigate("/online-lobby")}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                            >
                                <FaPlay />
                                <span>Jugar Online</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
