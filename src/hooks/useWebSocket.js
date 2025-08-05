// src/hooks/useWebSocket.js
import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url, token) => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token || !url) return;

        const connectWebSocket = () => {
            try {
                const wsUrl = `${url}/${token}`;

                const ws = new WebSocket(wsUrl);
                socketRef.current = ws;

                ws.onopen = () => {
                    setConnectionStatus('Connected');
                    setSocket(ws);
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        setLastMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                ws.onclose = (event) => {
                    setConnectionStatus('Disconnected');
                    setSocket(null);

                    // Reconectar automáticamente después de 3 segundos si no fue intencional
                    if (event.code !== 1000 && event.code !== 4001) { // 4001 = token inválido
                        setTimeout(() => {
                            if (socketRef.current?.readyState === WebSocket.CLOSED) {
                                connectWebSocket();
                            }
                        }, 3000);
                    }
                };

                ws.onerror = (error) => {
                    console.error('Error en WebSocket:', error);
                    setConnectionStatus('Error');
                };
            } catch (error) {
                console.error('Error creando WebSocket:', error);
                setConnectionStatus('Error');
            }
        };

        connectWebSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.close(1000, 'Component unmounted');
            }
        };
    }, [url, token]);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const messageString = JSON.stringify(message);
            socket.send(messageString);
            return true;
        } else {
            console.warn('WebSocket no está conectado');
            return false;
        }
    };

    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.close(1000, 'User disconnected');
        }
    };

    return {
        socket,
        connectionStatus,
        lastMessage,
        sendMessage,
        disconnect
    };
};
