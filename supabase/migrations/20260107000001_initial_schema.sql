-- ============================================================================
-- BARBERCONNECT DATABASE SCHEMA
-- Version: 1.0.0
-- Description: Complete schema for on-demand barber service app
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User types
CREATE TYPE user_type AS ENUM ('customer', 'barber', 'admin');

-- Service categories
CREATE TYPE service_category AS ENUM (
  'haircut', 
  'beard', 
  'shave', 
  'combo', 
  'styling', 
  'coloring'
);

-- Request status workflow
CREATE TYPE request_status AS ENUM (
  'pending',
  'matching',
  'negotiating',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
);

-- Barber response status
CREATE TYPE response_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired'
);

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'scheduled',
  'barber_en_route',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

-- Chat message types
CREATE TYPE message_type AS ENUM (
  'text',
  'offer',
  'counter_offer',
  'system',
  'image'
);

-- Offer status
CREATE TYPE offer_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'countered',
  'expired'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- PROFILES (extends auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_type user_type NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  push_token TEXT,
  preferred_language TEXT DEFAULT 'he',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_user_type ON profiles(user_type);

-- -----------------------------------------------------------------------------
-- BARBER PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE barber_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT false,
  location GEOGRAPHY(POINT, 4326),
  last_location_update TIMESTAMPTZ,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  currency TEXT DEFAULT 'ILS',
  working_hours JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_barber_user UNIQUE (user_id)
);

CREATE INDEX idx_barber_location ON barber_profiles USING GIST(location);
CREATE INDEX idx_barber_available ON barber_profiles(is_available) WHERE is_available = true;

-- -----------------------------------------------------------------------------
-- SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_he TEXT,
  category service_category NOT NULL,
  description TEXT,
  description_he TEXT,
  estimated_duration INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active) WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- BARBER SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE barber_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price DECIMAL(10,2),
  custom_duration INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_barber_service UNIQUE (barber_id, service_id)
);

CREATE INDEX idx_barber_services_barber ON barber_services(barber_id);

-- -----------------------------------------------------------------------------
-- PORTFOLIO ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_barber ON portfolio_items(barber_id);

-- -----------------------------------------------------------------------------
-- SERVICE REQUESTS
-- -----------------------------------------------------------------------------
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  scheduled_time TIMESTAMPTZ,
  selected_barber_id UUID REFERENCES barber_profiles(id),
  final_price DECIMAL(10,2),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_created ON service_requests(created_at DESC);

-- -----------------------------------------------------------------------------
-- REQUEST SERVICES
-- -----------------------------------------------------------------------------
CREATE TABLE request_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  
  CONSTRAINT unique_request_service UNIQUE (request_id, service_id)
);

CREATE INDEX idx_request_services_request ON request_services(request_id);

-- -----------------------------------------------------------------------------
-- BARBER RESPONSES
-- -----------------------------------------------------------------------------
CREATE TABLE barber_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  proposed_price DECIMAL(10,2) NOT NULL,
  eta_minutes INTEGER NOT NULL,
  message TEXT,
  status response_status NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_barber_response UNIQUE (request_id, barber_id)
);

CREATE INDEX idx_responses_request ON barber_responses(request_id);
CREATE INDEX idx_responses_barber ON barber_responses(barber_id);

-- -----------------------------------------------------------------------------
-- CHAT MESSAGES
-- -----------------------------------------------------------------------------
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  sender_type user_type NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT,
  offer_amount DECIMAL(10,2),
  offer_status offer_status,
  offer_expires_at TIMESTAMPTZ,
  image_url TEXT,
  thumbnail_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_request ON chat_messages(request_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at);

