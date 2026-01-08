import { useState, useCallback, useEffect } from 'react';

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
}

export function useTextToSpeech(onEnd?: () => void, onStart?: () => void): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Monitor system speaking state slightly more reliably if possible, 
    // but window.speechSynthesis.speaking is the source of truth.
    useEffect(() => {
        const interval = setInterval(() => {
            setIsSpeaking(window.speechSynthesis.speaking);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.error("Text-to-speech not supported");
            return;
        }

        // Cancel existing
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // You can customize voice, pitch, rate here
        // utterance.pitch = 1;
        // utterance.rate = 1;

        // Attempt to pick a "Jarvis-like" or English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Male") || v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            setIsSpeaking(true);
            if (onStart) onStart();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error("TTS Error", e);
            setIsSpeaking(false);
        }

        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error("Failed to speak", e);
        }
    }, [onEnd, onStart]);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return { speak, cancel, isSpeaking };
}

