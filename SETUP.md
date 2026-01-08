# Jarvis Frontend-Backend Connection Setup

## Overview
The frontend is now connected to your FastAPI backend via WebSocket. The backend handles all AI processing, memory, automation, and database operations.

## Architecture
```
Frontend (React + Vite)
    ↓ WebSocket
Backend (FastAPI)
    ↓
├── Brain (Gemini AI)
├── Memory (MongoDB)
└── Automation (System Control)
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd jarvis-backend
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Make sure your `.env` file has the correct credentials:
```
GEMINI_API_KEY=your_api_key_here
MONGO_URI=your_mongodb_uri_here
DB_NAME=jarvis
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

In the root directory, install dependencies:
```bash
npm install
```

Configure the backend URL in `.env.local` (already created):
```
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/chat
```

Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## How It Works

### Message Flow

1. **User Input**: User types a message in the chat interface
2. **Frontend → Backend**: Message sent via WebSocket as JSON: `{"text": "your message"}`
3. **Backend Processing**:
   - Brain analyzes the message using Gemini AI
   - Determines action (open_app, weather, media_control, etc.)
   - Executes automation if needed
   - Saves conversation to MongoDB memory
4. **Backend → Frontend**: Response sent as JSON: `{"type": "response", "text": "response text", "state": "speaking"}`
5. **Frontend Display**: Response shown with typewriter effect

### System Stats (Optional)

The backend can send system stats (CPU, RAM, Battery) to the frontend:
```json
{
  "type": "system_stats",
  "cpu": "32%",
  "ram": "48%",
  "battery": "100%"
}
```

To enable this, send a message like "show system stats" or implement periodic updates in the backend.

## Configuration

### Change Backend URL

Edit `.env.local`:
```
VITE_BACKEND_WS_URL=ws://your-backend-url:port/ws/chat
```

### CORS Settings

The backend is configured to allow all origins. For production, update `app/main.py`:
```python
allow_origins=["https://your-frontend-domain.com"]
```

## Troubleshooting

### Connection Failed
- Ensure backend is running on port 8000
- Check firewall settings
- Verify WebSocket URL in `.env.local`

### Backend Not Responding
- Check backend console for errors
- Verify MongoDB connection
- Ensure Gemini API key is valid

### Frontend Shows "CONNECTION ERROR"
- Backend is not running or unreachable
- WebSocket URL is incorrect
- CORS issues (check browser console)

## Testing

1. Start both backend and frontend
2. Click "INITIALIZE SYSTEM" button
3. Click the microphone icon to show text input
4. Type a message like "Hello Jarvis"
5. You should see the response appear with typewriter effect

## Features Preserved

All backend features remain unchanged:
- ✅ Gemini AI Brain
- ✅ MongoDB Memory
- ✅ System Automation (open apps, media control)
- ✅ Weather API
- ✅ System Stats
- ✅ Conversation History

The frontend now provides a beautiful 3D interface for your existing backend!
