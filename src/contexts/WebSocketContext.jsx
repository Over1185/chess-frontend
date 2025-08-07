// src/contexts/WebSocketContext.jsx
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastMessage, setLastMessage] = useState(null);
    const socketRef = useRef(null);
    const currentTokenRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const urlRef = useRef(null);

    const connect = useCallback((url, token) => {
        // Si ya estamos conectados con el mismo token y URL, no hacer nada
        if (socketRef.current?.readyState === WebSocket.OPEN &&
            currentTokenRef.current === token &&
            urlRef.current === url) {
            return;
        }

        // Cerrar conexión anterior si existe
        if (socketRef.current) {
            socketRef.current.close(1000, 'New connection requested');
        }

        if (!token || !url) {
            console.warn('Token o URL no proporcionados para WebSocket');
            return;
        }

        try {
            const wsUrl = `${url}/${token}`;
            currentTokenRef.current = token;
            urlRef.current = url;

            const ws = new WebSocket(wsUrl);
            socketRef.current = ws;

            ws.onopen = () => {
                setConnectionStatus('Connected');
                setSocket(ws);

                // Limpiar timeout de reconexión si existe
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
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

                // Solo reconectar automáticamente si no fue un cierre intencional
                if (event.code !== 1000 && event.code !== 4001 && currentTokenRef.current) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (currentTokenRef.current && urlRef.current) {
                            connect(urlRef.current, currentTokenRef.current);
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
    }, []); // Sin dependencias para evitar recreación

    const disconnect = useCallback(() => {

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (socketRef.current) {
            currentTokenRef.current = null;
            urlRef.current = null;
            socketRef.current.close(1000, 'User disconnected');
            socketRef.current = null;
        }

        setSocket(null);
        setConnectionStatus('Disconnected');
    }, []);

    const sendMessage = useCallback((message) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const messageString = JSON.stringify(message);
            socketRef.current.send(messageString);
            return true;
        } else {
            console.warn('WebSocket no está conectado');
            return false;
        }
    }, []);    // Cleanup al desmontar el provider
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const value = {
        socket,
        connectionStatus,
        lastMessage,
        connect,
        disconnect,
        sendMessage,
        isConnected: socket?.readyState === WebSocket.OPEN
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};
