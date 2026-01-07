import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load config
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class JarvisBrain:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-flash-latest') # Fast and cheap model
        
        # This System Prompt is the "Personality" + "Rules"
        self.system_instruction = """
        You are Jarvis, a helpful AI assistant. 
        Analyze the user's input and decide the best action.
        
        You MUST reply in STRICT JSON format only. No markdown, no extra text.
        
        Structure:
        {
            "action": "type_of_action", 
            "args": "arguments_for_action",
            "reply": "what_you_say_to_user"
        }
        
        Available Actions:
        1. "open_app" -> args: "app_name" (e.g., chrome, notepad, spotify)
        2. "system_stats" -> args: null
        3. "chat" -> args: null (for general conversation)
        
        Example 1:
        User: "Open youtube please"
        Output: {"action": "open_app", "args": "youtube", "reply": "Opening YouTube now."}
        
        Example 2:
        User: "How are you?"
        Output: {"action": "chat", "args": null, "reply": "I am fully operational, sir."}
        """

    async def think(self, user_text: str):
        try:
            # We combine system instruction + user text
            full_prompt = f"{self.system_instruction}\nUser: {user_text}\nOutput:"
            
            response = self.model.generate_content(full_prompt)
            clean_text = response.text.strip()
            
            # Remove markdown if Gemini adds it (```json ... ```)
            if clean_text.startswith("```json"):
                clean_text = clean_text.replace("```json", "").replace("```", "")
            
            return json.loads(clean_text)
            
        except Exception as e:
            print(f"Brain Error: {e}")
            return {"action": "chat", "args": None, "reply": "My brain encountered an error, sir."}

brain = JarvisBrain()