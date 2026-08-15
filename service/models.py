from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date



class ActivityCreate(BaseModel):
    action_type: str
    description: str

class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []

# --- Phase 6 Logistics Models ---

class GuestCreate(BaseModel):
    name: str
    side: Optional[str]
    category: Optional[str]
    dietary_restrictions: Optional[str]
    place: Optional[str]
    contact_number: Optional[str]
    number_of_persons: Optional[str]
    arrival_date: Optional[str]
    departure_date: Optional[str]
    remarks: Optional[str]

class EventCreate(BaseModel):
    name: str
    day_number: int
    start_time: Optional[str]
    end_time: Optional[str]
    location: Optional[str]

class RoomAllocationCreate(BaseModel):
    guest_name: str
    hotel_name: Optional[str]
    room_number: Optional[str]
    check_in: Optional[str]
    check_out: Optional[str]
    room_type: Optional[str]
    number_of_rooms: Optional[str]
    extra_beds_required: Optional[str]

class TravelRequestCreate(BaseModel):
    guest_name: str
    pickup_location: Optional[str]
    drop_location: Optional[str]
    travel_datetime: Optional[str]
    vehicle_type: Optional[str]

class LogisticsExtractionResult(BaseModel):
    guests: List[GuestCreate]
    room_allocations: List[RoomAllocationCreate]
    travel_requests: List[TravelRequestCreate]
