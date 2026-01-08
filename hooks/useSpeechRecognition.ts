import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasRecognitionSupport: boolean;
}

export function useSpeechRecognition(onResult?: (text: string) => void): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null); // Type 'any' to handle window.SpeechRecognition nuances

    const hasRecognitionSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    useEffect(() => {
        if (!hasRecognitionSupport) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false; // We want single commands for now, similar to "Ok Jarvis..."
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const text = event.results[last][0].transcript;
            setTranscript(text);
            if (onResult) {
                onResult(text);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [hasRecognitionSupport, onResult]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasRecognitionSupport
    };
}
