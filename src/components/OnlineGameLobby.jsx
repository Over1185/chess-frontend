// src/components/OnlineGameLobby.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaPlay, FaTimes, FaUsers, FaCrown } from 'react-icons/fa';
import { useWebSocketContext } from '../contexts/WebSocketContext';

const WEBSOCKET_URL = 'ws://localhost:8000/ws';

export default function OnlineGameLobby({ user, onGameStart, onBack }) {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const [matchFound, setMatchFound] = useState(false);
    const [gameInfo, setGameInfo] = useState(null);
    const [searchTime, setSearchTime] = useState(0);
    const hasConnectedRef = useRef(false);
    const hasNavigatedRef = useRef(false);
    const navigateRef = useRef(navigate);
    const handleGameStartRef = useRef(null);

    // Actualizar las refs cuando cambien las funciones
    useEffect(() => {
        navigateRef.current = navigate;
        handleGameStartRef.current = onGameStart;
    }, [navigate, onGameStart]);

    const { connectionStatus, lastMessage, sendMessage, connect } = useWebSocketContext();

    // Conectar al WebSocket cuando el componente se monta - solo una vez
    useEffect(() => {
        if (user?.token && !hasConnectedRef.current) {
            connect(WEBSOCKET_URL, user.token);
            hasConnectedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.token]); // Intencionalmente no incluir connect para evitar bucle

    // Timer para mostrar tiempo de búsqueda
    useEffect(() => {
        let interval;
        if (isSearching && !matchFound) {
            interval = setInterval(() => {
                setSearchTime(prev => prev + 1);
            }, 1000);
        } else {
            setSearchTime(0);
        }
        return () => clearInterval(interval);
    }, [isSearching, matchFound]);

    // Manejar mensajes del WebSocket
    useEffect(() => {
        if (!lastMessage) return;

        const { type } = lastMessage;

        switch (type) {
            case 'connection_confirmed':
                break;

            case 'searching_match':
                setIsSearching(true);
                break;

            case 'game_start':
                console.log('game_start message received:', lastMessage);
                setMatchFound(true);
                setIsSearching(false);
                setGameInfo({
                    gameId: lastMessage.game_id,
                    whitePlayer: lastMessage.white_player,
                    blackPlayer: lastMessage.black_player,
                    yourColor: lastMessage.your_color,
                    isPrivate: lastMessage.is_private || false
                });
                console.log('Calling handleGameStart with:', lastMessage);
                handleGameStartRef.current?.(lastMessage);
                // Navegar automáticamente al tablero después de encontrar partida - solo una vez
                if (!hasNavigatedRef.current) {
                    hasNavigatedRef.current = true;
                    setTimeout(() => {
                        navigateRef.current('/chess-game');
                    }, 1000);
                }
                break;

            case 'match_cancelled':
                setIsSearching(false);
                setMatchFound(false);
                hasNavigatedRef.current = false; // Resetear flag de navegación
                break;

            case 'error':
                console.error('Error:', lastMessage.message);
                setIsSearching(false);
                break;

            default:
        }
    }, [lastMessage]); // Solo lastMessage como dependencia

    const startSearch = () => {
        if (connectionStatus !== 'Connected') {
            console.warn('Cannot start search - WebSocket not connected');
            return;
        }

        console.log('Sending find_match with user rating:', user?.rating || 1200);
        const success = sendMessage({
            type: 'find_match',
            elo: user?.rating || 1200
        });

        console.log('find_match message sent successfully:', success);
        if (success) {
            setIsSearching(true);
            setMatchFound(false);
            setSearchTime(0);
            hasNavigatedRef.current = false; // Resetear flag de navegación
        }
    };

    const cancelSearch = () => {
        sendMessage({
            type: 'cancel_match'
        });
        setIsSearching(false);
        setMatchFound(false);
        hasNavigatedRef.current = false; // Resetear flag de navegación
    };

    const handleBack = () => {
        if (isSearching) {
            cancelSearch();
        }
        // NO desconectar el WebSocket al cambiar de vista
        // disconnect();
        onBack();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (matchFound && gameInfo) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCrown className="text-3xl text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Partida Encontrada!</h2>
                        <p className="text-gray-600">Preparando el tablero...</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${gameInfo.yourColor === 'white' ? 'bg-white border-2 border-gray-300' : 'bg-gray-800'
                                    }`}>
                                    <FaUsers className={`text-lg ${gameInfo.yourColor === 'white' ? 'text-gray-800' : 'text-white'}`} />
                                </div>
                                <p className="text-sm font-medium">{gameInfo.whitePlayer}</p>
                                <p className="text-xs text-gray-500">Blancas</p>
                            </div>

                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-400">VS</p>
                            </div>

                            <div className="text-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${gameInfo.yourColor === 'black' ? 'bg-gray-800' : 'bg-white border-2 border-gray-300'
                                    }`}>
                                    <FaUsers className={`text-lg ${gameInfo.yourColor === 'black' ? 'text-white' : 'text-gray-800'}`} />
                                </div>
                                <p className="text-sm font-medium">{gameInfo.blackPlayer}</p>
                                <p className="text-xs text-gray-500">Negras</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-medium text-green-600">
                                Juegas con {gameInfo.yourColor === 'white' ? 'blancas' : 'negras'}
                            </p>
                        </div>
                    </div>

                    <div className="animate-pulse">
                        <div className="flex justify-center mb-4">
                            <FaSpinner className="text-3xl text-green-500 animate-spin" />
                        </div>
                        <p className="text-gray-600">Iniciando partida en breve...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaUsers className="text-3xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Partida Online</h1>
                    <p className="text-gray-600">
                        {connectionStatus === 'Connected'
                            ? 'Busca un oponente para jugar en línea'
                            : 'Conectando al servidor...'
                        }
                    </p>
                </div>

                {/* Estado de conexión */}
                <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' :
                            connectionStatus === 'Disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                        <span className="text-sm font-medium text-gray-600">
                            {connectionStatus === 'Connected' ? 'Conectado' :
                                connectionStatus === 'Disconnected' ? 'Desconectado' : 'Conectando...'}
                        </span>
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-gray-800">{user?.username}</p>
                            <p className="text-sm text-gray-500">Rating: {user?.rating || 1200}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tipo</p>
                            <p className="font-medium capitalize">{user?.type}</p>
                        </div>
                    </div>
                </div>

                {isSearching ? (
                    // Estado de búsqueda
                    <div className="text-center">
                        <div className="mb-6">
                            <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Buscando oponente...</h3>
                            <p className="text-gray-600 mb-2">Tiempo transcurrido: {formatTime(searchTime)}</p>
                            <p className="text-sm text-gray-500">
                                Te emparejaremos con un jugador de nivel similar
                            </p>
                        </div>

                        <button
                            onClick={cancelSearch}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                        >
                            <FaTimes />
                            <span>Cancelar Búsqueda</span>
                        </button>
                    </div>
                ) : (
                    // Estado inicial
                    <div className="space-y-4">
                        <button
                            onClick={startSearch}
                            disabled={connectionStatus !== 'Connected'}
                            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 text-lg"
                        >
                            <FaPlay />
                            <span>Buscar Partida</span>
                        </button>

                        <button
                            onClick={handleBack}
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                        >
                            Volver
                        </button>
                    </div>
                )}

                {/* Información adicional */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        Te emparejaremos con jugadores de rating similar (±200 puntos)
                    </p>
                </div>
            </div>
        </div>
    );
}
