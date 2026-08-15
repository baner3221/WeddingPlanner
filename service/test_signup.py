import os
from database import supabase

print("Attempting to sign up a test user to verify Auth service...")

try:
    response = supabase.auth.sign_up({
        "email": "test_auth_check@example.com",
        "password": "Password123!"
    })
    print("Success! Auth service is up and running.")
    print(response)
except Exception as e:
    print(f"Auth Signup Failed: {e}")
