import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load the environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: API Key not found! Check your .env file.")
else:
    print(f"✅ Key Found: {api_key[:5]}... (hidden)")
    
    # Configure Gemini
    genai.configure(api_key=api_key)

    print("\n🔍 Asking Google for available models...")
    try:
        count = 0
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"👉 Found Model: {m.name}")
                count += 1
        
        if count == 0:
            print("⚠️ No models found! Your API Key might be invalid or the project doesn't have the API enabled.")
            
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {e}")