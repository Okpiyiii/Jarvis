import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { AssistantState } from '../types';

import { TypewriterText } from './TypewriterText';

interface ChatInterfaceProps {
  state: AssistantState;
  onSendMessage: (text: string) => void;
  lastResponse: string | null;
  className?: string;
  isListening?: boolean;
  onVoiceToggle?: () => void;
  hasRecognitionSupport?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  state,
  onSendMessage,
  lastResponse,
  isListening = false,
  onVoiceToggle,
  hasRecognitionSupport = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
      setShowInput(false);
    }
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end items-center pb-12">

      {/* Response Text Display (Subtitle style) */}
      <AnimatePresence>
        {(state === AssistantState.SPEAKING || state === AssistantState.PROCESSING || lastResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-32 w-full max-w-3xl text-center px-4"
          >
            <GlassCard className="inline-block px-8 py-4 bg-black/60 border-cyan-500/30 backdrop-blur-md">
              <div className="text-cyan-50 font-sans text-lg md:text-xl font-light tracking-wide leading-relaxed min-h-[1.5em] flex justify-center items-center">
                {/* Only show Typewriter if there is actual text to show, otherwise show Processing... */}
                {state === AssistantState.PROCESSING ? (
                  <span className="animate-pulse">PROCESSING...</span>
                ) : (
                  <TypewriterText text={lastResponse || ""} speed={30} />
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <div className="pointer-events-auto flex flex-col items-center gap-4">

        {/* Voice Status Indicator */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-200 text-xs font-mono tracking-wider">LISTENING...</span>
          </motion.div>
        )}

        {/* Voice Toggle Button */}
        {hasRecognitionSupport && onVoiceToggle && !showInput && (
          <button
            onClick={onVoiceToggle}
            className={`p-4 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500/30 border-2 border-red-500 animate-pulse' 
                : 'bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/40'
            }`}
            title={isListening ? "Stop Listening" : "Start Voice Input"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        {/* Input Toggle */}
        {!showInput && !isListening && (
          <button
            onClick={() => setShowInput(true)}
            className="text-white/20 hover:text-white/60 transition-colors"
            title="Type Message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Hidden Input Field */}
        <AnimatePresence>
          {showInput && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <GlassCard className="p-2 flex gap-2 w-[400px] border-cyan-500/50 bg-black/80">
                <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="COMMAND LINE INPUT..."
                    className="flex-1 bg-transparent border-none outline-none text-cyan-50 px-4 placeholder-cyan-700/50 font-mono text-sm"
                    autoFocus
                    onBlur={() => !inputValue && setShowInput(false)}
                  />
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
