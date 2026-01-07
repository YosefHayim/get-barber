ALTER TABLE barber_profiles 
ADD COLUMN IF NOT EXISTS home_service_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS home_service_surcharge DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS negotiation_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_home_service BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS home_address TEXT,
ADD COLUMN IF NOT EXISTS home_location GEOGRAPHY(POINT, 4326);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS barber_live_location GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS barber_location_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_service_requests_negotiation 
ON service_requests(negotiation_expires_at) 
WHERE status = 'pending' OR status = 'negotiating';

CREATE INDEX IF NOT EXISTS idx_bookings_live_location 
ON bookings(barber_location_updated_at) 
WHERE status IN ('barber_en_route', 'arrived');
