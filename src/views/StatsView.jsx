import { FaChartBar, FaTrophy, FaUsers, FaPuzzlePiece, FaGamepad, FaClock } from "react-icons/fa";

export default function StatsView({ user }) {
    const stats = {
        rating: user?.rating || 1200,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
        puzzlesSolved: 0,
        totalTime: "0h 0m",
        winRate: 0
    };

    const achievements = [
        { name: "Primera Partida", description: "Juega tu primera partida", earned: false },
        { name: "Puzzle Master", description: "Resuelve 10 puzzles", earned: false },
        { name: "Estratega", description: "Gana 5 partidas consecutivas", earned: false },
    ];

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
                        <p className="text-3xl font-bold text-yellow-600">{stats.rating}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaGamepad className="text-4xl text-blue-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Partidas</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.gamesPlayed}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaPuzzlePiece className="text-4xl text-purple-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Puzzles</h3>
                        <p className="text-3xl font-bold text-purple-600">{stats.puzzlesSolved}</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                        <FaClock className="text-4xl text-green-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-700">Tiempo Total</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.totalTime}</p>
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
                                <span className="font-semibold text-green-600">{stats.gamesWon}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Partidas Perdidas</span>
                                <span className="font-semibold text-red-600">{stats.gamesLost}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Partidas Empatadas</span>
                                <span className="font-semibold text-yellow-600">{stats.gamesDrawn}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Porcentaje de Victoria</span>
                                <span className="font-semibold text-blue-600">{stats.winRate}%</span>
                            </div>
                        </div>

                        {/* Gráfico placeholder */}
                        <div className="mt-6 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Gráfico de Progreso de Rating</p>
                        </div>
                    </div>

                    {/* Logros */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <FaTrophy className="mr-2 text-yellow-500" />
                            Logros
                        </h3>

                        <div className="space-y-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.name}
                                    className={`p-4 rounded-lg border-2 ${achievement.earned
                                            ? 'border-green-200 bg-green-50'
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
            </div>
        </div>
    );
}
