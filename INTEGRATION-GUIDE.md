# Frontend-Backend Integration Guide

## 🎯 What Changed

Your frontend now communicates with your backend via WebSocket instead of using Google's Live API directly.

## 📊 Before vs After

### Before (Original Setup)
```
Frontend → Google Live API (Voice) → Direct AI Response
```

### After (Current Setup)
```
Frontend → WebSocket → Backend → Gemini AI → MongoDB → Backend → Frontend
                                     ↓
                              Automation Actions
```

## 🔄 Integration Points

### 1. WebSocket Connection

**File:** `hooks/useJarvisWebSocket.ts`

**What it does:**
- Establishes WebSocket connection to backend
- Handles auto-reconnection
- Manages message sending/receiving
- Parses backend responses

**Key changes:**
```typescript
// OLD: Sent with type field
{ type: 'command', text: 'message' }

// NEW: Matches backend format
{ text: 'message' }
```

### 2. Application State

**File:** `App.tsx`

**What it does:**
- Manages connection state
- Handles user interactions
- Updates UI based on backend responses
- Simulates audio levels for visual effects

**Key changes:**
```typescript
// OLD: Used useLiveService (Google Live API)
const { state, audioLevel, connect } = useLiveService();

// NEW: Uses useJarvisWebSocket (Your Backend)
const { isConnected, sendMessage, lastResponse } = useJarvisWebSocket();
```

### 3. Configuration

**File:** `constants.ts` + `.env.local`

**What it does:**
- Stores backend WebSocket URL
- Allows easy configuration changes
- Supports different environments (dev/prod)

**Key changes:**
```typescript
// NEW: Backend URL configuration
export const BACKEND_WS_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8000/ws/chat';
```

## 🔌 Message Protocol

### Frontend → Backend

```json
{
  "text": "What's the weather in London?"
}
```

**Sent when:**
- User types message and presses Enter
- User submits form in ChatInterface

**Handled by:**
- `useJarvisWebSocket.sendMessage()`
- Backend `websocket.py` receives

### Backend → Frontend (Response)

```json
{
  "type": "response",
  "text": "The weather in London is 15°C, partly cloudy with a chance of rain.",
  "state": "speaking"
}
```

**Sent when:**
- Backend finishes processing
- After AI generates response
- After executing any actions

**Handled by:**
- `useJarvisWebSocket` onmessage handler
- Updates `lastResponse` state
- Triggers UI update

### Backend → Frontend (System Stats)

```json
{
  "type": "system_stats",
  "cpu": "32%",
  "ram": "48%",
  "battery": "100%"
}
```

**Sent when:**
- User requests system stats
- Backend executes `automation.get_system_stats()`

**Handled by:**
- `useJarvisWebSocket` onmessage handler
- Updates `systemStats` state
- Displays in SystemStats component

## 🎨 UI State Flow

```
User clicks "INITIALIZE SYSTEM"
    ↓
hasStarted = true
    ↓
Check isConnected
    ↓
If connected: state = LISTENING (Blue Orb)
If not: state = ERROR (Red Banner)
    ↓
User types message
    ↓
state = PROCESSING (Pulsing Orb)
    ↓
Backend responds
    ↓
state = SPEAKING (Animated Orb)
    ↓
After 3 seconds
    ↓
state = LISTENING (Blue Orb)
```

## 🛠️ Backend Integration Points

### WebSocket Endpoint

**File:** `jarvis-backend/app/api/websocket.py`

**Endpoint:** `/ws/chat`

**What it does:**
1. Accepts WebSocket connection
2. Receives user message
3. Calls `brain.think()` for AI processing
4. Executes actions via `automation`
5. Saves to `memory` (MongoDB)
6. Sends response back to frontend

**No changes needed** - Already compatible!

### Brain Service

**File:** `jarvis-backend/app/services/brain.py`

**What it does:**
- Analyzes user message with Gemini AI
- Determines intent and action
- Returns decision object

**No changes needed** - Works as-is!

### Memory Service

**File:** `jarvis-backend/app/services/memory.py`

**What it does:**
- Saves messages to MongoDB
- Retrieves conversation history
- Provides context to AI

**No changes needed** - Works as-is!

### Automation Service

**File:** `jarvis-backend/app/services/automation.py`

**What it does:**
- Opens applications
- Controls media playback
- Gets system stats
- Fetches weather data

**No changes needed** - Works as-is!

## 🔐 Environment Variables

### Frontend (.env.local)

```bash
# Backend WebSocket URL
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/chat
```

