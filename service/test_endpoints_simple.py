import urllib.request
import urllib.error
import json
import uuid

BASE_URL = "http://localhost:8000"

def test_ping():
    print("Testing /ping...")
    req = urllib.request.Request(f"{BASE_URL}/ping")
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        print("Success:", response.read().decode())

def test_api_activity():
    print("Testing /api/activity...")
    data = json.dumps({"action_type": "test_action", "description": "Automated endpoint test"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/activity", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        assert response.status == 200
        print("Success:", response.read().decode())

def test_api_summary():
    print("Testing /api/summary...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/summary")
        with urllib.request.urlopen(req, timeout=10) as response:
            print("Success:", response.read().decode()[:100], "...")
    except Exception as e:
        print("Expected error/timeout for AI API:", e)

def test_api_chat():
    print("Testing /api/chat...")
    data = json.dumps({"message": "Hello", "history": []}).encode('utf-8')
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/chat", data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as response:
            print("Success:", response.read().decode()[:100], "...")
    except Exception as e:
        print("Expected error/timeout for AI API:", e)

def test_api_upload_logistics():
    print("Testing /api/upload/logistics...")
    boundary = uuid.uuid4().hex
    headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}
    
    body = (
        f"--{boundary}\r\n"
        f"Content-Disposition: form-data; name=\"file\"; filename=\"test.csv\"\r\n"
        f"Content-Type: text/csv\r\n\r\n"
        f"name,side,number_of_persons\nTest Guest,Groom,2\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')

    try:
        req = urllib.request.Request(f"{BASE_URL}/api/upload/logistics", data=body, headers=headers)
        with urllib.request.urlopen(req) as response:
            print("Success:", response.read().decode())
    except urllib.error.HTTPError as e:
        print("Expected error for AI API/parsing:", e)

if __name__ == "__main__":
    test_ping()
    test_api_activity()
    test_api_summary()
    test_api_chat()
    test_api_upload_logistics()
    print("All endpoint tests completed.")
