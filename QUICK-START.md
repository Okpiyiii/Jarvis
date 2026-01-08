# 🚀 Quick Start Guide

## Start the System

### 1. Start Backend (Terminal 1)
```bash
cd jarvis-backend
uvicorn app.main:app --reload
```
✅ Should see: `Uvicorn running on http://127.0.0.1:8000`

### 2. Start Frontend (Terminal 2)
```bash
npm run dev
```
✅ Should see: `Local: http://localhost:5173/`

### 3. Open Browser
- Go to `http://localhost:5173`
- Click **"INITIALIZE SYSTEM"**
- Click the microphone icon 🎤
- Type your message and press Enter

## Test Commands

```
Hello Jarvis
What's the weather in London?
Show system stats
Open Chrome
Play music
```

## Connection Status

| Indicator | Meaning |
|-----------|---------|
| Blue Orb | Idle/Listening |
| Pulsing Orb | Processing/Speaking |
| Red Banner | Connection Error |

## Troubleshooting

**Backend won't start?**
```bash
cd jarvis-backend
pip install -r requirements.txt
```

**Frontend won't connect?**
- Check backend is running on port 8000
- Check `.env.local` has: `VITE_BACKEND_WS_URL=ws://localhost:8000/ws/chat`

**No response?**
- Verify `GEMINI_API_KEY` in `jarvis-backend/.env`
- Verify `MONGO_URI` in `jarvis-backend/.env`

## Files Changed

✅ `App.tsx` - Now uses WebSocket instead of Live API
✅ `hooks/useJarvisWebSocket.ts` - Matches backend message format
✅ `constants.ts` - Added backend URL config
✅ `.env.local` - Backend WebSocket URL (created)
✅ `.gitignore` - Added .env.local

## Backend Features (Unchanged)

All your backend features work exactly as before:
- ✅ Gemini AI Brain
- ✅ MongoDB Memory
- ✅ Automation (apps, media, system)
- ✅ Weather API
- ✅ Conversation History

The frontend is just a beautiful UI layer on top!
