import { useState } from "react";
import { FaPuzzlePiece, FaCheckCircle, FaTimesCircle, FaLightbulb } from "react-icons/fa";

export default function PuzzlesView() {
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [userSolution, setUserSolution] = useState("");
    const [feedback, setFeedback] = useState(null);

    const puzzleTypes = {
        easy: { name: "Fácil", color: "bg-green-500", description: "Puzzles básicos para principiantes" },
        medium: { name: "Medio", color: "bg-yellow-500", description: "Puzzles intermedios" },
        hard: { name: "Difícil", color: "bg-red-500", description: "Puzzles avanzados" }
    };

    const loadPuzzle = (difficulty) => {
        // Aquí se cargaría un puzzle real del backend
        setCurrentPuzzle({
            id: "sample",
            difficulty,
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            solution: "e4",
            theme: "Apertura"
        });
        setFeedback(null);
        setUserSolution("");
    };

    const submitSolution = () => {
        if (!currentPuzzle || !userSolution.trim()) return;

        const isCorrect = userSolution.toLowerCase().trim() === currentPuzzle.solution.toLowerCase();

        setFeedback({
            correct: isCorrect,
            message: isCorrect
                ? "¡Correcto! Excelente trabajo."
                : `Incorrecto. La respuesta era: ${currentPuzzle.solution}`
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        <FaPuzzlePiece className="inline mr-3 text-purple-600" />
                        Puzzles de Ajedrez
                    </h1>
                    <p className="text-xl text-gray-600">
                        Mejora tu táctica resolviendo problemas de ajedrez
                    </p>
                </div>

                {!currentPuzzle ? (
                    // Selección de dificultad
                    <div className="grid md:grid-cols-3 gap-6">
                        {Object.entries(puzzleTypes).map(([difficulty, info]) => (
                            <div key={difficulty} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                                <div className="text-center">
                                    <div className={`w-16 h-16 ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <FaPuzzlePiece className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{info.name}</h3>
                                    <p className="text-gray-600 mb-6">{info.description}</p>
                                    <button
                                        onClick={() => loadPuzzle(difficulty)}
                                        className={`w-full ${info.color} hover:opacity-90 text-white py-3 px-6 rounded-lg font-semibold transition-all`}
                                    >
                                        Comenzar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Vista del puzzle
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Tablero del puzzle */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Puzzle {puzzleTypes[currentPuzzle.difficulty].name}
                                </h3>
                                <span className={`px-3 py-1 ${puzzleTypes[currentPuzzle.difficulty].color} text-white rounded-full text-sm`}>
                                    {currentPuzzle.theme}
                                </span>
                            </div>

                            {/* Aquí iría el componente del tablero de ajedrez */}
                            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <p className="text-gray-500 text-center">
                                    Tablero de ajedrez<br />
                                    <span className="text-sm">FEN: {currentPuzzle.fen}</span>
                                </p>
                            </div>
                        </div>

                        {/* Panel de solución */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                <FaLightbulb className="inline mr-2 text-yellow-500" />
                                Tu Solución
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ingresa tu movimiento (notación algebraica):
                                    </label>
                                    <input
                                        type="text"
                                        value={userSolution}
                                        onChange={(e) => setUserSolution(e.target.value)}
                                        placeholder="ej: Nxd5, Qh5+, O-O"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                <button
                                    onClick={submitSolution}
                                    disabled={!userSolution.trim()}
                                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                                >
                                    Verificar Solución
                                </button>

                                {feedback && (
                                    <div className={`p-4 rounded-lg flex items-center space-x-3 ${feedback.correct ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                                        }`}>
                                        {feedback.correct ? (
                                            <FaCheckCircle className="text-2xl text-green-500" />
                                        ) : (
                                            <FaTimesCircle className="text-2xl text-red-500" />
                                        )}
                                        <p className="font-medium">{feedback.message}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setCurrentPuzzle(null)}
                                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        onClick={() => loadPuzzle(currentPuzzle.difficulty)}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
