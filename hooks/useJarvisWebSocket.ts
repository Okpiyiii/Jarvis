import { useState, useEffect, useRef, useCallback } from 'react';
import { IncomingMessage, OutgoingMessage, SystemStats } from '../types';

interface UseJarvisWebSocketReturn {
    isConnected: boolean;
    sendMessage: (text: string) => void;
    lastResponse: string | null;
    systemStats: SystemStats | null;
}

export function useJarvisWebSocket(url: string = 'ws://localhost:8000/ws/chat'): UseJarvisWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [lastResponse, setLastResponse] = useState<string | null>(null);
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('Connected to Jarvis Backend');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data: IncomingMessage = JSON.parse(event.data);

                    if (data.type === 'response') {
                        setLastResponse(data.text);
                    } else if (data.type === 'system_stats') {
                        setSystemStats({
                            cpu: data.cpu,
                            ram: data.ram,
                            battery: data.battery
                        });
                    }
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err);
                }
            };

            ws.onclose = () => {
                console.log('Disconnected from Jarvis Backend');
                setIsConnected(false);
                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error('WebSocket Error:', err);
                ws.close();
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Connection failed:', error);
            reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
        }
    }, [url]);

    useEffect(() => {
        connect();
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((text: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const payload: OutgoingMessage = { type: 'command', text };
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.warn('WebSocket is not connected. Message not sent.');
        }
    }, []);

    return { isConnected, sendMessage, lastResponse, systemStats };
}
