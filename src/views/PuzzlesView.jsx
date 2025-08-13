import { useState, useEffect, useRef } from "react";
import { FaPuzzlePiece, FaArrowLeft, FaCalendarAlt, FaStar, FaCrown, FaFire, FaCheck, FaTimes, FaRedo } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function PuzzlesView() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para los puzzles
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentPuzzle, setCurrentPuzzle] = useState(null);
    const [puzzles, setPuzzles] = useState([]);
    const [puzzleIndex, setPuzzleIndex] = useState(0);
    const [chessGame, setChessGame] = useState(new Chess());
    const [gamePosition, setGamePosition] = useState("start");
    const [moves, setMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [puzzleComplete, setPuzzleComplete] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [optionSquares, setOptionSquares] = useState({});
    const [moveFrom, setMoveFrom] = useState('');
    const gameRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        console.log("GamePosition cambió a:", gamePosition);
    }, [gamePosition]);

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8000/puzzles/categories");
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (categoryId) => {
        switch (categoryId) {
            case "daily":
                return <FaCalendarAlt className="text-4xl text-blue-500" />;
            case "easiest":
                return <FaStar className="text-4xl text-green-500" />;
            case "normal":
                return <FaFire className="text-4xl text-orange-500" />;
            case "hardest":
                return <FaCrown className="text-4xl text-red-500" />;
            default:
                return <FaPuzzlePiece className="text-4xl text-purple-500" />;
        }
    };

    const getCategoryColor = (categoryId) => {
        switch (categoryId) {
            case "daily":
                return "from-blue-400 to-blue-600";
            case "easiest":
                return "from-green-400 to-green-600";
            case "normal":
                return "from-orange-400 to-orange-600";
            case "hardest":
                return "from-red-400 to-red-600";
            default:
                return "from-purple-400 to-purple-600";
        }
    };

    const handleCategorySelect = async (category) => {
        try {
            const response = await fetch(`http://localhost:8000/puzzles/category/${category.id}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setPuzzles(data);
                setSelectedCategory(category);
                setPuzzleIndex(0);
                loadPuzzle(data[0]);
            }
        } catch (error) {
            console.error("Error fetching puzzles:", error);
            alert("Error al cargar los puzzles de esta categoría");
        }
    };

    const loadPuzzle = (puzzle) => {
        if (!puzzle || !puzzle.fen) {
            console.error("Puzzle incompleto:", puzzle);
            return;
        }

        console.log("Cargando puzzle:", puzzle.id, "con FEN:", puzzle.fen);

        try {
            const newGame = new Chess();
            newGame.load(puzzle.fen);

            const movesArray = puzzle.moves ? puzzle.moves.split(' ') : [];

            // El usuario debe hacer TODOS los movimientos de la solución
            // No aplicamos ningún movimiento automáticamente al inicio
            setCurrentPuzzle(puzzle);
            setChessGame(newGame);
            setGamePosition(puzzle.fen); // Usar la FEN original
            setMoves(movesArray);
            setCurrentMoveIndex(0); // Empezar desde el primer movimiento
            setPuzzleComplete(false);
            setFeedback("");
            setOptionSquares({});
            setMoveFrom(''); // Resetear selección

            gameRef.current = newGame;

            console.log("Estados actualizados - GamePosition:", puzzle.fen);
            console.log("Moves:", movesArray);
            console.log("Starting index: 0 (usuario hace primer movimiento)");
        } catch (error) {
            console.error("Error al cargar el FEN:", puzzle.fen, error.message);
            return;
        }
    };

    const onPieceDrop = ({ sourceSquare, targetSquare }) => {
        if (puzzleComplete) return false;

        const gameCopy = new Chess();
        try {
            gameCopy.load(gameRef.current.fen());
        } catch (error) {
            console.error("Error cargando posición actual:", error);
            return false;
        }

        try {
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q'
            });

            if (move === null) return false;

            const moveString = `${sourceSquare}${targetSquare}`;
            const expectedMove = moves[currentMoveIndex];

            console.log("=== DEBUG MOVES ===");
            console.log("Movimiento realizado:", moveString);
            console.log("Movimiento esperado:", expectedMove);
            console.log("Índice actual:", currentMoveIndex);
            console.log("Todos los moves:", moves);
            console.log("==================");

            if (moveString === expectedMove || `${sourceSquare}${targetSquare}q` === expectedMove) {
                gameRef.current = gameCopy;
                setGamePosition(gameCopy.fen());
                const nextMoveIndex = currentMoveIndex + 1;
                setCurrentMoveIndex(nextMoveIndex);
                setFeedback("¡Movimiento correcto!");

                if (nextMoveIndex >= moves.length) {
                    setPuzzleComplete(true);
                    setFeedback("¡Puzzle completado!");
                } else {
                    // Hacer el movimiento del oponente después de un breve delay
                    setTimeout(() => {
                        makeOpponentMove(nextMoveIndex);
                    }, 500);
                }

                setOptionSquares({});
                return true;
            } else {
                setFeedback("Movimiento incorrecto. Inténtalo de nuevo.");
                return false;
            }
        } catch (error) {
            setFeedback("Movimiento inválido");
            return false;
        }
    };

    const makeOpponentMove = (moveIndex) => {
        if (moveIndex >= moves.length) return;

        const opponentMove = moves[moveIndex];
        if (!opponentMove) return;

        console.log("=== OPPONENT MOVE ===");
        console.log("Movimiento del oponente:", opponentMove);
        console.log("Índice:", moveIndex);
        console.log("====================");

        const gameCopy = new Chess();
        gameCopy.load(gameRef.current.fen());

        try {
            const sourceSquare = opponentMove.substring(0, 2);
            const targetSquare = opponentMove.substring(2, 4);
            const promotion = opponentMove.length > 4 ? opponentMove.substring(4) : undefined;

            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: promotion
            });

            if (move) {
                gameRef.current = gameCopy;
                setGamePosition(gameCopy.fen());
                setCurrentMoveIndex(moveIndex + 1);

                console.log("Movimiento del oponente aplicado:", opponentMove);
                console.log("Nueva posición:", gameCopy.fen());
            }
        } catch (error) {
            console.error("Error making opponent move:", error);
        }
    };

    const onSquareClick = ({ square, piece }) => {
        if (puzzleComplete) return;

        const gameCopy = new Chess();
        try {
            gameCopy.load(gameRef.current.fen());
        } catch (error) {
            console.error("Error loading FEN in onSquareClick:", error);
            return;
        }

        // Si no hay casilla seleccionada, seleccionar esta casilla
        if (!moveFrom) {
            const moves = gameCopy.moves({
                square: square,
                verbose: true
            });

            // Solo permitir seleccionar casillas con movimientos válidos
            if (moves.length === 0) {
                setOptionSquares({});
                return;
            }

            // Mostrar movimientos posibles
            const newSquares = {};
            moves.forEach(move => {
                newSquares[move.to] = {
                    background: move.captured
                        ? 'radial-gradient(circle, rgba(255,0,0,.4) 85%, transparent 85%)'
                        : 'radial-gradient(circle, rgba(0,255,0,.4) 85%, transparent 85%)',
                    borderRadius: '50%'
                };
            });

            // Resaltar casilla seleccionada
            newSquares[square] = {
                backgroundColor: 'rgba(255, 255, 0, 0.4)'
            };

            setOptionSquares(newSquares);
            setMoveFrom(square);
        }
        // Si hay una casilla seleccionada
        else {
            // Si se hace click en la misma casilla, deseleccionar
            if (square === moveFrom) {
                setMoveFrom('');
                setOptionSquares({});
                return;
            }

            // Intentar hacer el movimiento
            const moveResult = onPieceDrop({ sourceSquare: moveFrom, targetSquare: square });

            // Limpiar selección independientemente del resultado
            setMoveFrom('');
            setOptionSquares({});
        }
    };

    const resetPuzzle = () => {
        if (currentPuzzle) {
            loadPuzzle(currentPuzzle);
        }
    };

    const nextPuzzle = () => {
        if (puzzleIndex < puzzles.length - 1) {
            const newIndex = puzzleIndex + 1;
            setPuzzleIndex(newIndex);
            loadPuzzle(puzzles[newIndex]);
        }
    };

    const prevPuzzle = () => {
        if (puzzleIndex > 0) {
            const newIndex = puzzleIndex - 1;
            setPuzzleIndex(newIndex);
            loadPuzzle(puzzles[newIndex]);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <FaPuzzlePiece className="text-6xl text-purple-600 animate-pulse mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Cargando puzzles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => {
                            if (selectedCategory) {
                                setSelectedCategory(null);
                                setCurrentPuzzle(null);
                            } else {
                                navigate("/");
                            }
                        }}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span className="font-medium">
                            {selectedCategory ? "Volver a categorías" : "Volver al inicio"}
                        </span>
                    </button>

                    <h1 className="text-4xl font-bold text-gray-800 flex items-center space-x-3">
                        <FaPuzzlePiece className="text-purple-600" />
                        <span>
                            {selectedCategory ? selectedCategory.name : "Puzzles de Ajedrez"}
                        </span>
                    </h1>

                    <div></div> {/* Spacer */}
                </div>

                {!selectedCategory ? (
                    // Vista de categorías
                    <div>
                        {/* Categorías de puzzles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category)}
                                    className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                                >
                                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                        {/* Header con gradiente */}
                                        <div className={`bg-gradient-to-r ${getCategoryColor(category.id)} p-6 text-center`}>
                                            <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-lg">
                                                {getCategoryIcon(category.id)}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                        </div>

                                        {/* Contenido */}
                                        <div className="p-6">
                                            <p className="text-gray-600 text-center mb-4">
                                                {category.description}
                                            </p>

                                            <div className="text-center">
                                                <button className={`bg-gradient-to-r ${getCategoryColor(category.id)} text-white px-6 py-3 rounded-full font-semibold transform transition-all duration-200 group-hover:scale-105 shadow-lg`}>
                                                    Empezar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Información adicional */}
                        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                                ¿Cómo funcionan los puzzles?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                        <FaCalendarAlt className="text-2xl text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Puzzle Diario</h3>
                                    <p className="text-sm text-gray-600">Un nuevo puzzle cada día para mantener tu mente activa</p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                        <FaStar className="text-2xl text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Principiante</h3>
                                    <p className="text-sm text-gray-600">Puzzles fáciles para empezar y ganar confianza</p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-orange-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                        <FaFire className="text-2xl text-orange-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Intermedio</h3>
                                    <p className="text-sm text-gray-600">Desafíos moderados para mejorar tu táctica</p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                                        <FaCrown className="text-2xl text-red-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Avanzado</h3>
                                    <p className="text-sm text-gray-600">Puzzles complejos para jugadores expertos</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Vista del puzzle
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tablero de ajedrez */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="aspect-square max-w-full mx-auto">
                                    <Chessboard
                                        options={{
                                            position: gamePosition,
                                            onPieceDrop,
                                            onSquareClick,
                                            boardOrientation: currentPuzzle?.turn === 'b' ? 'black' : 'white',
                                            squareStyles: optionSquares,
                                            allowDragging: !puzzleComplete,
                                            id: `puzzle-board-${currentPuzzle?.id || 'default'}`,
                                            showNotation: true,
                                            animationDurationInMs: 200
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Panel lateral */}
                        <div className="space-y-6">
                            {/* Información del puzzle */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información</h3>
                                {currentPuzzle && (
                                    <div className="space-y-3 text-gray-600">
                                        <p>
                                            <strong>Puzzle:</strong> {puzzleIndex + 1} de {puzzles.length}
                                        </p>
                                        <p>
                                            <strong>Turno:</strong> {currentPuzzle.turn === 'w' ? 'Blancas' : 'Negras'}
                                        </p>
                                        <p>
                                            <strong>Progreso:</strong> {currentMoveIndex}/{moves.length} movimientos
                                        </p>
                                        {currentPuzzle.description && (
                                            <p>
                                                <strong>Objetivo:</strong> {currentPuzzle.description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Feedback */}
                            {feedback && (
                                <div className={`bg-white rounded-2xl shadow-xl p-4 border-l-4 ${feedback.includes('correcto') || feedback.includes('completado')
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                    }`}>
                                    <div className="flex items-center">
                                        {feedback.includes('correcto') || feedback.includes('completado') ? (
                                            <FaCheck className="text-green-500 mr-2" />
                                        ) : (
                                            <FaTimes className="text-red-500 mr-2" />
                                        )}
                                        <p className={`font-semibold ${feedback.includes('correcto') || feedback.includes('completado')
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                            }`}>
                                            {feedback}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Controles */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Controles</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={resetPuzzle}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                                    >
                                        <FaRedo className="mr-2" />
                                        Reiniciar puzzle
                                    </button>
                                </div>
                            </div>

                            {/* Navegación */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Navegación</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={prevPuzzle}
                                        disabled={puzzleIndex === 0}
                                        className="flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-1"
                                    >
                                        ← Anterior
                                    </button>

                                    <button
                                        onClick={nextPuzzle}
                                        disabled={puzzleIndex >= puzzles.length - 1}
                                        className="flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-1"
                                    >
                                        Siguiente →
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
