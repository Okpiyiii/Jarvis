from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from app.services.brain import brain        # The Brain 🧠
from app.services.automation import automation  # The Hands 🦾

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend Connected! 🔗")
    
    try:
        while True:
            # 1. Receive Audio/Text from Client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                user_text = message.get("text", "")
            except:
                user_text = data # Fallback if raw text sent

            print(f"User Said: {user_text}") 

            # 2. ASK THE BRAIN (Gemini)
            # The brain returns: {"action": "open_app", "args": "chrome", "reply": "Opening Chrome"}
            decision = await brain.think(user_text)
            
            print(f"Brain Decided: {decision}") # Debug log

            # 3. EXECUTE THE ACTION (The Hands)
            response_text = decision.get("reply")
            action = decision.get("action")
            args = decision.get("args")

            # --- ACTION LOGIC ---
            if action == "open_app":
                # Execute the automation
                status = automation.open_app(args)
                print(f"System: {status}")
            
            elif action == "system_stats":
                # Fetch stats
                stats = automation.get_system_stats()
                # Send stats to frontend immediately
                await websocket.send_text(json.dumps(stats))
                
            # 4. SEND FINAL RESPONSE TO FRONTEND
            # This is what the Frontend will SPEAK out loud
            final_response = {
                "type": "response",
                "text": response_text,
                "state": "speaking"
            }
            
            await websocket.send_text(json.dumps(final_response))
                
    except WebSocketDisconnect:
        print("Frontend Disconnected ❌")
    except Exception as e:
        print(f"Critical Error: {e}")