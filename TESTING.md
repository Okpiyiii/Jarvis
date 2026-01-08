# Testing the Frontend-Backend Connection

## Quick Start

### Option 1: Using Batch Files (Windows)

1. Open two command prompts

**Terminal 1 - Backend:**
```bash
start-backend.bat
```

**Terminal 2 - Frontend:**
```bash
start-frontend.bat
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd jarvis-backend
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Test Scenarios

### 1. Basic Connection Test

1. Start backend (should show "Jarvis Core Online")
2. Start frontend (should open browser at localhost:5173)
3. Click "INITIALIZE SYSTEM" button
4. Check browser console - should see "Connected to Jarvis Backend"
5. Backend console should show "Frontend Connected! 🔗"

### 2. Text Message Test

1. After initialization, click the microphone icon at the bottom
2. Type: "Hello Jarvis"
3. Press Enter
4. Backend console should show:
   ```
   User: Hello Jarvis
   Brain: {decision output}
   ```
5. Frontend should display the response with typewriter effect

### 3. Action Commands Test

Try these commands to test different backend features:

**Weather:**
```
What's the weather in New York?
```

**System Stats:**
```
Show system stats
```

**App Control:**
```
Open Chrome
```

**Media Control:**
```
Play music
Pause
Next track
```

### 4. Visual State Test

Watch the 3D orb in the center:
- **Blue/Idle**: Before sending message
- **Processing**: After sending, before response
- **Speaking**: During response display (should pulse with audio level)
- **Red**: Connection error

### 5. Reconnection Test

1. Stop the backend server (Ctrl+C)
2. Frontend should show "CONNECTION ERROR" banner
3. Restart backend
4. Frontend should auto-reconnect within 3 seconds
5. Error banner should disappear

## Expected Console Output

### Backend Console (Success)
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
Frontend Connected! 🔗
User: Hello Jarvis
Brain: {'reply': 'Hello! How can I assist you?', 'action': None, 'args': None}
```

### Frontend Console (Success)
```
Connected to Jarvis Backend
```

### Frontend Console (Error)
```
WebSocket Error: [error details]
Disconnected from Jarvis Backend
```

## Common Issues

### Backend Won't Start

**Error: "ModuleNotFoundError: No module named 'fastapi'"**
```bash
cd jarvis-backend
pip install -r requirements.txt
```

**Error: "Port 8000 is already in use"**
```bash
# Kill the process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use a different port:
uvicorn app.main:app --reload --port 8001
# Then update .env.local: VITE_BACKEND_WS_URL=ws://localhost:8001/ws/chat
```

### Frontend Won't Connect

**Check 1: Backend URL**
- Verify `.env.local` has correct URL
- Default: `ws://localhost:8000/ws/chat`

**Check 2: CORS**
- Backend allows all origins by default
- Check browser console for CORS errors

**Check 3: Firewall**
- Ensure port 8000 is not blocked
- Try disabling firewall temporarily

### No Response from Backend

**Check 1: MongoDB Connection**
- Verify `MONGO_URI` in `jarvis-backend/.env`
- Test connection: `python jarvis-backend/check_models.py`

**Check 2: Gemini API Key**
- Verify `GEMINI_API_KEY` in `jarvis-backend/.env`
- Check API quota at https://aistudio.google.com/

**Check 3: Backend Logs**
- Look for errors in backend console
- Common: API rate limits, database connection issues

## Debug Mode

### Enable Verbose Logging

**Backend:**
Edit `jarvis-backend/app/api/websocket.py` - already has print statements

**Frontend:**
Add to `hooks/useJarvisWebSocket.ts`:
```typescript
ws.onmessage = (event) => {
    console.log('Received:', event.data); // Add this line
    try {
        const data: IncomingMessage = JSON.parse(event.data);
        // ... rest of code
    }
};
```

## Performance Testing

### Message Latency
- Typical: 1-3 seconds (depends on Gemini API)
- Network: <100ms (local WebSocket)
- Processing: 1-2 seconds (AI thinking)

### Concurrent Users
- Backend supports multiple WebSocket connections
- Each connection maintains separate conversation context

## Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and opens in browser
- [ ] "INITIALIZE SYSTEM" button appears
- [ ] After clicking, no "CONNECTION ERROR" appears
- [ ] Text input appears when clicking microphone icon
- [ ] Messages send successfully
- [ ] Responses appear with typewriter effect
- [ ] 3D orb changes color based on state
- [ ] Backend console shows user messages
- [ ] Reconnection works after backend restart

## Next Steps

Once basic connection works:
1. Test all action commands (weather, apps, media)
2. Verify MongoDB is storing conversation history
3. Test system stats display
4. Customize the UI colors/animations
5. Add voice input (optional)
6. Deploy to production (see DEPLOYMENT.md - if needed)
