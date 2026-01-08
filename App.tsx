import React, { useState } from 'react';
import Scene from './components/Scene';
import { ChatInterface } from './components/ChatInterface';
import { SystemStats } from './components/SystemStats';
import { CustomCursor } from './components/CustomCursor';
import { HolographicWidgets } from './components/HolographicWidgets';
import { AssistantState } from './types';
import { useJarvisWebSocket } from './hooks/useJarvisWebSocket';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTextToSpeech } from './hooks/useTextToSpeech';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [state, setState] = useState<AssistantState>(AssistantState.IDLE);
  const [audioLevel, setAudioLevel] = useState(0);
  const [autoListen, setAutoListen] = useState(false); // Disabled by default to prevent interruptions
  const [lastSpokenResponse, setLastSpokenResponse] = useState<string | null>(null); // Track what we've already spoken
  
  // Connect to Jarvis Backend WebSocket
  const { isConnected, sendMessage, lastResponse, systemStats: backendStats } = useJarvisWebSocket();
  
  // Voice Input (Speech Recognition)
  const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition((text) => {
    // When speech is recognized, send it to backend
    console.log('🎤 Speech recognized:', text);
    if (text.trim()) {
      handleSendMessage(text);
    } else {
      console.warn('⚠️ Empty speech text, not sending');
    }
  });
  
  // Voice Output (Text-to-Speech)
  const { speak, cancel: cancelSpeech, isSpeaking } = useTextToSpeech(
    () => {
      // When speech ends, return to listening
      setState(AssistantState.LISTENING);
      setAudioLevel(0);
    },
    () => {
      // When speech starts
      setState(AssistantState.SPEAKING);
    }
  );

  const handleStart = () => {
    setHasStarted(true);
    if (isConnected) {
      setState(AssistantState.LISTENING);
      // Don't auto-start listening - let user click mic button
    }
  };

  const handleSendMessage = (text: string) => {
    console.log('🎤 handleSendMessage called with:', text);
    setState(AssistantState.PROCESSING);
    stopListening(); // Stop listening while processing
    sendMessage(text);
  };
  
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setState(AssistantState.LISTENING);
    }
  };

  // Update state based on connection and responses
  React.useEffect(() => {
    if (!isConnected && hasStarted) {
      setState(AssistantState.ERROR);
    } else if (isConnected && hasStarted && state === AssistantState.ERROR) {
      setState(AssistantState.LISTENING);
    }
  }, [isConnected, hasStarted]);

  React.useEffect(() => {
    // Only speak if we have a new response that we haven't spoken yet
    if (lastResponse && lastResponse !== lastSpokenResponse) {
      console.log('📨 Received NEW response:', lastResponse);
      
      // Stop listening immediately when we get a response
      stopListening();
      
      // Cancel any ongoing speech
      cancelSpeech();
      
      // Mark this response as spoken
      setLastSpokenResponse(lastResponse);
      
      // Small delay to ensure cancellation completes
      setTimeout(() => {
        // Speak the response out loud
        speak(lastResponse);
      }, 150);
      
      // Simulate audio level during speaking
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 100);
      
      // Cleanup interval when component unmounts or response changes
      return () => {
        clearInterval(interval);
      };
    }
  }, [lastResponse, lastSpokenResponse, speak, stopListening, cancelSpeech]);
  
  // Auto-restart listening after speaking ends (only if autoListen is enabled)
  React.useEffect(() => {
    // Only restart if auto-listen is enabled and all conditions are met
    if (autoListen && !isSpeaking && hasStarted && state === AssistantState.LISTENING && !isListening && hasRecognitionSupport) {
      // Wait longer to ensure speech has fully completed
      const timeout = setTimeout(() => {
        // Double-check we're still not speaking before restarting
        if (!window.speechSynthesis.speaking) {
          startListening();
        }
      }, 2000); // Increased delay to 2 seconds
      return () => clearTimeout(timeout);
    }
  }, [autoListen, isSpeaking, hasStarted, state, isListening, hasRecognitionSupport, startListening]);

  // Use backend stats if available, otherwise use mock data
  const systemStats = backendStats || { cpu: "32%", ram: "48%", battery: "100%" };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      <CustomCursor />
      <HolographicWidgets />

      {/* 3D Scene Background - Core */}
      <Scene state={state} audioLevel={audioLevel} />

      {/* Top Right System Stats */}
      <SystemStats stats={systemStats} />

      {/* Main Chat/HUD Interface */}
      {hasStarted ? (
        <ChatInterface
          state={state}
          onSendMessage={handleSendMessage}
          lastResponse={lastResponse}
          isListening={isListening}
          onVoiceToggle={handleVoiceToggle}
          hasRecognitionSupport={hasRecognitionSupport}
        />
      ) : (
        /* Start Screen Overlay */
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-cyan-500/20 border border-cyan-500 text-cyan-50 font-mono tracking-widest hover:bg-cyan-500/40 transition-all rounded"
          >
            INITIALIZE SYSTEM
          </button>
        </div>
      )}

      {/* Connection Warning Overlay */}
      {state === AssistantState.ERROR && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 px-6 py-2 rounded-full backdrop-blur-md">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-200 text-xs font-mono tracking-wider">CONNECTION ERROR</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;

