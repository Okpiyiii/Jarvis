import { useState, useEffect, useRef, useCallback } from 'react';
import { IncomingMessage, OutgoingMessage, SystemStats } from '../types';
import { BACKEND_WS_URL } from '../constants';

interface UseJarvisWebSocketReturn {
    isConnected: boolean;
    sendMessage: (text: string) => void;
    lastResponse: string | null;
    systemStats: SystemStats | null;
}

export function useJarvisWebSocket(url: string = BACKEND_WS_URL): UseJarvisWebSocketReturn {
    const [isConnected, setIsConnected] = useState(false);
    const [lastResponse, setLastResponse] = useState<string | null>(null);
    const [systemStats, setSystemStats] = useState<SystemStats | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    const connect = useCallback(() => {
        try {
            console.log('Attempting to connect to:', url);
            const ws = new WebSocket(url);

            ws.onopen = () => {
                console.log('✅ Connected to Jarvis Backend');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                console.log('📨 Received message:', event.data);
                try {
                    const data: IncomingMessage = JSON.parse(event.data);

                    if (data.type === 'response') {
                        console.log('💬 Response:', data.text);
                        setLastResponse(data.text);
                    } else if (data.type === 'system_stats') {
                        console.log('📊 System stats:', data);
                        setSystemStats({
                            cpu: data.cpu,
                            ram: data.ram,
                            battery: data.battery
                        });
                    }
                } catch (err) {
                    console.error('❌ Failed to parse WebSocket message:', err, event.data);
                }
            };

            ws.onclose = (event) => {
                console.log('❌ Disconnected from Jarvis Backend', event.code, event.reason);
                setIsConnected(false);
                // Attempt reconnect after 3 seconds
                console.log('🔄 Will attempt reconnect in 3 seconds...');
                reconnectTimeoutRef.current = window.setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error('❌ WebSocket Error:', err);
                ws.close();
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('❌ Connection failed:', error);
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
        console.log('📤 Attempting to send message:', text);
        console.log('WebSocket state:', wsRef.current?.readyState, 'OPEN=', WebSocket.OPEN);
        
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Backend expects JSON with "text" field
            const payload = { text };
            console.log('📤 Sending payload:', JSON.stringify(payload));
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.warn('⚠️ WebSocket is not connected. Message not sent.');
            console.warn('WebSocket state:', wsRef.current?.readyState);
        }
    }, []);

    return { isConnected, sendMessage, lastResponse, systemStats };
}
