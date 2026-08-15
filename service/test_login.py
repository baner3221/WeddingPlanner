import os
from database import supabase

email = "neelanjanbanerjee12@gmail.com"
password = "Neel@12"

print(f"Attempting to sign in as {email}...")

try:
    response = supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    print("Sign In Success! The credentials are valid and the server is up.")
    print("Session token:", response.session.access_token[:20], "...")
except Exception as e:
    print(f"Sign In Failed: {e}")
    
    print("\nAttempting to sign up instead (in case the account doesn't exist)...")
    try:
        signup_res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        print("Sign Up Success! The account has now been created.")
    except Exception as e2:
        print(f"Sign Up Failed: {e2}")
