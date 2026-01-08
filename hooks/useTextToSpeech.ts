import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTextToSpeechReturn {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
}

export function useTextToSpeech(onEnd?: () => void, onStart?: () => void): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Monitor system speaking state
    useEffect(() => {
        const interval = setInterval(() => {
            const actuallySpeaking = window.speechSynthesis.speaking;
            if (isSpeaking !== actuallySpeaking) {
                setIsSpeaking(actuallySpeaking);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [isSpeaking]);

    const speak = useCallback((text: string) => {
        if (!('speechSynthesis' in window)) {
            console.error("Text-to-speech not supported");
            return;
        }

        // Cancel any existing speech completely
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
        
        // Longer delay to ensure cancellation completes
        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            currentUtteranceRef.current = utterance;
            
            // Customize voice settings for better quality
            utterance.pitch = 1;
            utterance.rate = 0.9; // Even slower for better clarity
            utterance.volume = 1;

            // Load voices if not already loaded
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) {
                // Voices not loaded yet, wait for them
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices();
                    const preferredVoice = voices.find(v => 
                        v.name.includes("Google US English") || 
                        v.name.includes("Male") || 
                        v.lang === 'en-US'
                    );
                    if (preferredVoice) utterance.voice = preferredVoice;
                };
            } else {
                const preferredVoice = voices.find(v => 
                    v.name.includes("Google US English") || 
                    v.name.includes("Male") || 
                    v.lang === 'en-US'
                );
                if (preferredVoice) utterance.voice = preferredVoice;
            }

            utterance.onstart = () => {
                console.log('🔊 TTS Started');
                setIsSpeaking(true);
                if (onStart) onStart();
            };

            utterance.onend = () => {
                console.log('✅ TTS Ended normally');
                setIsSpeaking(false);
                currentUtteranceRef.current = null;
                if (onEnd) onEnd();
            };

            utterance.onerror = (e) => {
                console.error("❌ TTS Error:", e.error);
                // Only log error, don't call onEnd to prevent auto-restart on error
                setIsSpeaking(false);
                currentUtteranceRef.current = null;
            };

            try {
                console.log('🎤 Speaking:', text.substring(0, 50) + '...');
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.error("Failed to speak", e);
                setIsSpeaking(false);
                currentUtteranceRef.current = null;
            }
        }, 200); // Increased delay to 200ms
    }, [onEnd, onStart]);

    const cancel = useCallback(() => {
        console.log('🛑 Cancelling TTS');
        window.speechSynthesis.cancel();
        currentUtteranceRef.current = null;
        setIsSpeaking(false);
    }, []);

    return { speak, cancel, isSpeaking };
}

