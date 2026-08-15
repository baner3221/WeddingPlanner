import os
import json
import google.generativeai as genai
from database import supabase
from dotenv import load_dotenv
from models import LogisticsExtractionResult

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# --- TOOLS FOR GEMINI ---

def get_tasks(status: str = "all") -> str:
    """Fetches the user's wedding tasks.
    Args:
        status: The status of tasks to fetch. Can be 'all', 'pending', or 'completed'.
    """
    query = supabase.table("tasks").select("title, description, status, due_date")
    if status in ['pending', 'completed']:
        query = query.eq("status", status)
    res = query.execute()
    if not res.data:
        return "No tasks found."
    return str(res.data)

def get_venues() -> str:
    """Fetches the list of saved wedding venues and their details like cost and notes."""
    res = supabase.table("venues").select("name, location, cost, notes").execute()
    if not res.data:
        return "No venues saved yet."
    return str(res.data)

def get_recent_activities(limit: int = 10) -> str:
    """Fetches the most recent activities and changes made to the wedding plan."""
    res = supabase.table("activities").select("action_type, description, timestamp").order("timestamp", desc=True).limit(limit).execute()
    if not res.data:
        return "No recent activities."
    return str(res.data)

def get_inspiration_designs() -> str:
    """Fetches the names of uploaded inspiration images/designs."""
    res = supabase.storage.from_("inspiration").list()
    if not res:
        return "No inspiration images uploaded."
    # filter out placeholders
    files = [f['name'] for f in res if f['name'] != '.emptyFolderPlaceholder']
    if not files:
        return "No inspiration images uploaded."
    return f"Uploaded designs: {', '.join(files)}"

# --- LOGISTICS CRUD TOOLS ---

def get_guests() -> str:
    """Fetches the list of all wedding guests and their details."""
    res = supabase.table("guests").select("*").execute()
    return str(res.data) if res.data else "No guests found."

def add_guest(name: str, side: str = 'groom', category: str = '', dietary_restrictions: str = '') -> str:
    """Adds a new guest to the wedding guest list."""
    res = supabase.table("guests").insert({"name": name, "side": side, "category": category, "dietary_restrictions": dietary_restrictions}).execute()
    return f"Successfully added guest {name}."

def update_guest(guest_id: str, name: str = None, side: str = None, category: str = None, dietary_restrictions: str = None, place: str = None, contact_number: str = None, number_of_persons: str = None, arrival_date: str = None, departure_date: str = None, remarks: str = None) -> str:
    """Updates an existing guest. The AI MUST use get_guests first to find the exact guest_id UUID."""
    data = {k: v for k, v in locals().items() if v is not None and k != 'guest_id'}
    if not data: return "No fields to update."
    res = supabase.table("guests").update(data).eq("id", guest_id).execute()
    return f"Successfully updated guest {guest_id}."

def delete_guest(guest_id: str) -> str:
    """Deletes a guest from the database. The AI MUST use get_guests first to find the exact guest_id UUID."""
    res = supabase.table("guests").delete().eq("id", guest_id).execute()
    return f"Successfully deleted guest {guest_id}."

def get_room_allocations() -> str:
    """Fetches all hotel room allocations for guests."""
    res = supabase.table("room_allocations").select("*").execute()
    return str(res.data) if res.data else "No room allocations found."

def assign_room(guest_name: str, hotel_name: str, room_number: str) -> str:
    """Assigns a hotel room to a guest."""
    res = supabase.table("room_allocations").insert({"guest_name": guest_name, "hotel_name": hotel_name, "room_number": room_number}).execute()
    return f"Successfully assigned room {room_number} at {hotel_name} to {guest_name}."

def update_room_allocation(allocation_id: str, guest_name: str = None, hotel_name: str = None, room_number: str = None, check_in: str = None, check_out: str = None, room_type: str = None, number_of_rooms: str = None, extra_beds_required: str = None) -> str:
    """Updates an existing room allocation. The AI MUST use get_room_allocations first to find the exact allocation_id UUID."""
    data = {k: v for k, v in locals().items() if v is not None and k != 'allocation_id'}
    if not data: return "No fields to update."
    res = supabase.table("room_allocations").update(data).eq("id", allocation_id).execute()
    return f"Successfully updated room allocation {allocation_id}."

def delete_room_allocation(allocation_id: str) -> str:
    """Deletes a room allocation. The AI MUST use get_room_allocations first to find the exact allocation_id UUID."""
    res = supabase.table("room_allocations").delete().eq("id", allocation_id).execute()
    return f"Successfully deleted room allocation {allocation_id}."

def get_travel_requests() -> str:
    """Fetches all travel and cab requests for guests (airport pickups, drops, etc)."""
    res = supabase.table("travel_requests").select("*").execute()
    return str(res.data) if res.data else "No travel requests found."

def add_travel_request(guest_name: str, pickup_location: str, travel_datetime: str, vehicle_type: str = '') -> str:
    """Adds a new travel/cab request for a guest (e.g. airport pickup)."""
    res = supabase.table("travel_requests").insert({"guest_name": guest_name, "pickup_location": pickup_location, "travel_datetime": travel_datetime, "vehicle_type": vehicle_type}).execute()
    return f"Successfully created travel request for {guest_name} from {pickup_location}."

