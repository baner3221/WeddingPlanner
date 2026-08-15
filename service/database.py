import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# For local testing without keys, we can mock the client if needed, but it will fail later
if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase credentials not found in environment variables. Set SUPABASE_URL and SUPABASE_KEY in .env")
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def log_activity(action_type: str, description: str):
    """Logs an activity to the activities table for the AI summarizer."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    try:
        supabase.table("activities").insert({
            "action_type": action_type,
            "description": description
        }).execute()
    except Exception as e:
        print(f"Failed to log activity: {e}")
