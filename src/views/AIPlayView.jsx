import { useState, useEffect } from 'react';
import { FaRobot, FaUser, FaBrain, FaTrophy, FaGamepad } from 'react-icons/fa';
import ChessBoardAI from '../components/ChessBoardAI';

export default function AIPlayView({ user }) {
    const [isInGame, setIsInGame] = useState(false);
    const [gameResult, setGameResult] = useState('');
    const [stats, setStats] = useState({
        wins: 0,
        losses: 0,
        draws: 0,
        totalGames: 0
    });

    // Cargar estadísticas del localStorage
    useEffect(() => {
        const savedStats = localStorage.getItem('aiChessStats');
        if (savedStats) {
            setStats(JSON.parse(savedStats));
        }
    }, []);

    // Guardar estadísticas en localStorage
    const saveStats = (newStats) => {
        localStorage.setItem('aiChessStats', JSON.stringify(newStats));
        setStats(newStats);
    };

    const handleStartGame = () => {
        setIsInGame(true);
        setGameResult('');
    };

    const handleGameEnd = (result) => {
        setGameResult(result);

        // Actualizar estadísticas
        const newStats = { ...stats };
        newStats.totalGames += 1;

        if (result.includes('Ganaste')) {
            newStats.wins += 1;
        } else if (result.includes('Gana Stockfish')) {
            newStats.losses += 1;
        } else {
            newStats.draws += 1;
        }

        saveStats(newStats);
    };

    const handleBackToLobby = () => {
        setIsInGame(false);
        setGameResult('');
    };

    if (isInGame) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
                {/* Header de la partida */}
                <div className="bg-white shadow-md p-4">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <FaRobot className="text-3xl text-purple-600" />
                            <h1 className="text-2xl font-bold text-gray-800">Jugando contra Stockfish</h1>
                        </div>
                        <button
                            onClick={handleBackToLobby}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Volver al Lobby
                        </button>
                    </div>
                </div>

                {/* Componente del tablero de IA */}
                <ChessBoardAI
                    user={user}
                    onGameEnd={handleGameEnd}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
                        <FaRobot className="text-purple-600" />
                        <span>Jugar contra IA</span>
                        <FaBrain className="text-blue-600" />
                    </h1>
                    <p className="text-xl text-gray-600">
                        Desafía al poderoso motor de ajedrez Stockfish
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Panel de inicio de juego */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <FaGamepad className="text-6xl text-purple-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Nueva Partida contra Stockfish
                            </h2>
                            <p className="text-gray-600">
                                Jugarás con las piezas blancas contra la IA
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                <FaUser className="text-blue-600" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Tú</h3>
                                    <p className="text-sm text-gray-600">Jugando con blancas</p>
                                </div>
                            </div>

                            <div className="text-center text-gray-500 font-bold">VS</div>

                            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                <FaRobot className="text-purple-600" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">Stockfish</h3>
                                    <p className="text-sm text-gray-600">Motor de ajedrez de nivel maestro</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartGame}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Iniciar Partida
                        </button>

                        {gameResult && (
                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h3 className="font-bold text-yellow-800 mb-2">Última partida:</h3>
                                <p className="text-yellow-700">{gameResult}</p>
                            </div>
                        )}
                    </div>

                    {/* Panel de estadísticas */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <FaTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Estadísticas vs IA
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{stats.wins}</div>
                                <div className="text-sm text-green-700">Victorias</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">{stats.losses}</div>
                                <div className="text-sm text-red-700">Derrotas</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-600">{stats.draws}</div>
                                <div className="text-sm text-yellow-700">Empates</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">{stats.totalGames}</div>
                                <div className="text-sm text-blue-700">Total</div>
                            </div>
                        </div>

                        {stats.totalGames > 0 && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Porcentaje de victorias:</span>
                                    <span className="font-bold text-green-600">
                                        {((stats.wins / stats.totalGames) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Porcentaje de empates:</span>
                                    <span className="font-bold text-yellow-600">
                                        {((stats.draws / stats.totalGames) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Efectividad:</span>
                                    <span className="font-bold text-blue-600">
                                        {(((stats.wins + stats.draws * 0.5) / stats.totalGames) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {stats.totalGames === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                <p>¡Juega tu primera partida contra Stockfish!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Acerca de Stockfish
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="p-4">
                            <FaBrain className="text-4xl text-blue-600 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-800 mb-2">Motor Avanzado</h3>
                            <p className="text-gray-600">
                                Stockfish es uno de los motores de ajedrez más fuertes del mundo
                            </p>
                        </div>
                        <div className="p-4">
                            <FaTrophy className="text-4xl text-yellow-500 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-800 mb-2">Nivel Maestro</h3>
                            <p className="text-gray-600">
                                Juega a nivel de Gran Maestro Internacional
                            </p>
                        </div>
                        <div className="p-4">
                            <FaGamepad className="text-4xl text-green-600 mx-auto mb-3" />
                            <h3 className="font-bold text-gray-800 mb-2">Desafío Real</h3>
                            <p className="text-gray-600">
                                Perfecto para mejorar tu nivel de juego
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
