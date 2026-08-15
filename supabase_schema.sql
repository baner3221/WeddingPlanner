-- Run this in your Supabase SQL Editor

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create venues table
CREATE TABLE venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table for AI summarization
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 6: Grand Indian Wedding Logistics

CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  side TEXT DEFAULT 'groom', -- groom or bride
  category TEXT,
  dietary_restrictions TEXT,
  place TEXT,
  contact_number TEXT,
  number_of_persons TEXT,
  arrival_date TEXT,
  departure_date TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  day_number INTEGER DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE room_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  hotel_name TEXT,
  room_number TEXT,
  check_in DATE,
  check_out DATE,
  room_type TEXT,
  number_of_rooms TEXT,
  extra_beds_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE travel_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  pickup_location TEXT,
  drop_location TEXT,
  travel_datetime TIMESTAMP WITH TIME ZONE,
  vehicle_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  cost NUMERIC,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instructions for Storage Buckets:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click 'New Bucket'
-- 3. Create a bucket named 'inspiration' (Public)
-- 4. Create a bucket named 'documents' (Private or Public depending on need)

