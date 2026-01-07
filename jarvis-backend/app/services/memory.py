import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class MemoryService:
    def __init__(self):
        uri = os.getenv("MONGO_URI")
        db_name = os.getenv("DB_NAME", "jarvis_db")
        
        if not uri:
            print("⚠️ WARNING: MONGO_URI not found in .env")
            self.collection = None
        else:
            self.client = AsyncIOMotorClient(uri)
            self.db = self.client[db_name]
            self.collection = self.db["chat_history"]

    async def add_message(self, role: str, text: str):
        """Saves a message to the database"""
        if self.collection is None: return
        
        document = {
            "role": role,  # 'user' or 'model'
            "text": text
        }
        await self.collection.insert_one(document)

    async def get_recent_context(self, limit=5):
        """Fetches last few messages for context"""
        if self.collection is None: return ""

        # Fetch last 'limit' messages (reverse order of insertion)
        cursor = self.collection.find().sort("_id", -1).limit(limit)
        
        messages = []
        async for doc in cursor:
            messages.append(f"{doc['role'].upper()}: {doc['text']}")
        
        # Reverse list to make it chronological (Oldest -> Newest)
        return "\n".join(messages[::-1])

memory = MemoryService()