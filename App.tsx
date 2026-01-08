import React, { useState } from 'react';
import Scene from './components/Scene';
import { ChatInterface } from './components/ChatInterface';
import { SystemStats } from './components/SystemStats';
import { CustomCursor } from './components/CustomCursor';
import { HolographicWidgets } from './components/HolographicWidgets';
import { AssistantState } from './types';
import { useLiveService } from './hooks/useLiveService';

function App() {
  const { state, audioLevel, connect, disconnect, lastResponse } = useLiveService();
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    setHasStarted(true);
    connect();
  };

  // Mock system stats for now, could be real if we had a node bridge
  const systemStats = { cpu: "32%", ram: "48%", battery: "100%" };

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
          onSendMessage={(text) => {
            // For now, Live API is voice-primary. Text input could be added via sendText if supported.
            console.log("Text input not yet supported in this demo version", text);
          }}
          lastResponse={lastResponse}
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

