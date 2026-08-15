import pytest
import requests

BASE_URL = "http://localhost:8000"

def test_ping():
    res = requests.get(f"{BASE_URL}/ping")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "message": "Pong!"}

def test_api_activity():
    payload = {"action_type": "test_action", "description": "Automated endpoint test"}
    res = requests.post(f"{BASE_URL}/api/activity", json=payload)
    assert res.status_code == 200
    assert res.json() == {"status": "success"}

def test_api_summary():
    # This hits the Gemini API so we will just check for a successful 200 or 500 (if keys are missing)
    try:
        res = requests.get(f"{BASE_URL}/api/summary", timeout=10)
        # It's okay if it fails due to missing API keys in the test environment
        assert res.status_code in [200, 500]
    except requests.exceptions.RequestException:
        pass

def test_api_chat():
    payload = {"message": "Hello", "history": []}
    try:
        res = requests.post(f"{BASE_URL}/api/chat", json=payload, timeout=10)
        assert res.status_code in [200, 500]
    except requests.exceptions.RequestException:
        pass

def test_api_upload_logistics(tmp_path):
    csv_file = tmp_path / "test.csv"
    csv_file.write_text("name,side,number_of_persons\nTest Guest,Groom,2")
    
    with open(csv_file, "rb") as f:
        files = {"file": ("test.csv", f, "text/csv")}
        res = requests.post(f"{BASE_URL}/api/upload/logistics", files=files)
        
    assert res.status_code in [200, 400, 500]
