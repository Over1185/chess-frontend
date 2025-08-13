import { useState, useCallback, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { FaFlag, FaHandshake, FaCopy, FaSpinner } from 'react-icons/fa';
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

const WEBSOCKET_URL = 'ws://localhost:8000/ws';

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

export default function ChessBoardOnline({ gameData, user, onGameEnd }) {
    // Usar ref para mantener la instancia del juego a través de renders
    const chessGameRef = useRef(new Chess());

    // Ref para el contenedor de movimientos
    const movesContainerRef = useRef(null);

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
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferFrom, setDrawOfferFrom] = useState('');
    const [gameResult, setGameResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Estados para promoción de peones
    const [promotionMove, setPromotionMove] = useState(null);
    const [showPromotionModal, setShowPromotionModal] = useState(false);

    // Estados para estilos de casillas (jaque, etc.)
    const [customSquareStyles, setCustomSquareStyles] = useState({});

    const hasConnectedRef = useRef(false);

    // Determinar el color del jugador y orientación del tablero
    const playerColor = gameData?.player_color || 'white';
    const boardOrientation = playerColor; // 'white' o 'black'
    const isPlayerTurn = currentTurn === playerColor;

    // WebSocket connection - usar contexto global
    const { sendMessage, lastMessage, connectionStatus, connect } = useWebSocketContext();

    // Asegurar conexión WebSocket - solo una vez
    useEffect(() => {
        if (user?.token && !hasConnectedRef.current) {
            connect(WEBSOCKET_URL, user.token);
            hasConnectedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]); // Intencionalmente no incluir connect para evitar bucle

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

                // Actualizar estilos de casillas (jaque, etc.)
                updateSquareStyles(gameCopy);

                // Verificar fin del juego
                let gameStatus = "active";
                if (gameCopy.isGameOver()) {
                    if (gameCopy.isCheckmate()) {
                        gameStatus = "checkmate";
                    } else if (gameCopy.isStalemate()) {
                        gameStatus = "stalemate";
                    } else {
                        gameStatus = "draw";
                    }
                }

                // Enviar movimiento al servidor
                const moveData = {
                    type: 'move',
                    game_id: gameData.id,
                    from,
                    to,
                    promotion: move.promotion || null,
                    san: move.san,
                    fen: gameCopy.fen(),
                    game_status: gameStatus
                };

                const sendSuccess = sendMessage(moveData);
                if (!sendSuccess) {
                    setErrorMessage('Error enviando movimiento');
                    setTimeout(() => setErrorMessage(''), 2000);
                    return false;
                }

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

                // Actualizar estado local si el juego terminó
                if (gameStatus !== "active") {
                    let result = 'Empate';
                    if (gameStatus === "checkmate") {
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
    }, [isPlayerTurn, gameStatus, gameData, sendMessage, calculateCapturedPieces, updateSquareStyles]);

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

    // Manejar movimiento del oponente
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
                case 'move': {
                    // Solo procesar movimientos que no sean del propio jugador
                    // Si después del movimiento es nuestro turno, significa que el oponente acaba de mover
                    const isOpponentMove = (lastMessage.current_turn === playerColor);

                    if (isOpponentMove) {
                        handleOpponentMove(lastMessage);
                    }
                    break;
                }
                case 'game_start':
                    // Manejar inicio de partida desde WebSocket
                    // Ya se maneja la inicialización en el useEffect de gameData
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
                    // Fin del juego (rendición, jaque mate, etc.)
                    setGameStatus('ended');
                    if (lastMessage.reason === 'resignation') {
                        if (lastMessage.resigned_by === user?.username) {
                            // El usuario actual se rindió
                            setGameResult('Perdiste - Te rendiste');
                        } else {
                            // El oponente se rindió
                            setGameResult('Ganaste - Tu oponente se rindió');
                        }
                    } else if (lastMessage.reason === 'checkmate') {
                        const winnerText = lastMessage.winner === user?.username ? 'Ganaste' : 'Perdiste';
                        setGameResult(`${winnerText} - Jaque mate`);
                    } else if (lastMessage.reason === 'draw' || lastMessage.reason === 'mutual_agreement') {
                        setGameResult('Empate - Tablas acordadas');
                    } else {
                        const winnerText = lastMessage.winner === user?.username ? 'Ganaste' : 'Perdiste';
                        setGameResult(`${winnerText} - ${lastMessage.reason || 'Partida terminada'}`);
                    }
                    break;
                case 'draw_offer':
                    // Recibir oferta de tablas
                    setDrawOfferFrom(lastMessage.from);
                    setShowDrawOfferModal(true);
                    break;
                case 'draw_declined':
                    // Oferta de tablas rechazada
                    setErrorMessage('Tu oferta de tablas fue rechazada');
                    setTimeout(() => setErrorMessage(''), 3000);
                    break;
                case 'opponent_disconnected':
                    // Oponente desconectado
                    setGameStatus('ended');
                    setGameResult('Ganaste - Tu oponente se desconectó');
                    break;
                case 'error':
                    setErrorMessage(lastMessage.message);
                    setTimeout(() => setErrorMessage(''), 3000);
                    break;
                default:
            }
        }
    }, [lastMessage, handleOpponentMove, calculateCapturedPieces, playerColor, user?.username]);

    // Inicializar juego cuando se reciben los datos
    useEffect(() => {
        if (gameData) {
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
                    const joinSuccess = sendMessage({
                        type: 'join_game',
                        game_id: gameData.id
                    });
                    console.log('join_game enviado exitosamente:', joinSuccess);
                }
            } catch (error) {
                console.error('Error loading game state:', error);
                setErrorMessage('Error al cargar la partida');
            }
        }
    }, [gameData, sendMessage, calculateCapturedPieces]);

    // Auto-scroll del contenedor de movimientos cuando se agrega un nuevo movimiento
    useEffect(() => {
        if (movesContainerRef.current && moveHistory.length > 0) {
            // Scroll suave al final del contenedor, no de toda la página
            movesContainerRef.current.scrollTo({
                top: movesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [moveHistory.length]); // Solo cuando cambia el número de movimientos

    // Protección contra recarga de página
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (gameStatus === 'active' && gameData?.id) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requiere esto
                return ''; // Algunos navegadores requieren return
            }
        };

        const handleUnload = () => {
            if (gameStatus === 'active' && gameData?.id && sendMessage) {
                // Enviar mensaje de rendición automática
                sendMessage({
                    type: 'resign',
                    game_id: gameData.id,
                    player: playerColor,
                    reason: 'page_reload'
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('unload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('unload', handleUnload);
        };
    }, [gameStatus, gameData?.id, playerColor, sendMessage]);

    // Actualizar estilos cuando la posición cambie
    useEffect(() => {
        if (gamePosition && gameStatus === 'active') {
            updateSquareStyles(chessGameRef.current);
        }
    }, [gamePosition, gameStatus, updateSquareStyles]);

    // Manejar click en casilla
    const onSquareClick = useCallback(({ square, piece }) => {

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
            // Verificar si es una promoción
            if (detectPromotion(moveFrom, square)) {
                return; // Detener aquí y esperar selección de promoción
            }

            makeMove(moveFrom, square, foundMove.promotion);
        }
    }, [moveFrom, isPlayerTurn, gameStatus, playerColor, getMoveOptions, makeMove, detectPromotion]);

    // Manejar drop de pieza (drag and drop)
    const onPieceDrop = useCallback(({ sourceSquare, targetSquare, piece }) => {

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

        // Verificar si es una promoción
        if (detectPromotion(sourceSquare, targetSquare)) {
            return true; // Detener aquí y esperar selección de promoción
        }

        // Hacer el movimiento normal
        return makeMove(sourceSquare, targetSquare);
    }, [isPlayerTurn, gameStatus, playerColor, makeMove, detectPromotion]);

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
                game_id: gameData?.id
            });
        }
        setShowResignModal(false);
        // No establecer el resultado aquí, esperar respuesta del servidor
    };

    const handleOfferDraw = () => {
        if (sendMessage) {
            sendMessage({
                type: 'draw_offer',
                game_id: gameData?.id
            });
        }
        setShowDrawModal(false);
        setErrorMessage('Oferta de tablas enviada');
        setTimeout(() => setErrorMessage(''), 3000);
    };

    const handleAcceptDraw = () => {
        if (sendMessage) {
            sendMessage({
                type: 'accept_draw',
                game_id: gameData?.id
            });
        }
        setShowDrawOfferModal(false);
        setGameStatus('ended');
        setGameResult('Empate - Tablas acordadas');
    };

    const handleDeclineDraw = () => {
        if (sendMessage) {
            sendMessage({
                type: 'decline_draw',
                game_id: gameData?.id
            });
        }
        setShowDrawOfferModal(false);
        setErrorMessage('Oferta de tablas rechazada');
        setTimeout(() => setErrorMessage(''), 3000);
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
            ...rightClickedSquares,
            ...customSquareStyles
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
                                <div className="flex flex-wrap gap-1 min-h-[30px]">
                                    {capturedPieces[playerColor === 'white' ? 'white' : 'black'].map((piece, index) => (
                                        <CapturedPiece key={index} piece={piece} size={24} />
                                    ))}
                                    {capturedPieces[playerColor === 'white' ? 'white' : 'black'].length === 0 && (
                                        <span className="text-gray-400 text-sm">Ninguna</span>
                                    )}
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
                                <div className="flex flex-wrap gap-1 min-h-[30px]">
                                    {capturedPieces[playerColor === 'white' ? 'black' : 'white'].map((piece, index) => (
                                        <CapturedPiece key={index} piece={piece} size={24} />
                                    ))}
                                    {capturedPieces[playerColor === 'white' ? 'black' : 'white'].length === 0 && (
                                        <span className="text-gray-400 text-sm">Ninguna</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Historial de movimientos */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                                <span>Movimientos</span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {Math.ceil(moveHistory.length / 2)} jugadas
                                </span>
                            </h3>

                            <div ref={movesContainerRef} className="max-h-96 overflow-y-auto">
                                {moveHistory.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <div className="text-3xl mb-2">♔♛</div>
                                        <p>No hay movimientos aún</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {/* Agrupar movimientos por pares (blancas y negras) */}
                                        {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, pairIndex) => {
                                            const whiteMove = moveHistory[pairIndex * 2];
                                            const blackMove = moveHistory[pairIndex * 2 + 1];
                                            const moveNumber = pairIndex + 1;

                                            return (
                                                <div key={pairIndex} className="group">
                                                    <div className="flex items-center hover:bg-gray-50 rounded-lg p-2 transition-colors">
                                                        {/* Número de movimiento */}
                                                        <div className="w-8 text-center text-sm font-medium text-gray-500 mr-3">
                                                            {moveNumber}.
                                                        </div>

                                                        {/* Movimiento de blancas */}
                                                        <div className="flex-1 min-w-0">
                                                            {whiteMove && (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-sm flex-shrink-0"></div>
                                                                    <span className="font-medium text-gray-800 truncate">
                                                                        {whiteMove.san}
                                                                    </span>
                                                                    {whiteMove.san?.includes('+') && (
                                                                        <span className="text-red-500 text-xs">⚠</span>
                                                                    )}
                                                                    {whiteMove.san?.includes('#') && (
                                                                        <span className="text-red-600 text-xs">✗</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Movimiento de negras */}
                                                        <div className="flex-1 min-w-0">
                                                            {blackMove ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-4 h-4 bg-gray-800 border border-gray-800 rounded-sm flex-shrink-0"></div>
                                                                    <span className="font-medium text-gray-800 truncate">
                                                                        {blackMove.san}
                                                                    </span>
                                                                    {blackMove.san?.includes('+') && (
                                                                        <span className="text-red-500 text-xs">⚠</span>
                                                                    )}
                                                                    {blackMove.san?.includes('#') && (
                                                                        <span className="text-red-600 text-xs">✗</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center space-x-2 text-gray-400">
                                                                    <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded-sm flex-shrink-0"></div>
                                                                    <span className="text-sm">...</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Línea separadora sutil */}
                                                    {pairIndex < Math.ceil(moveHistory.length / 2) - 1 && (
                                                        <div className="mx-4 border-b border-gray-100"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Footer con información adicional */}
                            {moveHistory.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>
                                            Turno: {moveHistory.length % 2 === 0 ? 'Blancas' : 'Negras'}
                                        </span>
                                        <span>
                                            Último: {moveHistory[moveHistory.length - 1]?.san}
                                        </span>
                                    </div>
                                </div>
                            )}
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
                message="¿Estás seguro de que quieres rendirte? Esta acción no se puede deshacer."
                type="warning"
                onConfirm={handleResign}
                onCancel={() => setShowResignModal(false)}
                confirmText="Sí, Rendirse"
                cancelText="Cancelar"
            />

            <Modal
                isOpen={showDrawModal}
                onClose={() => setShowDrawModal(false)}
                title="Ofrecer Tablas"
                message="¿Quieres ofrecer tablas a tu oponente?"
                type="confirm"
                onConfirm={handleOfferDraw}
                onCancel={() => setShowDrawModal(false)}
                confirmText="Sí, Ofrecer Tablas"
                cancelText="Cancelar"
            />

            {/* Modal para recibir oferta de tablas */}
            <Modal
                isOpen={showDrawOfferModal}
                onClose={() => setShowDrawOfferModal(false)}
                title="Oferta de Tablas"
                message={`${drawOfferFrom} te ha ofrecido tablas. ¿Qué quieres hacer?`}
                type="info"
                onConfirm={handleAcceptDraw}
                onCancel={handleDeclineDraw}
                confirmText="Aceptar Tablas"
                cancelText="Rechazar"
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
                                const isWhite = playerColor === 'white';
                                const pieceKey = isWhite ? piece.toUpperCase() : piece.toLowerCase();
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
