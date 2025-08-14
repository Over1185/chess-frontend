import { useState, useCallback, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FaFlag, FaCopy, FaSpinner, FaRobot, FaUser, FaSync } from 'react-icons/fa';
import Modal from './Modal';

// Importar imágenes de piezas
import bBishop from '../assets/b_bishop.png';
import bKing from '../assets/b_king.png';
import bKnight from '../assets/b_knight.png';
import bPawn from '../assets/b_pawn.png';
import bQueen from '../assets/b_queen.png';
import bRook from '../assets/b_rook.png';
import wBishop from '../assets/w_bishop.png';
import wKing from '../assets/w_king.png';
import wKnight from '../assets/w_knight.png';
import wPawn from '../assets/w_pawn.png';
import wQueen from '../assets/w_queen.png';
import wRook from '../assets/w_rook.png';

// Mapeo de piezas a imágenes
const pieceImages = {
    // Piezas negras
    'p': bPawn,
    'r': bRook,
    'n': bKnight,
    'b': bBishop,
    'q': bQueen,
    'k': bKing,
    // Piezas blancas
    'P': wPawn,
    'R': wRook,
    'N': wKnight,
    'B': wBishop,
    'Q': wQueen,
    'K': wKing
};

// Componente para mostrar una pieza capturada
const CapturedPiece = ({ piece, size = 24 }) => (
    <img
        src={pieceImages[piece]}
        alt={piece}
        className="inline-block"
        style={{ width: size, height: size }}
    />
);

