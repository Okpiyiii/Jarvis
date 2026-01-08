// Backend WebSocket URL
export const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000/ws/chat';

// Models (kept for reference, but backend handles AI now)
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const TEXT_MODEL = 'gemini-3-flash-preview';

// Audio
export const AUDIO_SAMPLE_RATE_INPUT = 16000;
export const AUDIO_SAMPLE_RATE_OUTPUT = 24000;

// Note: Google AI SDK is not needed in frontend anymore
// Backend handles all AI interactions via WebSocket
