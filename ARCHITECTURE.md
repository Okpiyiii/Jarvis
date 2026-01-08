# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  App.tsx                                               │ │
│  │  - Manages application state                          │ │
│  │  - Handles user interactions                          │ │
│  │  - Renders 3D scene and UI                            │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                      │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │  useJarvisWebSocket Hook                              │ │
│  │  - WebSocket connection management                    │ │
│  │  - Auto-reconnection logic                            │ │
│  │  - Message serialization                              │ │
│  └────────────────────┬───────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ WebSocket (ws://localhost:8000/ws/chat)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  websocket.py                                          │ │
│  │  - Accepts WebSocket connections                      │ │
│  │  - Routes messages to Brain                           │ │
│  │  - Executes actions via Automation                    │ │
│  │  - Saves to Memory                                    │ │
│  └───┬────────────┬────────────┬──────────────────────────┘ │
│      │            │            │                            │
│  ┌───▼──────┐ ┌──▼──────┐ ┌──▼──────────┐                 │
│  │  Brain   │ │ Memory  │ │ Automation  │                 │
│  │          │ │         │ │             │                 │
│  │ Gemini   │ │ MongoDB │ │ System APIs │                 │
│  │ AI       │ │         │ │             │                 │
│  └──────────┘ └─────────┘ └─────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

### 1. User Input → Backend

```javascript
// Frontend sends
{
  "text": "What's the weather in London?"
}
```

### 2. Backend Processing

```python
# Backend receives and processes
1. Brain analyzes message with Gemini AI
2. Determines action: "weather"
3. Executes: automation.get_weather({"location": "London"})
4. Saves to MongoDB memory
5. Prepares response
```

### 3. Backend → Frontend Response

```javascript
// Frontend receives
{
  "type": "response",
  "text": "The weather in London is 15°C, partly cloudy...",
  "state": "speaking"
}
```

### 4. Frontend Display

```
1. Updates state to SPEAKING
2. Animates 3D orb (pulsing)
3. Shows text with typewriter effect
4. Returns to LISTENING state
```

## Component Responsibilities

### Frontend Components

| Component | Responsibility |
|-----------|---------------|
| `App.tsx` | Main application logic, state management |
| `ChatInterface.tsx` | User input and message display |
| `Scene.tsx` | 3D visualization (orb, particles) |
| `SystemStats.tsx` | Display CPU/RAM/Battery |
| `useJarvisWebSocket.ts` | WebSocket connection handling |

### Backend Components

| Component | Responsibility |
|-----------|---------------|
| `main.py` | FastAPI app initialization, CORS |
| `websocket.py` | WebSocket endpoint, message routing |
| `brain.py` | AI decision making (Gemini) |
| `memory.py` | Conversation storage (MongoDB) |
| `automation.py` | System control (apps, media, stats) |

## Data Flow Diagram

```
User Types Message
       ↓
ChatInterface captures input
       ↓
App.tsx calls sendMessage()
       ↓
useJarvisWebSocket sends via WebSocket
       ↓
Backend websocket.py receives
       ↓
brain.think() analyzes with Gemini
       ↓
automation executes action (if needed)
       ↓
memory.add_message() saves to MongoDB
       ↓
Response sent back via WebSocket
       ↓
useJarvisWebSocket receives
       ↓
App.tsx updates state
       ↓
ChatInterface displays with typewriter
       ↓
Scene.tsx animates orb
```

## State Management

### Frontend States

```typescript
enum AssistantState {
  IDLE = 'idle',           // Not started
  LISTENING = 'listening', // Ready for input
  PROCESSING = 'processing', // Waiting for response
  SPEAKING = 'speaking',   // Displaying response
  ERROR = 'error'          // Connection failed
}
```

### State Transitions

```
IDLE → (user clicks "INITIALIZE") → LISTENING
LISTENING → (user sends message) → PROCESSING
PROCESSING → (response received) → SPEAKING
SPEAKING → (after 3s) → LISTENING
ANY → (connection lost) → ERROR
ERROR → (reconnected) → LISTENING
```

## Backend Actions

| Action | Trigger | Handler |
|--------|---------|---------|
| `open_app` | "Open Chrome" | `automation.open_app()` |
| `media_control` | "Play music" | `automation.media_control()` |
| `system_stats` | "Show stats" | `automation.get_system_stats()` |
| `weather` | "Weather in NYC" | `automation.get_weather()` |
| `None` | General chat | Direct AI response |

## Configuration Files

### Frontend
- `.env.local` - Backend WebSocket URL
- `constants.ts` - API keys, model names
- `vite.config.ts` - Build configuration

### Backend
- `.env` - API keys, database URI
- `requirements.txt` - Python dependencies
- `main.py` - CORS and routing config

## Network Protocol

### WebSocket Connection
- **URL**: `ws://localhost:8000/ws/chat`
- **Protocol**: WebSocket (RFC 6455)
- **Format**: JSON messages
- **Reconnection**: Auto-retry every 3 seconds

### Message Types

**Frontend → Backend:**
```json
{
  "text": "user message"
}
```

**Backend → Frontend (Response):**
```json
{
  "type": "response",
  "text": "assistant response",
  "state": "speaking"
}
```

**Backend → Frontend (Stats):**
```json
{
  "type": "system_stats",
  "cpu": "32%",
  "ram": "48%",
  "battery": "100%"
}
```

## Security Considerations

### Current Setup (Development)
- CORS: Allow all origins (`*`)
- WebSocket: No authentication
- API Keys: In `.env` files (not committed)

### Production Recommendations
1. **CORS**: Restrict to specific domains
2. **Authentication**: Add JWT tokens to WebSocket
3. **HTTPS/WSS**: Use secure protocols
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Sanitize user input
6. **API Keys**: Use environment variables or secrets manager

## Scalability

### Current Limitations
- Single backend instance
- In-memory WebSocket connections
- No load balancing

### Scaling Options
1. **Horizontal Scaling**: Multiple backend instances
2. **Redis**: Shared WebSocket state
3. **Message Queue**: Async processing (Celery, RabbitMQ)
4. **CDN**: Static frontend assets
5. **Database**: MongoDB Atlas (managed)

## Monitoring

### Key Metrics
- WebSocket connection count
- Message latency (send → response)
- Gemini API response time
- MongoDB query time
- Error rate

### Logging
- Frontend: Browser console
- Backend: Uvicorn logs + custom prints
- Database: MongoDB logs

## Deployment

### Frontend
- Build: `npm run build`
- Deploy: Vercel, Netlify, or static hosting
- Environment: Set `VITE_BACKEND_WS_URL`

### Backend
- Host: Railway, Render, AWS, or VPS
- Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Environment: Set `GEMINI_API_KEY`, `MONGO_URI`

### WebSocket URL
- Development: `ws://localhost:8000/ws/chat`
- Production: `wss://your-domain.com/ws/chat` (secure)
