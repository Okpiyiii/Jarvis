@echo off
echo Starting Jarvis Backend...
cd jarvis-backend
uvicorn app.main:app --reload
