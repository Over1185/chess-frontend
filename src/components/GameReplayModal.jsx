import { useState, useCallback, useRef, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
    FaTimes,
    FaPlay,
    FaPause,
    FaStepForward,
    FaStepBackward,
    FaFastForward,
    FaFastBackward,
    FaLightbulb,
    FaSpinner,
    FaChess
} from 'react-icons/fa';

export default function GameReplayModal({
    isOpen,
    onClose,
    gameData,
    playerUsername
}) {
    // Refs para la instancia del juego
    const chessGameRef = useRef(new Chess());

    // Estados del replay
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [gamePosition, setGamePosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moves, setMoves] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playInterval, setPlayInterval] = useState(null);

    // Estados para análisis de Stockfish
    const [analysis, setAnalysis] = useState({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);

    // Estados de UI
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [squareStyles, setSquareStyles] = useState({});

    // Función para inicializar el juego
    const initializeGame = useCallback(() => {
        if (!gameData?.moves) {
            console.warn('No hay datos de movimientos disponibles:', gameData);
            return;
        }

        const game = new Chess();
        chessGameRef.current = game;

        // Parsear los movimientos - manejar tanto string como array
        let moveList = [];
        if (gameData.moves) {
            if (typeof gameData.moves === 'string') {
                moveList = gameData.moves.split(' ').filter(move => move.trim() !== '');
            } else if (Array.isArray(gameData.moves)) {
                moveList = gameData.moves.filter(move => move && move.trim && move.trim() !== '');
            }
        }

        setMoves(moveList);
        setCurrentMoveIndex(0);
        setGamePosition(game.fen());
        setAnalysis({});
        setCurrentAnalysis(null);

        // Determinar orientación del tablero basado en el color del jugador
        const playerColor = gameData.white_player === playerUsername ? 'white' : 'black';
        setBoardOrientation(playerColor);
    }, [gameData, playerUsername]);

    // Inicializar el juego cuando se abre el modal
    useEffect(() => {
        if (isOpen && gameData) {
            initializeGame();
        }
        return () => {
            if (playInterval) {
                clearInterval(playInterval);
            }
        };
    }, [isOpen, gameData, initializeGame, playInterval]);

    // Función para actualizar estilos de casillas (último movimiento)
    const updateSquareStyles = useCallback((moveIndex) => {
        if (moveIndex === 0 || !moves[moveIndex - 1]) {
            setSquareStyles({});
            return;
        }

        try {
            const game = new Chess();
            // Aplicar movimientos hasta el anterior
            for (let i = 0; i < moveIndex - 1; i++) {
                game.move(moves[i]);
            }

            // Hacer el último movimiento para obtener la información
            const lastMove = game.move(moves[moveIndex - 1]);

            if (lastMove) {
                setSquareStyles({
                    [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
                    [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
                });
            }
        } catch (error) {
            console.error('Error actualizando estilos:', error);
            setSquareStyles({});
        }
    }, [moves]);

    // Función para analizar posición con Stockfish
    const analyzePosition = useCallback(async () => {
        if (!gameData?.id && !gameData?._id) {
            console.error('No hay ID de partida disponible:', gameData);
            return;
        }

        if (isAnalyzing) return;

        setIsAnalyzing(true);

        // Usar _id si id no está disponible
        const gameId = gameData.id || gameData._id;

        try {
            const response = await fetch(`http://localhost:8000/analysis/game/${gameId}/move/${currentMoveIndex}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const analysisData = await response.json();
                setAnalysis(prev => ({
                    ...prev,
                    [currentMoveIndex]: analysisData
                }));
                setCurrentAnalysis(analysisData);
            } else {
                const errorText = await response.text();
                console.error('Error obteniendo análisis:', response.statusText, errorText);
            }
        } catch (error) {
            console.error('Error analizando posición:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [gameData, currentMoveIndex, isAnalyzing]);

    // Función para ir a un movimiento específico
    const goToMove = useCallback((moveIndex) => {
        if (!moves.length) return;

        const game = new Chess();
        chessGameRef.current = game;

        // Aplicar todos los movimientos hasta el índice especificado
        for (let i = 0; i < moveIndex; i++) {
            if (i < moves.length) {
                try {
                    game.move(moves[i]);
                } catch (error) {
                    console.error('Error aplicando movimiento:', moves[i], error);
                    break;
                }
            }
        }

        setCurrentMoveIndex(moveIndex);
        setGamePosition(game.fen());
        updateSquareStyles(moveIndex);

        // Mostrar análisis si está disponible
        if (analysis[moveIndex]) {
            setCurrentAnalysis(analysis[moveIndex]);
        } else {
            setCurrentAnalysis(null);
            // Auto-analizar la posición si no está disponible
            if (moveIndex > 0) {
                setTimeout(() => analyzePosition(), 500);
            }
        }
    }, [moves, analysis, updateSquareStyles, analyzePosition]);

    // Funciones de navegación
    const goToStart = () => goToMove(0);
    const goToEnd = () => goToMove(moves.length);
    const previousMove = () => goToMove(Math.max(0, currentMoveIndex - 1));
    const nextMove = () => goToMove(Math.min(moves.length, currentMoveIndex + 1));

    // Función para reproducción automática
    const toggleAutoPlay = useCallback(() => {
        if (isPlaying) {
            clearInterval(playInterval);
            setPlayInterval(null);
            setIsPlaying(false);
        } else {
            const interval = setInterval(() => {
                setCurrentMoveIndex(prev => {
                    if (prev >= moves.length) {
                        clearInterval(interval);
                        setIsPlaying(false);
                        setPlayInterval(null);
                        return prev;
                    }
                    goToMove(prev + 1);
                    return prev + 1;
                });
            }, 1500); // 1.5 segundos entre movimientos

            setPlayInterval(interval);
            setIsPlaying(true);
        }
    }, [isPlaying, playInterval, moves.length, goToMove]);

    // Función para evaluar la calidad de una jugada
    const evaluateMove = (evaluation, previousEvaluation) => {
        if (!evaluation || !previousEvaluation) return { quality: 'unknown', emoji: '❓', color: 'gray' };

        // Convertir evaluaciones a valores numéricos
        const getEvalValue = (evalData) => {
            if (evalData.type === 'cp') return evalData.value / 100; // Centipawns a peones
            if (evalData.type === 'mate') return evalData.value > 0 ? 999 : -999;
            return 0;
        };

        const currentEval = getEvalValue(evaluation);
        const prevEval = getEvalValue(previousEvaluation);

        // Calcular diferencia (desde la perspectiva del jugador que movió)
        const difference = Math.abs(currentEval - prevEval);

        if (difference <= 0.3) {
            return { quality: 'excellent', emoji: '✅', color: 'green', text: 'Excelente' };
        } else if (difference <= 0.7) {
            return { quality: 'good', emoji: '👍', color: 'blue', text: 'Buena' };
        } else if (difference <= 1.5) {
            return { quality: 'inaccurate', emoji: '⚠️', color: 'yellow', text: 'Imprecisa' };
        } else if (difference <= 3.0) {
            return { quality: 'mistake', emoji: '❌', color: 'orange', text: 'Error' };
        } else {
            return { quality: 'blunder', emoji: '💥', color: 'red', text: 'Grave Error' };
        }
    };

    // Función para formatear evaluación
    const formatEvaluation = (evaluation) => {
        if (!evaluation) return 'N/A';

        if (evaluation.type === 'mate') {
            return `#${evaluation.value}`;
        } else {
            const value = evaluation.value / 100;
            return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
        }
    };

    // Renderizar información del movimiento
    const renderMoveInfo = () => {
        if (currentMoveIndex === 0) {
            return (
                <div className="text-center text-gray-500 py-4">
                    <FaChess className="text-4xl mx-auto mb-2" />
                    <p>Posición inicial</p>
                </div>
            );
        }

        const moveNumber = Math.ceil(currentMoveIndex / 2);
        const isWhiteMove = currentMoveIndex % 2 === 1;
        const currentMove = moves[currentMoveIndex - 1];

        return (
            <div className="space-y-3">
                <div className="text-center">
                    <h4 className="font-semibold text-lg">
                        Movimiento {moveNumber}{isWhiteMove ? '' : '...'}
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">{currentMove}</p>
                    <p className="text-sm text-gray-600">
                        {isWhiteMove ? 'Blancas' : 'Negras'}
                    </p>
                </div>

                {/* Análisis de Stockfish */}
                <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Análisis</h5>
                        <button
                            onClick={analyzePosition}
                            disabled={isAnalyzing}
                            className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                            {isAnalyzing ? (
                                <FaSpinner className="animate-spin" />
                            ) : (
                                <FaLightbulb />
                            )}
                            <span>{isAnalyzing ? 'Analizando...' : 'Analizar'}</span>
                        </button>
                    </div>

                    {currentAnalysis ? (
                        <div className="bg-gray-50 rounded p-3 space-y-3">
                            {/* Evaluación de calidad de la jugada */}
                            {currentMoveIndex > 0 && analysis[currentMoveIndex - 1] && (
                                <div className="flex items-center justify-between bg-white rounded p-2">
                                    <span className="text-sm text-gray-600">Calidad de la jugada:</span>
                                    <div className="flex items-center space-x-2">
                                        {(() => {
                                            const moveQuality = evaluateMove(
                                                currentAnalysis.evaluation,
                                                analysis[currentMoveIndex - 1]?.evaluation
                                            );
                                            return (
                                                <>
                                                    <span className="text-lg">{moveQuality.emoji}</span>
                                                    <span
                                                        className={`font-medium text-${moveQuality.color}-600`}
                                                        style={{ color: moveQuality.color === 'orange' ? '#ea5a00' : undefined }}
                                                    >
                                                        {moveQuality.text}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Evaluación:</span>
                                <span className="font-medium">
                                    {formatEvaluation(currentAnalysis.evaluation)}
                                </span>
                            </div>

                            {currentAnalysis.best_move && (
                                <div>
                                    <span className="text-sm text-gray-600">Mejor jugada:</span>
                                    <p className="font-medium text-green-600">
                                        {currentAnalysis.best_move}
                                    </p>
                                </div>
                            )}

                            {currentAnalysis.pv && (
                                <div>
                                    <span className="text-sm text-gray-600">Línea principal:</span>
                                    <p className="text-sm text-gray-800">
                                        {currentAnalysis.pv.slice(0, 8).join(' ')}
                                        {currentAnalysis.pv.length > 8 ? '...' : ''}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Profundidad:</span>
                                <span className="text-sm">{currentAnalysis.depth || 'N/A'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded p-3 text-center text-gray-500 text-sm">
                            Haz clic en "Analizar" para ver el análisis de Stockfish
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Replay de Partida
                        </h2>
                        <p className="text-gray-600">
                            {gameData?.white_player} vs {gameData?.black_player}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row h-[calc(90vh-100px)]">
                    {/* Tablero */}
                    <div className="lg:w-2/3 p-6 flex items-center justify-center">
                        <div className="w-full max-w-lg aspect-square">
                            <Chessboard
                                options={{
                                    position: gamePosition,
                                    boardOrientation: boardOrientation,
                                    allowDragging: false,
                                    squareStyles: squareStyles,
                                    id: `replay-board-${gameData?.id || 'default'}`,
                                    showNotation: true,
                                    animationDurationInMs: 200
                                }}
                            />
                        </div>
                    </div>

                    {/* Panel lateral */}
                    <div className="lg:w-1/3 border-l border-gray-200 p-6 overflow-y-auto">
                        {/* Controles de reproducción */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">Controles</h3>

                            {/* Barra de progreso */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Movimiento {currentMoveIndex} de {moves.length}</span>
                                    <span>{Math.round((currentMoveIndex / moves.length) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentMoveIndex / moves.length) * 100}%` }}
                                    ></div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={moves.length}
                                    value={currentMoveIndex}
                                    onChange={(e) => goToMove(parseInt(e.target.value))}
                                    className="w-full mt-2"
                                />
                            </div>

                            {/* Botones de control */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={goToStart}
                                    className="flex items-center justify-center p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    title="Ir al inicio"
                                >
                                    <FaFastBackward />
                                </button>

                                <button
                                    onClick={previousMove}
                                    className="flex items-center justify-center p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    title="Movimiento anterior"
                                >
                                    <FaStepBackward />
                                </button>

                                <button
                                    onClick={toggleAutoPlay}
                                    className="flex items-center justify-center p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    title={isPlaying ? "Pausar" : "Reproducir"}
                                >
                                    {isPlaying ? <FaPause /> : <FaPlay />}
                                </button>

                                <button
                                    onClick={nextMove}
                                    className="flex items-center justify-center p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    title="Siguiente movimiento"
                                >
                                    <FaStepForward />
                                </button>

                                <button
                                    onClick={goToEnd}
                                    className="flex items-center justify-center p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    title="Ir al final"
                                >
                                    <FaFastForward />
                                </button>

                                <button
                                    onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
                                    className="flex items-center justify-center p-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                                    title="Girar tablero"
                                >
                                    ⟲
                                </button>
                            </div>
                        </div>

                        {/* Información del movimiento */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">Información</h3>
                            {renderMoveInfo()}
                        </div>

                        {/* Lista de movimientos */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Movimientos</h3>
                            <div className="max-h-64 overflow-y-auto bg-gray-50 rounded p-3">
                                {moves.length === 0 ? (
                                    <p className="text-gray-500 text-center">No hay movimientos</p>
                                ) : (
                                    <div className="space-y-1">
                                        {Array.from({ length: Math.ceil(moves.length / 2) }, (_, pairIndex) => {
                                            const whiteMove = moves[pairIndex * 2];
                                            const blackMove = moves[pairIndex * 2 + 1];
                                            const whiteIndex = pairIndex * 2 + 1;
                                            const blackIndex = pairIndex * 2 + 2;

                                            return (
                                                <div key={pairIndex} className="flex items-center space-x-2">
                                                    <span className="text-gray-500 text-sm w-8">
                                                        {pairIndex + 1}.
                                                    </span>

                                                    <button
                                                        onClick={() => goToMove(whiteIndex)}
                                                        className={`px-2 py-1 rounded text-sm flex-1 text-left flex items-center justify-between ${currentMoveIndex === whiteIndex
                                                            ? 'bg-blue-500 text-white'
                                                            : 'hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        <span>{whiteMove}</span>
                                                        {analysis[whiteIndex] && analysis[whiteIndex - 1] && (
                                                            <span className="text-xs">
                                                                {evaluateMove(
                                                                    analysis[whiteIndex].evaluation,
                                                                    analysis[whiteIndex - 1]?.evaluation
                                                                ).emoji}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {blackMove && (
                                                        <button
                                                            onClick={() => goToMove(blackIndex)}
                                                            className={`px-2 py-1 rounded text-sm flex-1 text-left flex items-center justify-between ${currentMoveIndex === blackIndex
                                                                ? 'bg-blue-500 text-white'
                                                                : 'hover:bg-gray-200'
                                                                }`}
                                                        >
                                                            <span>{blackMove}</span>
                                                            {analysis[blackIndex] && analysis[blackIndex - 1] && (
                                                                <span className="text-xs">
                                                                    {evaluateMove(
                                                                        analysis[blackIndex].evaluation,
                                                                        analysis[blackIndex - 1]?.evaluation
                                                                    ).emoji}
                                                                </span>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
