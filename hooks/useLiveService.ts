import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveService } from '../services/liveService';
import { AssistantState } from '../types';

export function useLiveService() {
    const [state, setState] = useState<AssistantState>(AssistantState.IDLE);
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcripts, setTranscripts] = useState<Array<{ text: string, isUser: boolean }>>([]);
    const [lastResponse, setLastResponse] = useState<string | null>(null);

    const liveServiceRef = useRef<LiveService | null>(null);

    useEffect(() => {
        // simple initialization of the service class
        const service = new LiveService(
            (newState) => {
                setState(newState);
            },
            (level) => {
                setAudioLevel(level);
            },
            (text, isUser) => {
                if (!isUser) {
                    setLastResponse(text);
                }
                setTranscripts(prev => [...prev, { text, isUser }].slice(-10)); // keep last 10
            }
        );

        liveServiceRef.current = service;

        return () => {
            service.disconnect();
        };
    }, []);

    const connect = useCallback(async () => {
        if (liveServiceRef.current) {
            try {
                await liveServiceRef.current.connect();
            } catch (err) {
                console.error("Failed to connect live service", err);
                setState(AssistantState.ERROR);
            }
        }
    }, []);

    const disconnect = useCallback(async () => {
        if (liveServiceRef.current) {
            await liveServiceRef.current.disconnect();
            setState(AssistantState.IDLE);
        }
    }, []);

    return {
        state,
        audioLevel,
        connect,
        disconnect,
        lastResponse,
        transcripts
    };
}
