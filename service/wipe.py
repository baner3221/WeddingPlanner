import os
from database import supabase

tables = [
    'tasks', 
    'guests', 
    'room_allocations', 
    'travel_requests', 
    'activity_logs', 
    'quotations', 
    'venues'
]

print("Starting database wipe...")

for table in tables:
    try:
        # Attempt to delete all rows by matching a condition that is always true for existing rows
        # Using a dummy filter that won't match anything negative to bypass the "cannot delete without filter" error
        # We try 'id' first, and if it fails, we try 'created_at'
        
        try:
            res = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"[{table}] Wiped using 'id' filter.")
        except Exception:
            # If table doesn't have a UUID 'id' column, it might fail. Let's try created_at.
            res = supabase.table(table).delete().gte("created_at", "2000-01-01T00:00:00").execute()
            print(f"[{table}] Wiped using 'created_at' filter.")
            
    except Exception as e:
        print(f"[{table}] Could not wipe or table might not exist. Error: {e}")

print("Database wipe complete.")
