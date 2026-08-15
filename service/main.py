from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from database import supabase, log_activity
from models import ActivityCreate, ChatRequest
from ai import generate_summary, chat_with_assistant, parse_logistics_sheet
import os
import requests

app = FastAPI(title="Wedding Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "Pong!"}

# --- GOOGLE DRIVE ENDPOINT ---
@app.get("/api/drive/token")
def get_drive_token():
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    refresh_token = os.environ.get("GOOGLE_REFRESH_TOKEN")

    if not all([client_id, client_secret, refresh_token]):
        raise HTTPException(status_code=500, detail="Missing Google Drive credentials in environment")

    response = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    })

    if not response.ok:
        raise HTTPException(status_code=response.status_code, detail=f"Google OAuth Error: {response.text}")

    data = response.json()
    return {"access_token": data["access_token"], "expires_in": data["expires_in"]}

# --- ACTIVITY ENDPOINT ---

@app.post("/api/activity")
def create_activity(activity: ActivityCreate):
    log_activity(activity.action_type, activity.description)
    return {"status": "success"}

# --- AI ENDPOINTS ---

@app.get("/api/summary")
def get_summary():
    text = generate_summary()
    return {"summary": text}

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    reply = chat_with_assistant(req.message, req.history)
    return {"reply": reply}

# --- LOGISTICS ENDPOINTS ---
import pandas as pd

@app.post("/api/upload/logistics")
async def upload_logistics(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.csv')):
        raise HTTPException(400, "Only .xlsx and .csv files are supported")
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
        
        # Convert to JSON string for AI parsing
        raw_data = df.to_json(orient='records')
        
        # 1. Ask Gemini to extract structured data from the messy JSON
        extracted = parse_logistics_sheet(raw_data)
        
        # 2. Insert into Supabase
        if extracted.get('guests'):
            supabase.table('guests').insert(extracted['guests']).execute()
            
        if extracted.get('room_allocations'):
            supabase.table('room_allocations').insert(extracted['room_allocations']).execute()
            
        if extracted.get('travel_requests'):
            supabase.table('travel_requests').insert(extracted['travel_requests']).execute()
            
        log_activity("logistics_uploaded", f"Uploaded and AI-parsed sheet: {file.filename}")
        
        total_extracted = len(extracted.get('guests', [])) + len(extracted.get('room_allocations', [])) + len(extracted.get('travel_requests', []))
        return {"status": "success", "message": f"AI successfully extracted and saved {total_extracted} logistics records!"}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Failed to process file: {str(e)}")
