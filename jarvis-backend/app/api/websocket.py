from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from app.services.brain import brain
from app.services.automation import automation
from app.services.memory import memory # Import memory to save final answer

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend Connected! 🔗")
    
    try:
        while True:
            # 1. Receive Text
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                user_text = message.get("text", "")
            except:
                user_text = data

            print(f"User: {user_text}") 

            # 2. Ask Brain
            decision = await brain.think(user_text)
            print(f"Brain: {decision}")

            # 3. Execute Action
            response_text = decision.get("reply")
            action = decision.get("action")
            args = decision.get("args")

            # --- ACTION HANDLERS ---
            
            if action == "open_app":
                status = automation.open_app(args)
                # We can append status to the reply if needed
                
            elif action == "media_control":
                status = automation.media_control(args)

            elif action == "system_stats":
                stats = automation.get_system_stats()
                await websocket.send_text(json.dumps(stats))
                continue # Skip standard reply for stats

            elif action == "weather":
                # Execute Weather Tool
                weather_report = automation.get_weather(args)
                # Overwrite the AI's placeholder reply with the REAL data
                response_text = weather_report

            # -----------------------

            # 4. Save the Final Response to Memory
            # (So he remembers he just told you the weather)
            await memory.add_message("model", response_text)

            # 5. Send Response to Frontend
            final_response = {
                "type": "response",
                "text": response_text,
                "state": "speaking"
            }
            await websocket.send_text(json.dumps(final_response))
                
    except WebSocketDisconnect:
        print("Frontend Disconnected ❌")
    except Exception as e:
        print(f"Error: {e}")