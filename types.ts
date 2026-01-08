export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export enum AssistantState {
  IDLE = 'idle',      // Blue
  LISTENING = 'listening', // Red
  PROCESSING = 'processing', // Cyan/Green (Thinking/Speaking combined for broad state, or split)
  SPEAKING = 'speaking',   // Cyan/Green
  THINKING = 'thinking',
  ERROR = 'error'
}

// WebSocket Protocol Types

export interface SystemStats {
  cpu: string;     // e.g. "12%"
  ram: string;     // e.g. "45%"
  battery: string; // e.g. "80%"
}

export type IncomingMessage = 
  | { type: 'response'; text: string; state?: 'speaking' | 'idle' | 'processing' }
  | { type: 'system_stats'; cpu: string; ram: string; battery: string };

export type OutgoingMessage = 
  | { type: 'command'; text: string };

