import os
import json
import google.generativeai as genai 
# OR use "from groq import Groq" if you switched to Groq
from dotenv import load_dotenv
from app.services.memory import memory

load_dotenv()

# --- CONFIGURATION ---
# If you are using Google Gemini:
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class JarvisBrain:
    def __init__(self):
        # Use gemini-1.5-flash which is stable and working
        self.model = genai.GenerativeModel('gemini-2.5-flash') 
        
        # --- UPDATED INSTRUCTIONS ---
        self.system_instruction = """
        You are Jarvis, an advanced AI assistant.
        You MUST reply in valid JSON format only.
        
        Available Actions:
        1. "open_app" -> args: "app_name" (e.g., chrome, notepad)
        2. "media_control" -> args: "play_pause", "volume_up", "volume_down", "mute"
        3. "system_stats" -> args: null
        4. "weather" -> args: "city_name" (Extract city from user input. Default to 'Kolkata' if not specified)
        5. "chat" -> args: null (for general conversation)
        
        Format:
        {"action": "...", "args": "...", "reply": "..."}
        
        Example 1:
        User: "What's the weather in London?"
        Output: {"action": "weather", "args": "London", "reply": "Checking weather for London..."}
        
        Example 2:
        User: "How is the weather?"
        Output: {"action": "weather", "args": "Kolkata", "reply": "Checking local weather..."}
        """

    async def think(self, user_text: str):
        try:
            print(f"🧠 Brain thinking about: {user_text}")
            
            # 1. FETCH MEMORY
            history = await memory.get_recent_context(limit=5)
            print(f"📚 Memory context: {history[:100]}...")
            
            # 2. CONSTRUCT PROMPT
            full_prompt = (
                f"{self.system_instruction}\n\n"
                f"--- MEMORY ---\n{history}\n"
                f"--- USER ---\n{user_text}\n"
                f"Output:"
            )
            
            # 3. ASK AI
            print(f"🤖 Calling Gemini API...")
            response = self.model.generate_content(full_prompt)
            clean_text = response.text.strip()
            print(f"📝 Raw AI response: {clean_text}")
            
            # Clean Markdown
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "")
            
            decision = json.loads(clean_text)
            print(f"✅ Parsed decision: {decision}")

            # 4. SAVE TO MEMORY
            await memory.add_message("user", user_text)
            
            # Note: We don't save the AI reply here yet if it's a tool call
            # We will save the *actual* result in websocket.py
            
            return decision
            
        except Exception as e:
            print(f"❌ Brain Error: {e}")
            print(f"❌ Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return {"action": "chat", "args": None, "reply": "I am having trouble processing that, sir."}

brain = JarvisBrain()