-- -----------------------------------------------------------------------------
-- BOOKINGS
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id),
  barber_id UUID NOT NULL REFERENCES barber_profiles(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  final_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ILS',
  status booking_status NOT NULL DEFAULT 'scheduled',
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  barber_arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_barber ON bookings(barber_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- -----------------------------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  barber_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

CREATE INDEX idx_reviews_barber ON reviews(barber_id);

-- -----------------------------------------------------------------------------
-- SAVED ADDRESSES
-- -----------------------------------------------------------------------------
CREATE TABLE saved_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_addresses_user ON saved_addresses(user_id);

-- -----------------------------------------------------------------------------
-- FAVORITE BARBERS
-- -----------------------------------------------------------------------------
CREATE TABLE favorite_barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_favorite UNIQUE (customer_id, barber_id)
);

CREATE INDEX idx_favorites_customer ON favorite_barbers(customer_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barber_profiles_updated_at
  BEFORE UPDATE ON barber_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update barber rating after new review
CREATE OR REPLACE FUNCTION update_barber_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE barber_profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE barber_id = NEW.barber_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE barber_id = NEW.barber_id
    )
  WHERE id = NEW.barber_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_barber_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_barber_rating();

-- Find nearby barbers
CREATE OR REPLACE FUNCTION get_nearby_barbers(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  rating DECIMAL,
  total_reviews INTEGER,
  is_verified BOOLEAN,
  distance_meters DOUBLE PRECISION,
  price_min DECIMAL,
  price_max DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.user_id,
    p.display_name,
    p.avatar_url,
    bp.bio,
    bp.rating,
    bp.total_reviews,
    bp.is_verified,
    ST_Distance(
      bp.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) as distance_meters,
    bp.price_min,
    bp.price_max
  FROM barber_profiles bp
  JOIN profiles p ON bp.user_id = p.id
  WHERE 
    bp.is_available = true
    AND p.is_active = true
    AND ST_DWithin(
      bp.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create service request
CREATE OR REPLACE FUNCTION create_service_request(
  p_customer_id UUID,
  p_service_ids UUID[],
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_address TEXT,
  p_notes TEXT DEFAULT NULL,
  p_scheduled_time TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_service_id UUID;
BEGIN
  INSERT INTO service_requests (
    customer_id,
    location,
    address,
    notes,
    scheduled_time,
    expires_at
  ) VALUES (
    p_customer_id,
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
    p_address,
    p_notes,
    p_scheduled_time,
    NOW() + INTERVAL '30 minutes'
  )
  RETURNING id INTO v_request_id;
  
  FOREACH v_service_id IN ARRAY p_service_ids
  LOOP
    INSERT INTO request_services (request_id, service_id)
    VALUES (v_request_id, v_service_id);
  END LOOP;
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accept barber response and create booking
CREATE OR REPLACE FUNCTION accept_barber_response(
  p_request_id UUID,
  p_response_id UUID,
  p_customer_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_response barber_responses%ROWTYPE;
  v_request service_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_response
  FROM barber_responses
  WHERE id = p_response_id AND request_id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Response not found';
  END IF;
  
  SELECT * INTO v_request
  FROM service_requests
  WHERE id = p_request_id AND customer_id = p_customer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or not owned by customer';
  END IF;
  
  UPDATE service_requests
  SET 
    status = 'confirmed',
    selected_barber_id = v_response.barber_id,
    final_price = v_response.proposed_price
  WHERE id = p_request_id;
  
  UPDATE barber_responses
  SET status = 'accepted'
  WHERE id = p_response_id;
  
  UPDATE barber_responses
  SET status = 'rejected'
  WHERE request_id = p_request_id AND id != p_response_id;
  
  INSERT INTO bookings (
    request_id,
    barber_id,
    customer_id,
    final_price,
    location,
    address,
    scheduled_time
  ) VALUES (
    p_request_id,
    v_response.barber_id,
    p_customer_id,
    v_response.proposed_price,
    v_request.location,
    v_request.address,
    v_request.scheduled_time
  )
  RETURNING id INTO v_booking_id;
  
  INSERT INTO chat_messages (
    request_id,
    sender_id,
    sender_type,
    message_type,
    content
  ) VALUES (
    p_request_id,
    p_customer_id,
    'customer',
    'system',
    'Booking confirmed! Your barber is on the way.'
  );
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_barbers ENABLE ROW LEVEL SECURITY;

-- PROFILES Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

-- BARBER_PROFILES Policies
CREATE POLICY "Barber profiles are viewable by everyone"
  ON barber_profiles FOR SELECT
  USING (true);

CREATE POLICY "Barbers can update own profile"
  ON barber_profiles FOR UPDATE
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Barbers can insert own profile"
  ON barber_profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- SERVICES Policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (is_active = true);

-- BARBER_SERVICES Policies
CREATE POLICY "Barber services are viewable by everyone"
  ON barber_services FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage own services"
  ON barber_services FOR ALL
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- PORTFOLIO_ITEMS Policies
CREATE POLICY "Portfolio items are viewable by everyone"
  ON portfolio_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Barbers can manage own portfolio"
  ON portfolio_items FOR ALL
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- SERVICE_REQUESTS Policies
CREATE POLICY "Customers can view own requests"
  ON service_requests FOR SELECT
  USING (customer_id = (SELECT auth.uid()));

CREATE POLICY "Barbers can view nearby requests"
  ON service_requests FOR SELECT
  USING (
    status IN ('pending', 'matching')
    AND EXISTS (
      SELECT 1 FROM barber_profiles bp
      WHERE bp.user_id = (SELECT auth.uid())
      AND bp.is_available = true
      AND ST_DWithin(
        service_requests.location,
        bp.location,
        10000
      )
    )
  );

CREATE POLICY "Customers can create requests"
  ON service_requests FOR INSERT
  WITH CHECK (customer_id = (SELECT auth.uid()));

CREATE POLICY "Customers can update own pending requests"
  ON service_requests FOR UPDATE
  USING (
    customer_id = (SELECT auth.uid())
    AND status IN ('pending', 'matching', 'negotiating')
  );

-- REQUEST_SERVICES Policies
CREATE POLICY "Request services viewable by participants"
  ON request_services FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM service_requests 
      WHERE customer_id = (SELECT auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM barber_responses br
      WHERE br.request_id = request_services.request_id
      AND br.barber_id IN (
        SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "Customers can insert request services"
  ON request_services FOR INSERT
  WITH CHECK (
    request_id IN (
      SELECT id FROM service_requests 
      WHERE customer_id = (SELECT auth.uid())
    )
  );

-- BARBER_RESPONSES Policies
CREATE POLICY "Customers can view responses to own requests"
  ON barber_responses FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM service_requests 
      WHERE customer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Barbers can view own responses"
  ON barber_responses FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Barbers can create responses"
  ON barber_responses FOR INSERT
  WITH CHECK (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Barbers can update own responses"
  ON barber_responses FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
    AND status = 'pending'
  );

-- CHAT_MESSAGES Policies
CREATE POLICY "Participants can view chat messages"
  ON chat_messages FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM service_requests WHERE customer_id = (SELECT auth.uid())
    )
    OR
    request_id IN (
      SELECT br.request_id FROM barber_responses br
      JOIN barber_profiles bp ON br.barber_id = bp.id
      WHERE bp.user_id = (SELECT auth.uid())
      AND br.status IN ('pending', 'accepted')
    )
  );

CREATE POLICY "Participants can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND (
      request_id IN (
        SELECT id FROM service_requests WHERE customer_id = (SELECT auth.uid())
      )
      OR
      request_id IN (
        SELECT br.request_id FROM barber_responses br
        JOIN barber_profiles bp ON br.barber_id = bp.id
        WHERE bp.user_id = (SELECT auth.uid())
      )
    )
  );

-- BOOKINGS Policies
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (customer_id = (SELECT auth.uid()));

CREATE POLICY "Barbers can view own bookings"
  ON bookings FOR SELECT
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Barbers can update booking status"
  ON bookings FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- REVIEWS Policies
CREATE POLICY "Public reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_public = true);

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    customer_id = (SELECT auth.uid())
    AND booking_id IN (
      SELECT id FROM bookings WHERE customer_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Barbers can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    barber_id IN (
      SELECT id FROM barber_profiles WHERE user_id = (SELECT auth.uid())
    )
  );

-- SAVED_ADDRESSES Policies
CREATE POLICY "Users can manage own saved addresses"
  ON saved_addresses FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- FAVORITE_BARBERS Policies
CREATE POLICY "Users can manage own favorites"
  ON favorite_barbers FOR ALL
  USING (customer_id = (SELECT auth.uid()))
  WITH CHECK (customer_id = (SELECT auth.uid()));

-- ============================================================================
-- SEED DATA (Services)
-- ============================================================================

INSERT INTO services (name, name_he, category, description, estimated_duration, base_price, icon, display_order) VALUES
('Classic Haircut', 'תספורת קלאסית', 'haircut', 'Traditional haircut with scissors and clippers', 30, 80, 'scissors', 1),
('Fade Haircut', 'תספורת פייד', 'haircut', 'Modern fade haircut with blended sides', 35, 90, 'scissors', 2),
('Kids Haircut', 'תספורת ילדים', 'haircut', 'Haircut for children under 12', 25, 60, 'baby', 3),
('Beard Trim', 'עיצוב זקן', 'beard', 'Professional beard shaping and trimming', 20, 50, 'user', 4),
('Full Beard Design', 'עיצוב זקן מלא', 'beard', 'Complete beard styling with hot towel', 30, 70, 'user', 5),
('Classic Shave', 'גילוח קלאסי', 'shave', 'Traditional straight razor shave', 25, 60, 'droplet', 6),
('Haircut + Beard', 'תספורת + זקן', 'combo', 'Full haircut with beard trim combo', 45, 120, 'sparkles', 7),
('VIP Package', 'חבילת VIP', 'combo', 'Haircut, beard, shave, and hot towel treatment', 60, 180, 'crown', 8),
('Hair Styling', 'עיצוב שיער', 'styling', 'Professional styling with products', 20, 40, 'wind', 9),
('Hair Coloring', 'צביעת שיער', 'coloring', 'Professional hair coloring service', 60, 150, 'palette', 10);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE barber_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE service_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE barber_profiles;
