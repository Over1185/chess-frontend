import { useState, useCallback, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useWebSocket } from '../hooks/useWebSocket';
import { FaFlag, FaHandshake, FaCopy, FaSpinner } from 'react-icons/fa';
import Modal from './Modal';

const WEBSOCKET_URL = 'ws://localhost:8000/ws';

export default function ChessBoardOnlineNew({ gameData, user, onGameEnd }) {
    // Usar ref para mantener la instancia del juego a través de renders
    const chessGameRef = useRef(new Chess());

    // Estado del juego
    const [gamePosition, setGamePosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentTurn, setCurrentTurn] = useState('white');
    const [gameStatus, setGameStatus] = useState('loading');
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

    // Estados para funcionalidad de click to move
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [rightClickedSquares, setRightClickedSquares] = useState({});

    // Estados de UI
    const [showResignModal, setShowResignModal] = useState(false);
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [gameResult, setGameResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Determinar el color del jugador y orientación del tablero
    const playerColor = gameData?.player_color || 'white';
    const boardOrientation = playerColor; // 'white' o 'black'
    const isPlayerTurn = currentTurn === playerColor;

    // WebSocket connection
    const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
        WEBSOCKET_URL,
        gameData?.session_token || user?.token
    );

    // Función para calcular piezas capturadas
    const calculateCapturedPieces = useCallback((gameInstance) => {
        const initialPieces = {
            'p': 8, 'r': 2, 'n': 2, 'b': 2, 'q': 1, 'k': 1,
            'P': 8, 'R': 2, 'N': 2, 'B': 2, 'Q': 1, 'K': 1
        };

        const currentPieces = {};
        const board = gameInstance.board();

        // Contar piezas actuales en el tablero
        board.forEach(row => {
            row.forEach(square => {
                if (square) {
                    const pieceKey = square.color === 'w' ? square.type.toUpperCase() : square.type;
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
                    // Pieza blanca capturada
                    captured.white.push(piece.toLowerCase());
                } else {
                    // Pieza negra capturada
                    captured.black.push(piece);
                }
            }
        });

        setCapturedPieces(captured);
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

    // Función para hacer un movimiento
    const makeMove = useCallback((from, to, promotion = 'q') => {
        // Verificar que es el turno del jugador
        if (!isPlayerTurn || gameStatus !== 'active') {
            setErrorMessage('No es tu turno');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        try {
            const gameCopy = new Chess(chessGameRef.current.fen());
            const move = gameCopy.move({
                from,
                to,
                promotion
            });

            if (move) {
                // Actualizar estado local inmediatamente
                chessGameRef.current = gameCopy;
                setGamePosition(gameCopy.fen());
                setCurrentTurn(gameCopy.turn() === 'w' ? 'white' : 'black');
                calculateCapturedPieces(gameCopy);

                // Enviar movimiento al servidor
                const moveData = {
                    type: 'move',
                    game_id: gameData.id,
                    from,
                    to,
                    promotion: move.promotion || null,
                    san: move.san,
                    fen: gameCopy.fen()
                };

                console.log('Enviando movimiento:', moveData);
                sendMessage(moveData);

                // Agregar al historial
                setMoveHistory(prev => [...prev, {
                    from,
                    to,
                    san: move.san,
                    promotion: move.promotion
                }]);

                // Limpiar selección
                setMoveFrom('');
                setOptionSquares({});

                // Verificar fin del juego
                if (gameCopy.isGameOver()) {
                    let result = 'Empate';
                    if (gameCopy.isCheckmate()) {
                        result = gameCopy.turn() === 'w' ? 'Ganan las negras' : 'Ganan las blancas';
                    }
                    setGameStatus('ended');
                    setGameResult(result);
                }

                return true;
            }
        } catch (error) {
            console.error('Error making move:', error);
            setErrorMessage('Movimiento inválido');
            setTimeout(() => setErrorMessage(''), 2000);
        }
        return false;
    }, [isPlayerTurn, gameStatus, gameData.id, sendMessage, calculateCapturedPieces]);

    // Manejar movimiento del oponente
    const handleOpponentMove = useCallback((moveData) => {
        console.log('Movimiento del oponente recibido:', moveData);
        try {
            const gameCopy = new Chess(chessGameRef.current.fen());
            const move = gameCopy.move({
                from: moveData.from,
                to: moveData.to,
                promotion: moveData.promotion || 'q'
            });

            if (move) {
                chessGameRef.current = gameCopy;
                setGamePosition(gameCopy.fen());
                setCurrentTurn(gameCopy.turn() === 'w' ? 'white' : 'black');
                calculateCapturedPieces(gameCopy);

                // Agregar al historial
                setMoveHistory(prev => [...prev, {
                    from: moveData.from,
                    to: moveData.to,
                    san: moveData.san || move.san,
                    promotion: moveData.promotion
                }]);

                // Verificar fin del juego
                if (gameCopy.isGameOver()) {
                    let result = 'Empate';
                    if (gameCopy.isCheckmate()) {
                        result = gameCopy.turn() === 'w' ? 'Ganan las negras' : 'Ganan las blancas';
                    }
                    setGameStatus('ended');
                    setGameResult(result);
                }
            }
        } catch (error) {
            console.error('Error processing opponent move:', error);
        }
    }, [calculateCapturedPieces]);

    // Procesar mensajes del WebSocket
    useEffect(() => {
        if (lastMessage) {

            switch (lastMessage.type) {
                case 'move':
                    handleOpponentMove(lastMessage);
                    break;
                case 'game_state':
                    // Actualizar estado completo del juego
                    try {
                        const newGame = new Chess(lastMessage.fen);
                        chessGameRef.current = newGame;
                        setGamePosition(newGame.fen());
                        setCurrentTurn(newGame.turn() === 'w' ? 'white' : 'black');
                        setMoveHistory(lastMessage.moves || []);
                        calculateCapturedPieces(newGame);
                        setGameStatus('active');
                    } catch (error) {
                        console.error('Error updating game state:', error);
                    }
                    break;
                case 'game_end':
                    setGameStatus('ended');
                    setGameResult(lastMessage.result);
                    break;
                case 'error':
                    setErrorMessage(lastMessage.message);
                    setTimeout(() => setErrorMessage(''), 3000);
                    break;
                default:
                    console.log('Mensaje no manejado:', lastMessage.type);
            }
        }
    }, [lastMessage, handleOpponentMove, calculateCapturedPieces]);

    // Inicializar juego cuando se reciben los datos
    useEffect(() => {
        if (gameData) {
            console.log('Inicializando juego con datos:', gameData);
            try {
                const fen = gameData.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                const newGame = new Chess(fen);
                chessGameRef.current = newGame;
                setGamePosition(newGame.fen());
                setCurrentTurn(newGame.turn() === 'w' ? 'white' : 'black');
                setMoveHistory(gameData.moves || []);
                calculateCapturedPieces(newGame);
                setGameStatus('active');

                // Unirse a la partida si hay ID
                if (gameData.id && sendMessage) {
                    sendMessage({
                        type: 'join_game',
                        game_id: gameData.id
                    });
                }
            } catch (error) {
                console.error('Error loading game state:', error);
                setErrorMessage('Error al cargar la partida');
            }
        }
    }, [gameData, sendMessage, calculateCapturedPieces]);

    // Manejar click en casilla
    const onSquareClick = useCallback(({ square, piece }) => {
        console.log('Square clicked:', square, 'Piece:', piece, 'Player turn:', isPlayerTurn);

        // No permitir clicks si no es el turno del jugador o el juego no está activo
        if (!isPlayerTurn || gameStatus !== 'active') {
            return;
        }

        // Si no hay moveFrom y hay una pieza, seleccionar pieza para mover
        if (!moveFrom && piece) {
            // Verificar que la pieza es del color correcto
            const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'white' : 'black';
            if (pieceColor !== playerColor) {
                setErrorMessage('No puedes mover piezas del oponente');
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
            makeMove(moveFrom, square, foundMove.promotion);
        }
    }, [moveFrom, isPlayerTurn, gameStatus, playerColor, getMoveOptions, makeMove]);

    // Manejar drop de pieza (drag and drop)
    const onPieceDrop = useCallback(({ sourceSquare, targetSquare, piece }) => {
        console.log('Piece dropped:', sourceSquare, '->', targetSquare, 'Piece:', piece);

        // Solo permitir mover si es el turno del jugador
        if (!isPlayerTurn || gameStatus !== 'active') {
            setErrorMessage('No es tu turno');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        // Verificar que la pieza es del color correcto
        const pieceColor = piece.pieceType.charAt(0) === 'w' ? 'white' : 'black';
        if (pieceColor !== playerColor) {
            setErrorMessage('No puedes mover piezas del oponente');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        // Hacer el movimiento
        return makeMove(sourceSquare, targetSquare);
    }, [isPlayerTurn, gameStatus, playerColor, makeMove]);

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
        if (sendMessage) {
            sendMessage({
                type: 'resign',
                game_id: gameData.id,
                player: playerColor
            });
        }
        setShowResignModal(false);
        setGameStatus('ended');
        setGameResult(`${playerColor === 'white' ? 'Negras' : 'Blancas'} ganan por abandono`);
    };

    const handleOfferDraw = () => {
        if (sendMessage) {
            sendMessage({
                type: 'draw_offer',
                game_id: gameData.id,
                player: playerColor
            });
        }
        setShowDrawModal(false);
    };

    const copyFEN = () => {
        navigator.clipboard.writeText(gamePosition);
        setErrorMessage('FEN copiado al portapapeles');
        setTimeout(() => setErrorMessage(''), 2000);
    };

    // Configuración del tablero para react-chessboard v5
    const chessboardOptions = {
        position: gamePosition,
        onPieceDrop,
        onSquareClick,
        onSquareRightClick,
        boardOrientation,
        squareStyles: {
            ...optionSquares,
            ...rightClickedSquares
        },
        allowDragging: isPlayerTurn && gameStatus === 'active',
        id: `chessboard-${gameData?.id || 'default'}`,
        showNotation: true,
        animationDurationInMs: 200
    };

    // Renderizado condicional para estados de carga
    if (!gameData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando partida...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Error: Usuario no encontrado</p>
                    <button
                        onClick={() => onGameEnd && onGameEnd()}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Volver al menú
                    </button>
                </div>
            </div>
        );
    }

    if (gameStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Conectando a la partida...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header del juego */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Partida vs {gameData.opponent_name}
                            </h1>
                            <p className="text-gray-600">
                                Juegas con {playerColor === 'white' ? 'blancas' : 'negras'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${connectionStatus === 'Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {connectionStatus === 'Connected' ? 'Conectado' : 'Desconectado'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPlayerTurn ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {isPlayerTurn ? 'Tu turno' : 'Turno del oponente'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Layout principal */}
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Panel izquierdo - Información del oponente */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">
                                {gameData.opponent_name}
                                <span className="text-sm text-gray-500 block">
                                    ({playerColor === 'white' ? 'Negras' : 'Blancas'})
                                </span>
                            </h3>

                            {/* Piezas capturadas del oponente */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Piezas capturadas:</p>
                                <div className="flex flex-wrap gap-1">
                                    {capturedPieces[playerColor === 'white' ? 'black' : 'white'].map((piece, index) => (
                                        <span key={index} className="text-lg">
                                            {piece === 'p' ? '♟' : piece === 'r' ? '♜' : piece === 'n' ? '♞' :
                                                piece === 'b' ? '♝' : piece === 'q' ? '♛' : '♚'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tablero central */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="aspect-square max-w-full mx-auto">
                                <Chessboard options={chessboardOptions} />
                            </div>

                            {/* Controles del juego */}
                            {gameStatus === 'active' && (
                                <div className="flex justify-center space-x-4 mt-6">
                                    <button
                                        onClick={() => setShowResignModal(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <FaFlag />
                                        <span>Rendirse</span>
                                    </button>
                                    <button
                                        onClick={() => setShowDrawModal(true)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                    >
                                        <FaHandshake />
                                        <span>Ofrecer Tablas</span>
                                    </button>
                                    <button
                                        onClick={copyFEN}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        <FaCopy />
                                        <span>Copiar FEN</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel derecho - Información del jugador y historial */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <h3 className="font-bold text-gray-800 mb-4">
                                {user?.name || user?.username}
                                <span className="text-sm text-gray-500 block">
                                    ({playerColor === 'white' ? 'Blancas' : 'Negras'})
                                </span>
                            </h3>

                            {/* Piezas capturadas del jugador */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Piezas capturadas:</p>
                                <div className="flex flex-wrap gap-1">
                                    {capturedPieces[playerColor].map((piece, index) => (
                                        <span key={index} className="text-lg">
                                            {piece === 'P' ? '♙' : piece === 'R' ? '♖' : piece === 'N' ? '♘' :
                                                piece === 'B' ? '♗' : piece === 'Q' ? '♕' : '♔'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Historial de movimientos */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Movimientos</h3>
                            <div className="max-h-96 overflow-y-auto space-y-1">
                                {moveHistory.map((move, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{Math.floor(index / 2) + 1}.</span>
                                        <span className="text-gray-800">{move.san}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensajes de error */}
                {errorMessage && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        {errorMessage}
                    </div>
                )}

                {/* Resultado del juego */}
                {gameStatus === 'ended' && gameResult && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-bold text-center mb-4">Partida Terminada</h2>
                            <p className="text-center text-gray-600 mb-6">{gameResult}</p>
                            <button
                                onClick={() => onGameEnd && onGameEnd()}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Volver al Menú
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            <Modal
                isOpen={showResignModal}
                onClose={() => setShowResignModal(false)}
                title="Confirmar Rendición"
            >
                <p className="text-gray-600 mb-6">¿Estás seguro de que quieres rendirte?</p>
                <div className="flex space-x-4">
                    <button
                        onClick={handleResign}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Sí, Rendirse
                    </button>
                    <button
                        onClick={() => setShowResignModal(false)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={showDrawModal}
                onClose={() => setShowDrawModal(false)}
                title="Ofrecer Tablas"
            >
                <p className="text-gray-600 mb-6">¿Quieres ofrecer tablas a tu oponente?</p>
                <div className="flex space-x-4">
                    <button
                        onClick={handleOfferDraw}
                        className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                        Sí, Ofrecer Tablas
                    </button>
                    <button
                        onClick={() => setShowDrawModal(false)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </Modal>
        </div>
    );
}
