from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- IMPORT THIS
from app.api import websocket
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# --- NEW: ALLOW CONNECTION FROM ANY UI ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # "*" means Allow All (Kiro AI, Localhost, React, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------

app.include_router(websocket.router)

@app.get("/")
async def root():
    return {"message": "Jarvis Backend is Running! 🚀"}