export default function ChessBoardAI({ user, onGameEnd }) {
    // Usar ref para mantener la instancia del juego a través de renders
    const chessGameRef = useRef(new Chess());

    // Ref para el contenedor de movimientos
    const movesContainerRef = useRef(null);

    // Estado del juego
    const [gamePosition, setGamePosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentTurn, setCurrentTurn] = useState('white');
    const [gameStatus, setGameStatus] = useState('active');
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

    // Estados para funcionalidad de click to move
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [rightClickedSquares, setRightClickedSquares] = useState({});

    // Estados de UI
    const [showResignModal, setShowResignModal] = useState(false);
    const [gameResult, setGameResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    // Estados para promoción de peones
    const [promotionMove, setPromotionMove] = useState(null);
    const [showPromotionModal, setShowPromotionModal] = useState(false);

    // Estados para estilos de casillas (jaque, etc.)
    const [customSquareStyles, setCustomSquareStyles] = useState({});

    // Estado para dificultad de Stockfish
    const [difficulty, setDifficulty] = useState('intermedio');
    const [difficulties, setDifficulties] = useState({});

    // Estado para color del jugador
    const [playerColor, setPlayerColor] = useState('white');
    const boardOrientation = playerColor;
    const isPlayerTurn = currentTurn === playerColor && gameStatus === 'active';

    // Función para calcular piezas capturadas
    const calculateCapturedPieces = useCallback((gameInstance) => {
        const initialPieces = {
            'p': 8, 'r': 2, 'n': 2, 'b': 2, 'q': 1, // k se excluye porque no se puede capturar
            'P': 8, 'R': 2, 'N': 2, 'B': 2, 'Q': 1  // K se excluye porque no se puede capturar
        };

        const currentPieces = {};
        const board = gameInstance.board();

        // Contar piezas actuales en el tablero
        board.forEach(row => {
            row.forEach(square => {
                if (square) {
                    const pieceKey = square.color === 'w' ? square.type.toUpperCase() : square.type.toLowerCase();
                    currentPieces[pieceKey] = (currentPieces[pieceKey] || 0) + 1;
                }
            });
        });

        const captured = { white: [], black: [] };

        // Calcular piezas capturadas
        Object.keys(initialPieces).forEach(piece => {
            const initial = initialPieces[piece];
            const current = currentPieces[piece] || 0;
            const capturedCount = initial - current;

            for (let i = 0; i < capturedCount; i++) {
                if (piece === piece.toUpperCase()) {
                    // Pieza blanca capturada (las blancas la perdieron, las negras la capturaron)
                    captured.black.push(piece);
                } else {
                    // Pieza negra capturada (las negras la perdieron, las blancas la capturaron)
                    captured.white.push(piece);
                }
            }
        });

        setCapturedPieces(captured);
    }, []);

    // Función para actualizar estilos de casillas (jaque, etc.)
    const updateSquareStyles = useCallback((gameInstance) => {
        const newStyles = { ...optionSquares }; // Mantener los estilos de movimientos válidos

        // Detectar jaque (pero no jaque mate)
        if (gameInstance.inCheck() && !gameInstance.isCheckmate()) {
            // Encontrar la posición del rey en jaque
            const board = gameInstance.board();
            const turn = gameInstance.turn();

            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col];
                    if (piece && piece.type === 'k' && piece.color === turn) {
                        const square = String.fromCharCode(97 + col) + (8 - row);
                        newStyles[square] = {
                            ...newStyles[square],
                            backgroundColor: 'rgba(255, 0, 0, 0.5)', // Rojo para jaque
                            borderRadius: '50%'
                        };
                        break;
                    }
                }
            }
        }

        setCustomSquareStyles(newStyles);
    }, [optionSquares]);

    // Función para guardar partida contra IA
    const saveGameToDatabase = useCallback(async (result) => {

        try {
            const moves = chessGameRef.current.history();
            let resultCode, winner;

            if (result === 'Ganaste!') {
                resultCode = playerColor === 'white' ? '1-0' : '0-1';
                winner = user.username;
            } else if (result === 'Gana Stockfish') {
                resultCode = playerColor === 'white' ? '0-1' : '1-0';
                winner = 'Stockfish';
            } else {
                resultCode = '1/2-1/2';
                winner = 'draw';
            }

            const gameData = {
                white_player: playerColor === 'white' ? user.username : 'Stockfish',
                black_player: playerColor === 'black' ? user.username : 'Stockfish',
                white_elo: playerColor === 'white' ? (user.elo || 1200) : 1200,
                black_elo: playerColor === 'black' ? (user.elo || 1200) : 1200,
                moves: moves,
                result_code: resultCode,
                winner: winner,
                vs_ai: true  // Indica que es una partida contra la IA
            };

            const response = await fetch('http://localhost:8000/guardar-partida', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(gameData)
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Partida guardada exitosamente:', responseData);
            } else {
                const errorText = await response.text();
                console.error('Error al guardar partida:', response.statusText, errorText);
            }
        } catch (error) {
            console.error('Error guardando partida:', error);
        }
    }, [user?.username, user?.elo, playerColor]);

    // Función para detectar y manejar promoción
    const detectPromotion = useCallback((from, to) => {
        // Verificar si es una promoción potencial
        const piece = chessGameRef.current.get(from);
        if (!piece || piece.type !== 'p') return false;

        const toRank = parseInt(to[1]);
        const isWhitePawn = piece.color === 'w' && toRank === 8;
        const isBlackPawn = piece.color === 'b' && toRank === 1;

        if (isWhitePawn || isBlackPawn) {
            // Verificar si el movimiento es válido
            const moves = chessGameRef.current.moves({
                square: from,
                verbose: true
            });

            const validPromotion = moves.some(move =>
                move.to === to && move.promotion
            );

            if (validPromotion) {
                setPromotionMove({ from, to });
                setShowPromotionModal(true);
                return true;
            }
        }

        return false;
    }, []);

    // Función para obtener movimientos válidos de una casilla
    const getMoveOptions = useCallback((square) => {
        const moves = chessGameRef.current.moves({
            square,
            verbose: true,
        });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares = {};

        // Mostrar movimientos válidos
        moves.forEach(move => {
            newSquares[move.to] = {
                background:
                    chessGameRef.current.get(move.to) &&
                        chessGameRef.current.get(move.to)?.color !== chessGameRef.current.get(square)?.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // captura
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', // movimiento
                borderRadius: '50%',
            };
        });

        // Resaltar casilla seleccionada
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)',
        };

        setOptionSquares(newSquares);
        return true;
    }, []);

    // Función para hacer que Stockfish juegue
    const makeStockfishMove = useCallback(async () => {

        if (gameStatus !== 'active') {
            return;
        }

        setIsThinking(true);

        try {
            // Obtener el historial de movimientos en formato SAN desde la instancia actual
            const history = chessGameRef.current.history();

            const response = await fetch('http://localhost:8000/analysis/juga-stockfish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movimientos: history,
                    dificultad: difficulty
                }),
                signal: AbortSignal.timeout(10000) // Timeout de 10 segundos
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('=== ERROR STOCKFISH ===');
                console.error('Status:', response.status);
                console.error('Error text:', errorText);
                console.error('Historial enviado:', history);
                console.error('=======================');
                throw new Error(`Error en la respuesta del servidor: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            if (data.jugada_stockfish) {
                // Aplicar el movimiento de Stockfish a la instancia actual
                const move = chessGameRef.current.move(data.jugada_stockfish);

                if (move) {
                    // Actualizar estado después de que Stockfish haga su movimiento
                    setGamePosition(chessGameRef.current.fen());
                    setCurrentTurn(chessGameRef.current.turn() === 'w' ? 'white' : 'black');
                    calculateCapturedPieces(chessGameRef.current);
                    updateSquareStyles(chessGameRef.current);

                    // Agregar al historial
                    setMoveHistory(prev => [...prev, {
                        from: move.from,
                        to: move.to,
                        san: move.san,
                        promotion: move.promotion,
                        player: 'Stockfish'
                    }]);

                    // Verificar fin del juego
                    if (chessGameRef.current.isGameOver()) {
                        let result = 'Empate';
                        if (chessGameRef.current.isCheckmate()) {
                            // turn() devuelve quien debe mover, que es quien está en jaque mate
                            // Si es turno de blancas (w), las blancas están en jaque mate -> gana Stockfish
                            // Si es turno de negras (b), las negras están en jaque mate -> gana el jugador
                            result = chessGameRef.current.turn() === 'w' ? 'Gana Stockfish' : 'Ganaste!';
                        }
                        setGameStatus('ended');
                        setGameResult(result);

                        // Guardar partida en la base de datos
                        saveGameToDatabase(result);

                        if (onGameEnd) onGameEnd(result);
                    }
                } else {
                    console.error('No se pudo aplicar el movimiento de Stockfish:', data.jugada_stockfish);
                    setErrorMessage('Error al procesar movimiento de Stockfish');
                    setTimeout(() => setErrorMessage(''), 3000);
                }
            } else {
                console.warn('Stockfish no devolvió ningún movimiento');
                setErrorMessage('Stockfish no pudo encontrar un movimiento');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error al obtener movimiento de Stockfish:', error);
            if (error.name === 'AbortError') {
                setErrorMessage('Timeout - Stockfish tardó demasiado en responder');
            } else if (error.message.includes('fetch')) {
                setErrorMessage('Error de conexión con el servidor');
            } else {
                setErrorMessage('Error de conexión con la IA');
            }
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsThinking(false);
        }
    }, [gameStatus, calculateCapturedPieces, updateSquareStyles, onGameEnd, difficulty, saveGameToDatabase]);

    // Función para hacer un movimiento del jugador
    const makeMove = useCallback((from, to, promotion = 'q') => {
        // Verificar que from y to no sean la misma casilla
        if (from === to) {
            return false;
        }

        // Verificar que es el turno del jugador
        if (!isPlayerTurn) {
            setErrorMessage('No es tu turno');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        try {
            // Hacer el movimiento directamente en la instancia principal
            const move = chessGameRef.current.move({
                from,
                to,
                promotion
            });

            if (move) {
                // Actualizar estado inmediatamente después del movimiento
                setGamePosition(chessGameRef.current.fen());
                setCurrentTurn(chessGameRef.current.turn() === 'w' ? 'white' : 'black');
                calculateCapturedPieces(chessGameRef.current);

                // Actualizar estilos de casillas (jaque, etc.)
                updateSquareStyles(chessGameRef.current);

                // Agregar al historial
                setMoveHistory(prev => [...prev, {
                    from,
                    to,
                    san: move.san,
                    promotion: move.promotion,
                    player: 'Jugador'
                }]);

                // Limpiar selección
                setMoveFrom('');
                setOptionSquares({});

                // Verificar fin del juego
                if (chessGameRef.current.isGameOver()) {
                    let result = 'Empate';
                    if (chessGameRef.current.isCheckmate()) {
                        // turn() devuelve quien debe mover, que es quien está en jaque mate
                        // Si es turno de blancas (w), las blancas están en jaque mate -> gana Stockfish
                        // Si es turno de negras (b), las negras están en jaque mate -> gana el jugador
                        result = chessGameRef.current.turn() === 'w' ? 'Gana Stockfish' : 'Ganaste!';
                    }
                    setGameStatus('ended');
                    setGameResult(result);

                    // Guardar partida en la base de datos
                    saveGameToDatabase(result);

                    if (onGameEnd) onGameEnd(result);
                } else {
                    // Hacer que Stockfish juegue después de un pequeño delay
                    setTimeout(() => makeStockfishMove(), 500);
                }

                return true;
            }
        } catch (error) {
            console.error('Error making move:', error);
            setErrorMessage('Movimiento inválido');
            setTimeout(() => setErrorMessage(''), 2000);
        }
        return false;
    }, [isPlayerTurn, calculateCapturedPieces, updateSquareStyles, onGameEnd, makeStockfishMove, saveGameToDatabase]);

    // Función para manejar selección de pieza de promoción
    const handlePromotionSelect = useCallback((selectedPiece) => {
        if (!promotionMove) return;

        // Hacer el movimiento con la promoción seleccionada
        const success = makeMove(promotionMove.from, promotionMove.to, selectedPiece);

        // Limpiar estado de promoción
        setPromotionMove(null);
        setShowPromotionModal(false);

        return success;
    }, [promotionMove, makeMove]);

    // Manejar click en casilla
    const onSquareClick = useCallback(({ square, piece }) => {

        // No permitir clicks si no es el turno del jugador o si la IA está pensando
        if (!isPlayerTurn || isThinking) {
            return;
        }

        // Si no hay moveFrom y hay una pieza, seleccionar pieza para mover
        if (!moveFrom && piece) {
            // Verificar que la pieza es del color correcto del jugador
            const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'white' : 'black';
            if (pieceColor !== playerColor) {
                const colorName = playerColor === 'white' ? 'blancas' : 'negras';
                const wrongColorName = playerColor === 'white' ? 'negras' : 'blancas';
                setErrorMessage(`Solo puedes mover piezas ${colorName}, no piezas ${wrongColorName}`);
                setTimeout(() => setErrorMessage(''), 2000);
                return;
            }

            const hasMoveOptions = getMoveOptions(square);
            if (hasMoveOptions) {
                setMoveFrom(square);
            }
            return;
        }

        // Si hay moveFrom, intentar hacer el movimiento
        if (moveFrom) {
            const moves = chessGameRef.current.moves({
                square: moveFrom,
                verbose: true,
            });
            const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

            // Si no es un movimiento válido
            if (!foundMove) {
                // Verificar si se clickeó una nueva pieza
                if (piece) {
                    const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'white' : 'black';
                    if (pieceColor === playerColor) {
                        const hasMoveOptions = getMoveOptions(square);
                        setMoveFrom(hasMoveOptions ? square : '');
                        return;
                    }
                }

                // Limpiar selección
                setMoveFrom('');
                setOptionSquares({});
                return;
            }

            // Hacer el movimiento
            // Verificar si es una promoción
            if (detectPromotion(moveFrom, square)) {
                return; // Detener aquí y esperar selección de promoción
            }

            makeMove(moveFrom, square, foundMove.promotion);
        }
    }, [moveFrom, isPlayerTurn, isThinking, playerColor, getMoveOptions, makeMove, detectPromotion]);

    // Manejar drop de pieza (drag and drop)
    const onPieceDrop = useCallback(({ sourceSquare, targetSquare, piece }) => {

        // Solo permitir mover si es el turno del jugador y la IA no está pensando
        if (!isPlayerTurn || isThinking) {
            setErrorMessage(!isPlayerTurn ? 'No es tu turno' : 'Espera a que Stockfish termine de pensar');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        // Verificar que la pieza es del color correcto del jugador
        const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'white' : 'black';
        if (pieceColor !== playerColor) {
            const colorName = playerColor === 'white' ? 'blancas' : 'negras';
            const wrongColorName = playerColor === 'white' ? 'negras' : 'blancas';
            setErrorMessage(`Solo puedes mover piezas ${colorName}, no piezas ${wrongColorName}`);
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        // Verificar si es una promoción
        if (detectPromotion(sourceSquare, targetSquare)) {
            return true; // Detener aquí y esperar selección de promoción
        }

        // Hacer el movimiento normal
        return makeMove(sourceSquare, targetSquare);
    }, [isPlayerTurn, isThinking, playerColor, makeMove, detectPromotion]);

    // Manejar right-click en casillas
    const onSquareRightClick = useCallback(({ square }) => {
        const color = 'rgba(0, 0, 255, 0.4)';
        setRightClickedSquares(prev => ({
            ...prev,
            [square]: prev[square] ? undefined : { backgroundColor: color }
        }));
    }, []);

    // Funciones de control del juego
    const handleResign = () => {
        const result = 'Gana Stockfish';
        setGameStatus('ended');
        setGameResult('Gana Stockfish - Te rendiste');
        setShowResignModal(false);

        // Guardar partida en la base de datos
        saveGameToDatabase(result);

        if (onGameEnd) onGameEnd('Gana Stockfish - Te rendiste');
    };

    const handleNewGame = useCallback(() => {
        // Reiniciar el juego
        chessGameRef.current = new Chess();
        setGamePosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        setMoveHistory([]);
        setCurrentTurn('white');
        setGameStatus('active');
        setCapturedPieces({ white: [], black: [] });
        setMoveFrom('');
        setOptionSquares({});
        setRightClickedSquares({});
        setCustomSquareStyles({});
        setGameResult('');
        setErrorMessage('');
        setIsThinking(false);
        setPromotionMove(null);
        setShowPromotionModal(false);
    }, []);

    // Función para copiar FEN
    const copyFEN = () => {
        navigator.clipboard.writeText(chessGameRef.current.fen());
        setErrorMessage('FEN copiado al portapapeles');
        setTimeout(() => setErrorMessage(''), 2000);
    };

    // Cargar dificultades disponibles al montar el componente
    useEffect(() => {
        const loadDifficulties = async () => {
            try {
                const response = await fetch('http://localhost:8000/analysis/stockfish-dificultades');
                if (response.ok) {
                    const data = await response.json();
                    setDifficulties(data.dificultades);
                }
            } catch (error) {
                console.error('Error cargando dificultades:', error);
            }
        };
        loadDifficulties();
    }, []);

    // useEffect para hacer que Stockfish juegue cuando es su turno al inicio
    useEffect(() => {
        // Si el jugador eligió negras, es una nueva partida (sin movimientos), 
        // y es el turno de las blancas (Stockfish), hacer que juegue
        if (playerColor === 'black' &&
            gameStatus === 'active' &&
            currentTurn === 'white' &&
            moveHistory.length === 0 &&
            !isThinking) {
            setTimeout(() => makeStockfishMove(), 500);
        }
    }, [playerColor, gameStatus, currentTurn, moveHistory.length, isThinking, makeStockfishMove]);

    // Auto-scroll del historial de movimientos
    useEffect(() => {
        if (movesContainerRef.current) {
            movesContainerRef.current.scrollTop = movesContainerRef.current.scrollHeight;
        }
    }, [moveHistory]);

    // Actualizar estilos cuando la posición cambie
    useEffect(() => {
        if (gamePosition && gameStatus === 'active') {
            updateSquareStyles(chessGameRef.current);
        }
    }, [gamePosition, gameStatus, updateSquareStyles]);

    // Configuración del tablero para react-chessboard v5
    const chessboardOptions = {
        position: gamePosition,
        onPieceDrop,
        onSquareClick,
        onSquareRightClick,
        boardOrientation,
        squareStyles: {
            ...optionSquares,
            ...rightClickedSquares,
            ...customSquareStyles
        },
        allowDragging: isPlayerTurn && gameStatus === 'active' && !isThinking,
        id: 'chessboard-ai',
        showNotation: true,
        animationDurationInMs: 200
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Panel izquierdo - Información del juego */}
            <div className="lg:w-1/3 space-y-4">
                {/* Información de jugadores */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
                        Jugador vs Stockfish
                    </h2>

                    {/* Jugador */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FaUser className="text-blue-600 text-xl" />
                            <div>
                                <h3 className="font-semibold text-gray-800">{user?.username || 'Jugador'}</h3>
                                <p className="text-sm text-gray-600">Jugando con blancas</p>
                            </div>
                        </div>
                        {currentTurn === 'white' && gameStatus === 'active' && (
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                    </div>

                    {/* Stockfish */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <FaRobot className="text-gray-700 text-xl" />
                            <div>
                                <h3 className="font-semibold text-gray-800">Stockfish</h3>
                                <p className="text-sm text-gray-600">Jugando con negras</p>
                            </div>
                        </div>
                        {currentTurn === 'black' && gameStatus === 'active' && (
                            <div className="flex items-center space-x-2">
                                {isThinking && <FaSpinner className="animate-spin text-gray-600" />}
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        )}
                    </div>

                    {/* Estado del juego */}
                    {gameStatus === 'active' && (
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="font-medium text-green-800">
                                {isThinking ? 'Stockfish está pensando...' :
                                    isPlayerTurn ? 'Tu turno' : 'Turno de Stockfish'}
                            </p>
                        </div>
                    )}

                    {gameResult && (
                        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="font-bold text-yellow-800">{gameResult}</p>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-red-700">{errorMessage}</p>
                        </div>
                    )}
                </div>

                {/* Selector de dificultad */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <FaRobot className="mr-2 text-purple-600" />
                        Dificultad de Stockfish
                    </h3>

                    <div className="mb-3">
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            disabled={gameStatus === 'active' && moveHistory.length > 0}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {Object.entries(difficulties).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')} (~{config.elo} ELO)
                                </option>
                            ))}
                        </select>
                    </div>

                    {difficulties[difficulty] && (
                        <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-purple-700">ELO Aproximado:</span>
                                <span className="font-bold text-purple-800">~{difficulties[difficulty].elo}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{difficulties[difficulty].descripcion}</p>
                            {gameStatus === 'active' && moveHistory.length > 0 && (
                                <div className="flex items-center text-orange-600 text-xs mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                                    <span className="mr-1">⚠️</span>
                                    <span>La dificultad solo se puede cambiar al iniciar una nueva partida</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selector de color del jugador */}
                <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200 rounded-2xl shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                        <FaUser className="mr-2 text-blue-600" />
                        Color del Jugador
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                            onClick={() => setPlayerColor('white')}
                            disabled={gameStatus === 'active' && moveHistory.length > 0}
                            className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${playerColor === 'white'
                                ? 'border-blue-500 bg-blue-100 text-blue-800'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <span className="text-xl">♔</span>
                            <span className="font-medium">Blancas</span>
                        </button>

                        <button
                            onClick={() => setPlayerColor('black')}
                            disabled={gameStatus === 'active' && moveHistory.length > 0}
                            className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${playerColor === 'black'
                                ? 'border-blue-500 bg-blue-100 text-blue-800'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <span className="text-xl">♚</span>
                            <span className="font-medium">Negras</span>
                        </button>
                    </div>

                    <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">Juegas con:</span>
                            <span className="font-bold text-blue-800">
                                {playerColor === 'white' ? '♔ Blancas' : '♚ Negras'}
                            </span>
                        </div>
                        <p className="text-gray-700">
                            {playerColor === 'white'
                                ? 'Mueves primero (ventaja de apertura)'
                                : 'Stockfish mueve primero, tú respondes'}
                        </p>
                        {gameStatus === 'active' && moveHistory.length > 0 && (
                            <div className="flex items-center text-orange-600 text-xs mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                                <span className="mr-1">⚠️</span>
                                <span>El color solo se puede cambiar al iniciar una nueva partida</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Piezas capturadas */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Piezas Capturadas</h3>

                    {/* Piezas capturadas por el jugador */}
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Capturadas por ti:</h4>
                        <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-gray-50 rounded-lg">
                            {(playerColor === 'white' ? capturedPieces.white : capturedPieces.black).length > 0 ? (
                                (playerColor === 'white' ? capturedPieces.white : capturedPieces.black).map((piece, index) => (
                                    <CapturedPiece key={index} piece={piece} size={24} />
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">Ninguna</span>
                            )}
                        </div>
                    </div>

                    {/* Piezas capturadas por Stockfish */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Capturadas por Stockfish:</h4>
                        <div className="flex flex-wrap gap-1 min-h-[32px] p-2 bg-gray-50 rounded-lg">
                            {(playerColor === 'white' ? capturedPieces.black : capturedPieces.white).length > 0 ? (
                                (playerColor === 'white' ? capturedPieces.black : capturedPieces.white).map((piece, index) => (
                                    <CapturedPiece key={index} piece={piece} size={24} />
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">Ninguna</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Historial de movimientos */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Movimientos ({moveHistory.length} jugadas)
                    </h3>
                    <div
                        ref={movesContainerRef}
                        className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg"
                    >
                        {moveHistory.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left">#</th>
                                        <th className="px-3 py-2 text-left">Jugador</th>
                                        <th className="px-3 py-2 text-left">Movimiento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {moveHistory.map((move, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-3 py-2 font-medium">{index + 1}</td>
                                            <td className="px-3 py-2">
                                                <span className={move.player === 'Jugador' ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                                                    {move.player === 'Jugador' ? (
                                                        <><FaUser className="inline mr-1" />{move.player}</>
                                                    ) : (
                                                        <><FaRobot className="inline mr-1" />{move.player}</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 font-mono">{move.san}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                <p>No hay movimientos aún</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Panel central - Tablero */}
            <div className="lg:w-1/2 flex justify-center">
                <div className="w-full max-w-[600px]">
                    <div className="bg-white rounded-2xl shadow-2xl p-6">
                        <Chessboard options={chessboardOptions} />

                        {/* Controles del juego */}
                        <div className="flex justify-center space-x-4 mt-6">
                            <button
                                onClick={() => setShowResignModal(true)}
                                disabled={gameStatus !== 'active'}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaFlag />
                                <span>Rendirse</span>
                            </button>
                            <button
                                onClick={handleNewGame}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FaSync />
                                <span>Nueva Partida</span>
                            </button>
                            <button
                                onClick={copyFEN}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <FaCopy />
                                <span>Copiar FEN</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Panel derecho - Espacio para futuras características */}
            <div className="lg:w-1/6">
                {/* Aquí se pueden agregar características adicionales en el futuro */}
            </div>

            {/* Modal de rendición */}
            <Modal
                isOpen={showResignModal}
                onClose={() => setShowResignModal(false)}
                title="Confirmar Rendición"
                message="¿Estás seguro de que quieres rendirte? Stockfish ganará la partida."
                type="warning"
                onConfirm={handleResign}
                onCancel={() => setShowResignModal(false)}
                confirmText="Sí, Rendirse"
                cancelText="Cancelar"
            />

            {/* Modal de promoción de peón */}
            {showPromotionModal && promotionMove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            Selecciona pieza de promoción
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {['q', 'r', 'n', 'b'].map(piece => {
                                // Usar piezas del color del jugador
                                const pieceKey = playerColor === 'white' ? piece.toUpperCase() : piece.toLowerCase();
                                return (
                                    <button
                                        key={piece}
                                        onClick={() => handlePromotionSelect(piece)}
                                        className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                    >
                                        <CapturedPiece piece={pieceKey} size={48} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
