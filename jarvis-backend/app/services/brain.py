import os
import google.generativeai as genai
from dotenv import load_dotenv
import json
from app.services.memory import memory

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class JarvisBrain:
    def __init__(self):
        # Using the model that worked for you
        self.model = genai.GenerativeModel('gemini-flash-latest')
        
        self.system_instruction = """
        You are Jarvis, a futuristic AI assistant.
        You MUST reply in valid JSON format only.
        
        Available Actions:
        1. "open_app" -> args: "app_name" (e.g., chrome, notepad, youtube)
        2. "media_control" -> args: "play_pause", "volume_up", "volume_down", "mute"
        3. "system_stats" -> args: null
        4. "chat" -> args: null (for general conversation)
        
        Format:
        {"action": "...", "args": "...", "reply": "..."}
        
        Example:
        User: "Play some music"
        Output: {"action": "open_app", "args": "youtube", "reply": "Opening YouTube for you."}
        """

    async def think(self, user_text: str):
        try:
            # 1. FETCH MEMORY
            history = await memory.get_recent_context(limit=5)
            
            # 2. CONSTRUCT PROMPT
            full_prompt = (
                f"{self.system_instruction}\n\n"
                f"--- CONVERSATION HISTORY ---\n{history}\n"
                f"--- CURRENT MESSAGE ---\nUSER: {user_text}\n"
                f"Output:"
            )
            
            # 3. ASK GEMINI
            response = self.model.generate_content(full_prompt)
            clean_text = response.text.strip()
            
            # Clean Markdown if present
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "")
            
            decision = json.loads(clean_text)

            # 4. SAVE INTERACTION TO MEMORY
            await memory.add_message("user", user_text)
            await memory.add_message("model", decision.get("reply"))
            
            return decision
            
        except Exception as e:
            print(f"Brain Error: {e}")
            return {"action": "chat", "args": None, "reply": "I am having trouble connecting to my brain, sir."}

brain = JarvisBrain()