from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import websocket

app = FastAPI(title="Jarvis Backend")

# CORS (Allow Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for now (Vercel, Localhost, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)

@app.get("/")
def home():
    return {"status": "Jarvis Core Online", "brain": "Gemini-Flash", "memory": "MongoDB"}
# Run command: uvicorn app.main:app --reload