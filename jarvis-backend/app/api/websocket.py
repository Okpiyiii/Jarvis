from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from app.services.brain import brain
from app.services.automation import automation

router = APIRouter()

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Frontend Connected! 🔗")
    
    try:
        while True:
            # 1. Receive Text from Frontend
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

            if action == "open_app":
                status = automation.open_app(args)
                # Optional: Append status to reply if needed
                
            elif action == "media_control":
                status = automation.media_control(args)

            elif action == "system_stats":
                stats = automation.get_system_stats()
                await websocket.send_text(json.dumps(stats))

            # 4. Send Response to Frontend
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