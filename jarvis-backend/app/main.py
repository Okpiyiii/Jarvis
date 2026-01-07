from fastapi import FastAPI
from app.api import websocket

app = FastAPI(title="Jarvis Backend")

# Include the WebSocket Router
app.include_router(websocket.router)

@app.get("/")
def home():
    return {"status": "Jarvis Core Online"}

# Run command: uvicorn app.main:app --reload