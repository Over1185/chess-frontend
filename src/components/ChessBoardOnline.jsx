import { useState, useCallback, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useWebSocket } from '../hooks/useWebSocket';
import { FaFlag, FaHandshake, FaCopy } from 'react-icons/fa';
import Modal from './Modal';

const WEBSOCKET_URL = 'ws://localhost:8000/ws';

export default function ChessBoardOnline({ gameData, user, onGameEnd }) {

    // Usar ref para mantener la instancia del juego a través de renders
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    // Estado del juego
    const [gamePosition, setGamePosition] = useState(chessGame.fen());
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentTurn, setCurrentTurn] = useState('white');
    const [gameStatus, setGameStatus] = useState('active');
    const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });

    // Estados para funcionalidad de click
    const [moveFrom, setMoveFrom] = useState('');
    const [optionSquares, setOptionSquares] = useState({});
    const [rightClickedSquares, setRightClickedSquares] = useState({});

    // Estados de UI
    const [showResignModal, setShowResignModal] = useState(false);
    const [showDrawModal, setShowDrawModal] = useState(false);
    const [gameResult, setGameResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Determinar el color del jugador
    const playerColor = gameData?.player_color || 'white';
    const isPlayerTurn = currentTurn === playerColor;

    console.log('Game state debug:', {
        playerColor,
        currentTurn,
        isPlayerTurn,
        gameStatus,
        gamePosition: gamePosition.substring(0, 20) + '...'
    });

    // WebSocket connection
    const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
        WEBSOCKET_URL,
        user?.token  // Usar el token del usuario directamente
    );

    useEffect(() => {
        setIsConnected(connectionStatus === 'Connected');
    }, [connectionStatus]);

    const calculateCapturedPieces = useCallback((chessGame) => {
        const initialPieces = {
            'p': 8, 'r': 2, 'n': 2, 'b': 2, 'q': 1, 'k': 1,
            'P': 8, 'R': 2, 'N': 2, 'B': 2, 'Q': 1, 'K': 1
        };

        const currentPieces = {};
        const board = chessGame.board();

        // Contar piezas actuales en el tablero
        board.forEach(row => {
            row.forEach(square => {
                if (square) {
                    currentPieces[square.color === 'w' ? square.type.toUpperCase() : square.type] =
                        (currentPieces[square.color === 'w' ? square.type.toUpperCase() : square.type] || 0) + 1;
                }
            });
        });

        const captured = { white: [], black: [] };

        // Calcular piezas capturadas
        Object.keys(initialPieces).forEach(piece => {
            const current = currentPieces[piece] || 0;
            const captured_count = initialPieces[piece] - current;

            for (let i = 0; i < captured_count; i++) {
                if (piece === piece.toUpperCase()) {
                    captured.white.push(piece.toLowerCase());
                } else {
                    captured.black.push(piece);
                }
            }
        });

        setCapturedPieces(captured);
    }, []);

    const updateGameState = useCallback((data) => {
        try {
            const newGame = new Chess(data.fen);
            chessGameRef.current = newGame;
            setGamePosition(newGame.fen());
            setCurrentTurn(newGame.turn() === 'w' ? 'white' : 'black');
            setMoveHistory(data.moves || []);
            calculateCapturedPieces(newGame);
        } catch (error) {
            console.error('Error updating game state:', error);
        }
    }, [calculateCapturedPieces]);

    const handleOpponentMove = useCallback((moveData) => {
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
                setMoveHistory(prev => [...prev, moveData]);
                calculateCapturedPieces(gameCopy);

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
            console.log('Mensaje recibido en ChessBoardOnline:', lastMessage);

            switch (lastMessage.type) {
                case 'move':
                    handleOpponentMove(lastMessage.move);
                    break;
                case 'game_state':
                    updateGameState(lastMessage);
                    break;
                case 'game_end':
                    setGameStatus('ended');
                    setGameResult(lastMessage.result);
                    if (onGameEnd) onGameEnd(lastMessage);
                    break;
                case 'error':
                    setErrorMessage(lastMessage.message);
                    setTimeout(() => setErrorMessage(''), 3000);
                    break;
                default:
                    console.log('Mensaje no manejado:', lastMessage);
            }
        }
    }, [lastMessage, handleOpponentMove, updateGameState, onGameEnd]);

    // Inicializar juego cuando se reciben los datos
    useEffect(() => {
        if (gameData?.current_fen) {
            try {
                const newGame = new Chess(gameData.current_fen);
                chessGameRef.current = newGame;
                setGamePosition(newGame.fen());
                setCurrentTurn(newGame.turn() === 'w' ? 'white' : 'black');
                setMoveHistory(gameData.moves || []);

                // Calcular piezas capturadas
                calculateCapturedPieces(newGame);
            } catch (error) {
                console.error('Error loading game state:', error);
            }
        }
    }, [gameData, calculateCapturedPieces]);

    // Función para obtener opciones de movimiento (click to move)
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

        // Agregar círculos para movimientos válidos
        moves.forEach(move => {
            newSquares[move.to] = {
                background:
                    chessGameRef.current.get(move.to) &&
                        chessGameRef.current.get(move.to)?.color !== chessGameRef.current.get(square)?.color
                        ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // círculo grande para captura
                        : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', // círculo pequeño para movimiento
                borderRadius: '50%',
            };
        });

        // Marcar el cuadrado seleccionado
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)',
        };

        setOptionSquares(newSquares);
        return true;
    }, []);

    // Función unificada para hacer movimientos
    const makeMove = useCallback((from, to, promotion = 'q') => {
        try {
            const gameCopy = new Chess(chessGameRef.current.fen());
            const move = gameCopy.move({
                from,
                to,
                promotion
            });

            if (move) {
                chessGameRef.current = gameCopy;
                setGamePosition(gameCopy.fen());
                setCurrentTurn(gameCopy.turn() === 'w' ? 'white' : 'black');

                // Enviar movimiento al servidor
                const moveData = {
                    type: 'move',
                    from,
                    to,
                    promotion: move.promotion || null,
                    san: move.san,
                    fen: gameCopy.fen()
                };

                console.log('Sending move:', moveData);
                sendMessage(moveData);
                setMoveHistory(prev => [...prev, moveData]);
                calculateCapturedPieces(gameCopy);

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
        }
        return false;
    }, [sendMessage, calculateCapturedPieces]);

    // Función para manejar clicks en cuadrados
    const onSquareClick = useCallback(({ square, piece }) => {
        console.log('=== onSquareClick INICIO ===');
        console.log('Square clicked:', square, 'Piece:', piece, 'IsPlayerTurn:', isPlayerTurn);
        console.log('gameStatus:', gameStatus, 'currentTurn:', currentTurn, 'playerColor:', playerColor);

        // No permitir clicks si no es el turno del jugador o el juego no está activo
        if (!isPlayerTurn || gameStatus !== 'active') {
            console.log('❌ Cannot click - isPlayerTurn:', isPlayerTurn, 'gameStatus:', gameStatus);
            return;
        }

        // Si no hay moveFrom y hay una pieza, seleccionar pieza para mover
        if (!moveFrom && piece) {
            // Verificar que la pieza es del color correcto
            const pieceColor = piece.charAt(0) === 'w' ? 'white' : 'black';
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
                    const pieceColor = piece.charAt(0) === 'w' ? 'white' : 'black';
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
    }, [moveFrom, isPlayerTurn, gameStatus, playerColor, currentTurn, getMoveOptions, makeMove]);

    const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
        console.log('=== onPieceDrop INICIO ===');
        console.log('onPieceDrop called:', { sourceSquare, targetSquare, isPlayerTurn, playerColor });
        console.log('gameStatus:', gameStatus);
        console.log('currentTurn:', currentTurn);

        // Solo permitir mover si es el turno del jugador
        if (!isPlayerTurn) {
            console.log('❌ Not player turn - isPlayerTurn:', isPlayerTurn);
            setErrorMessage('No es tu turno');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        // Verificar estado del juego
        if (gameStatus !== 'active') {
            console.log('❌ Game not active - gameStatus:', gameStatus);
            return false;
        }

        // Verificar que el movimiento es del color correcto
        const piece = chessGameRef.current.get(sourceSquare);
        console.log('Piece at source square:', piece);

        if (piece && piece.color !== (playerColor === 'white' ? 'w' : 'b')) {
            console.log('❌ Wrong piece color - piece.color:', piece.color, 'expected:', playerColor === 'white' ? 'w' : 'b');
            setErrorMessage('No puedes mover piezas del oponente');
            setTimeout(() => setErrorMessage(''), 2000);
            return false;
        }

        console.log('✅ All checks passed, calling makeMove');
        // Hacer el movimiento usando la función unificada
        const success = makeMove(sourceSquare, targetSquare);
        console.log('makeMove result:', success);
        return success;
    }, [isPlayerTurn, playerColor, gameStatus, currentTurn, makeMove]);

    // Función para manejar right-click en squares (para marcar/desmarcar)
    const onSquareRightClick = useCallback((square) => {
        const color = 'rgba(0, 0, 255, 0.4)';
        setRightClickedSquares(prev => ({
            ...prev,
            [square]: prev[square] ? undefined : { backgroundColor: color }
        }));
    }, []);

    const handleResign = () => {
        if (sendMessage) {
            sendMessage({
                type: 'resign',
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

    // Validaciones de datos necesarios
    console.log('Validation check:', {
        hasGameData: !!gameData,
        hasUser: !!user,
        hasSessionToken: !!gameData?.session_token,
        playerColor: gameData?.player_color,
        opponentName: gameData?.opponent_name
    });

    if (!gameData) {
        console.log('No gameData provided, showing loading screen');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando partida...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('No user provided, showing error');
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

    if (!gameData.session_token) {
        console.log('No session token provided, showing error');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Error: Token de sesión no encontrado</p>
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

    console.log('All validations passed, rendering chessboard');

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
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {isConnected ? 'Conectado' : 'Desconectado'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${isPlayerTurn ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {isPlayerTurn ? 'Tu turno' : 'Turno del oponente'}
                            </div>
                        </div>
                    </div>
                </div>

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
                                <Chessboard
                                    position={gamePosition}
                                    onPieceDrop={onPieceDrop}
                                    onSquareClick={onSquareClick}
                                    onSquareRightClick={onSquareRightClick}
                                    boardOrientation={playerColor === 'white' ? 'white' : 'black'}
                                    arePiecesDraggable={true} // Temporalmente siempre true para debug
                                    customSquareStyles={{
                                        ...optionSquares,
                                        ...rightClickedSquares
                                    }}
                                    onDragOverSquare={(square) => {
                                        // Mostrar posibles movimientos cuando se arrastra sobre un square
                                        if (moveFrom) {
                                            const moves = chessGameRef.current.moves({
                                                square: moveFrom,
                                                verbose: true,
                                            });
                                            const move = moves.find(m => m.to === square);
                                            if (move) {
                                                return {
                                                    background: 'rgba(0, 255, 0, 0.4)'
                                                };
                                            }
                                        }
                                        return {};
                                    }}
                                    onPieceDragBegin={(piece, sourceSquare) => {
                                        console.log(`Drag started: ${piece} from ${sourceSquare}`);
                                        // Mostrar opciones de movimiento cuando se empieza a arrastrar
                                        getMoveOptions(sourceSquare);
                                        setMoveFrom(sourceSquare);
                                    }}
                                    onPieceDragEnd={() => {
                                        console.log('Drag ended');
                                        // Limpiar opciones cuando se termina de arrastrar
                                        setOptionSquares({});
                                        setMoveFrom('');
                                    }}
                                    customBoardStyle={{
                                        borderRadius: '4px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                                    }}
                                    customDarkSquareStyle={{ backgroundColor: '#779952' }}
                                    customLightSquareStyle={{ backgroundColor: '#edeed1' }}
                                />
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

                    {/* Panel derecho - Información del jugador */}
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