**When to change:**
- Deploying to production (use wss://)
- Backend on different port
- Backend on different server

### Backend (.env)

```bash
# Gemini AI API Key
GEMINI_API_KEY=your_key_here

# MongoDB Connection
MONGO_URI=your_mongodb_uri_here
DB_NAME=jarvis
```

**No changes needed** - Already configured!

## 🚀 Deployment Scenarios

### Scenario 1: Local Development (Current)

```
Frontend: http://localhost:5173
Backend: http://localhost:8000
WebSocket: ws://localhost:8000/ws/chat
```

**Configuration:**
- `.env.local`: `VITE_BACKEND_WS_URL=ws://localhost:8000/ws/chat`

### Scenario 2: Production (Same Server)

```
Frontend: https://yourdomain.com
Backend: https://yourdomain.com/api
WebSocket: wss://yourdomain.com/api/ws/chat
```

**Configuration:**
- `.env.local`: `VITE_BACKEND_WS_URL=wss://yourdomain.com/api/ws/chat`
- Backend CORS: `allow_origins=["https://yourdomain.com"]`

### Scenario 3: Production (Separate Servers)

```
Frontend: https://app.yourdomain.com
Backend: https://api.yourdomain.com
WebSocket: wss://api.yourdomain.com/ws/chat
```

**Configuration:**
- `.env.local`: `VITE_BACKEND_WS_URL=wss://api.yourdomain.com/ws/chat`
- Backend CORS: `allow_origins=["https://app.yourdomain.com"]`

## 🔍 Debugging

### Frontend Debug

**Enable verbose logging:**

Edit `hooks/useJarvisWebSocket.ts`:
```typescript
ws.onmessage = (event) => {
    console.log('📨 Received:', event.data); // Add this
    try {
        const data: IncomingMessage = JSON.parse(event.data);
        // ... rest of code
    }
};

const sendMessage = useCallback((text: string) => {
    console.log('📤 Sending:', text); // Add this
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // ... rest of code
    }
}, []);
```

### Backend Debug

**Already has logging:**

```python
print("Frontend Connected! 🔗")
print(f"User: {user_text}")
print(f"Brain: {decision}")
```

**Add more if needed:**
```python
print(f"Action: {action}, Args: {args}")
print(f"Response: {response_text}")
```

## 📈 Performance Optimization

### Frontend

1. **Reduce re-renders:**
   - Use `React.memo` for heavy components
   - Use `useCallback` for functions

2. **Optimize 3D scene:**
   - Reduce particle count if laggy
   - Lower shadow quality if needed

3. **Lazy load components:**
   - Split code with `React.lazy`

### Backend

1. **Connection pooling:**
   - MongoDB connection pool (already configured)

2. **Caching:**
   - Cache frequent AI responses
   - Cache weather data (5-10 min)

3. **Async processing:**
   - Use async/await properly (already done)

## 🧪 Testing Checklist

### Unit Tests (Optional)

**Frontend:**
```typescript
// Test WebSocket hook
test('connects to backend', () => {
  const { result } = renderHook(() => useJarvisWebSocket());
  expect(result.current.isConnected).toBe(true);
});
```

**Backend:**
```python
# Test WebSocket endpoint
async def test_websocket():
    async with websockets.connect('ws://localhost:8000/ws/chat') as ws:
        await ws.send('{"text": "Hello"}')
        response = await ws.recv()
        assert 'response' in response
```

### Integration Tests

1. **Connection Test:**
   - Start backend
   - Start frontend
   - Verify connection established

2. **Message Test:**
   - Send message
   - Verify backend receives
   - Verify response returns
   - Verify UI updates

3. **Reconnection Test:**
   - Disconnect backend
   - Verify error state
   - Reconnect backend
   - Verify recovery

## 🎓 Learning Resources

### WebSocket
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/)

### React Hooks
- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## 💡 Tips & Tricks

1. **Keep terminals visible:**
   - Watch backend logs for errors
   - Watch frontend logs for connection issues

2. **Use browser DevTools:**
   - Network tab → WS filter → See WebSocket messages
   - Console tab → See connection logs

3. **Test incrementally:**
   - Test connection first
   - Then test simple messages
   - Then test complex features

4. **Version control:**
   - Commit working states
   - Use branches for experiments

## 🎉 Success Indicators

You'll know integration is successful when:

✅ Backend shows "Frontend Connected! 🔗"
✅ Frontend shows no "CONNECTION ERROR"
✅ Messages send instantly
✅ Responses appear within 1-3 seconds
✅ UI updates smoothly
✅ Reconnection works automatically
✅ MongoDB saves all messages
✅ All backend features work

## 📞 Next Steps

1. ✅ **Test basic connection** (see TESTING.md)
2. ✅ **Test all features** (see CHECKLIST.md)
3. ⬜ **Customize UI** (colors, animations)
4. ⬜ **Add more features** (voice input, etc.)
5. ⬜ **Deploy to production** (see deployment scenarios above)
6. ⬜ **Add authentication** (JWT, OAuth)
7. ⬜ **Monitor performance** (logging, analytics)

---

**Your frontend and backend are now fully integrated! 🎊**
