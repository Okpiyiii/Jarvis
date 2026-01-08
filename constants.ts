import { GoogleGenAI } from "@google/genai";

// Models
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const TEXT_MODEL = 'gemini-3-flash-preview';

// Audio
export const AUDIO_SAMPLE_RATE_INPUT = 16000;
export const AUDIO_SAMPLE_RATE_OUTPUT = 24000;

// Initialize SDK
// Note: process.env.API_KEY is injected by the environment.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