def update_travel_request(request_id: str, guest_name: str = None, pickup_location: str = None, drop_location: str = None, travel_datetime: str = None, vehicle_type: str = None, status: str = None) -> str:
    """Updates a travel request. The AI MUST use get_travel_requests first to find the exact request_id UUID."""
    data = {k: v for k, v in locals().items() if v is not None and k != 'request_id'}
    if not data: return "No fields to update."
    res = supabase.table("travel_requests").update(data).eq("id", request_id).execute()
    return f"Successfully updated travel request {request_id}."

def delete_travel_request(request_id: str) -> str:
    """Deletes a travel request. The AI MUST use get_travel_requests first to find the exact request_id UUID."""
    res = supabase.table("travel_requests").delete().eq("id", request_id).execute()
    return f"Successfully deleted travel request {request_id}."

def get_itinerary() -> str:
    """Fetches the schedule of events for the wedding itinerary."""
    res = supabase.table("events").select("*").order("day_number").execute()
    return str(res.data) if res.data else "No events found."

def add_event(name: str, day_number: int, start_time: str, location: str) -> str:
    """Adds a new event to the wedding itinerary."""
    res = supabase.table("events").insert({"name": name, "day_number": day_number, "start_time": start_time, "location": location}).execute()
    return f"Successfully added event {name} on day {day_number}."


# --- QUOTATION TOOLS ---

def get_quotations(status: str = 'all') -> str:
    """Fetches vendor quotations and their costs. status can be 'all', 'pending', 'approved', or 'rejected'."""
    query = supabase.table("quotations").select("*")
    if status in ['pending', 'approved', 'rejected']:
        query = query.eq("status", status)
    res = query.execute()
    return str(res.data) if res.data else "No quotations found."

def add_quotation(vendor_name: str, service_type: str, cost: float, notes: str = '') -> str:
    """Adds a new quotation to the tracking system."""
    res = supabase.table("quotations").insert({"vendor_name": vendor_name, "service_type": service_type, "cost": cost, "notes": notes}).execute()
    return f"Successfully added quotation for {vendor_name} ({service_type}) at ₹{cost}."

def update_quotation_status(quotation_id: str, status: str) -> str:
    """Updates the status of a quotation (approved or rejected). The AI MUST use get_quotations first to find the exact quotation_id."""
    res = supabase.table("quotations").update({"status": status}).eq("id", quotation_id).execute()
    return f"Successfully updated quotation {quotation_id} to {status}."

# Model Setup
tools = [
    get_tasks, get_venues, get_recent_activities, get_inspiration_designs,
    get_guests, add_guest, update_guest, delete_guest,
    get_room_allocations, assign_room, update_room_allocation, delete_room_allocation,
    get_travel_requests, add_travel_request, update_travel_request, delete_travel_request,
    get_itinerary, add_event,
    get_quotations, add_quotation, update_quotation_status
]

try:
    # Using gemini-2.5-flash-lite since it has a higher free tier rate limit and supports tools
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash-lite',
        tools=tools,
        system_instruction="You are a warm, helpful, and highly organized wedding planning assistant. You help the user manage their tasks, venues, and inspiration board. Be concise but extremely encouraging and friendly. Use the provided tools to look up the user's wedding plan state before answering questions about it. IMPORTANT: To update or delete a record, you MUST use the corresponding 'get_' tool first to find the UUID of the record. Never guess a UUID."
    )
except Exception as e:
    print(f"Failed to initialize Gemini model: {e}")
    model = None

def generate_summary() -> str:
    return "Your wedding planning is making beautiful progress! Check your tasks and itinerary for what's next."

def chat_with_assistant(user_message: str, history: list = None) -> str:
    if not model:
        return "AI Assistant is currently unavailable. Please check your Gemini API key."
    try:
        formatted_history = []
        if history:
            for msg in history:
                role = 'user' if msg['role'] == 'user' else 'model'
                formatted_history.append({'role': role, 'parts': [msg['content']]})
        
        chat = model.start_chat(history=formatted_history, enable_automatic_function_calling=True)
        response = chat.send_message(user_message)
        try:
            return response.text
        except ValueError:
            return "I've processed your request!"
    except Exception as e:
        if '429' in str(e) or 'Quota' in str(e):
            return "Whoops! We're talking too fast. The free AI tier has a strict rate limit. Please wait 10 seconds and try again!"
        print(e)
        return "I'm having trouble connecting to my brain right now!"

def parse_logistics_sheet(raw_json_data: str) -> dict:
    if not GEMINI_API_KEY:
        raise Exception("AI Assistant is currently unavailable. Please check your Gemini API key.")
        
    parser_model = genai.GenerativeModel(
        model_name='gemini-2.5-flash-lite',
        system_instruction="You are an expert wedding logistics parser. You will receive a raw, messy JSON array extracted from a wedding guest sheet. Your job is to extract the guests, their room allocations, and any travel requests, and map them precisely to the provided schema. The user specifically requested that grouped names like 'Bharati (Annie+Satyam)' should NOT be split into individual guests; keep them grouped together exactly as written. Extract dietary restrictions, hotel names, room numbers, and arrival/departure info."
    )
    
    response = parser_model.generate_content(
        f"Parse this unstructured sheet data into the schema:\n{raw_json_data}",
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=LogisticsExtractionResult
        )
    )
    
    return json.loads(response.text)
