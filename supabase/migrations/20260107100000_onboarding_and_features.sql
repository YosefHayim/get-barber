-- =====================================================
-- BARBERCONNECT FEATURE EXPANSION MIGRATION
-- Onboarding, Advertising, Loyalty, CRM, Analytics
-- =====================================================

-- =====================================================
-- 1. ONBOARDING & USER PREFERENCES
-- =====================================================

-- User preferences collected during onboarding
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Customer preferences
    preferred_services TEXT[] DEFAULT '{}',
    haircut_frequency TEXT CHECK (haircut_frequency IN ('every_2_weeks', 'monthly', 'every_6_weeks', 'occasionally')),
    preferred_time_of_day TEXT CHECK (preferred_time_of_day IN ('morning', 'afternoon', 'evening', 'flexible')),
    -- Notification preferences
    notify_booking_updates BOOLEAN DEFAULT true,
    notify_promotions BOOLEAN DEFAULT false,
    notify_new_barbers BOOLEAN DEFAULT false,
    notify_reminders BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Onboarding progress tracking
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'barber')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER NOT NULL,
    completed_steps INTEGER[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Barber professional details (extends barber_profiles)
CREATE TABLE IF NOT EXISTS barber_professional_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    years_experience TEXT CHECK (years_experience IN ('less_than_1', '1_to_3', '3_to_5', '5_to_10', 'more_than_10')),
    specialties TEXT[] DEFAULT '{}',
    certifications TEXT,
    equipment_confirmed BOOLEAN DEFAULT false,
    id_verified BOOLEAN DEFAULT false,
    id_verification_date TIMESTAMPTZ,
    instagram_handle TEXT,
    instagram_connected BOOLEAN DEFAULT false,
    max_travel_distance_km INTEGER DEFAULT 10,
    base_location_address TEXT,
    base_location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id)
);

-- Barber working hours
CREATE TABLE IF NOT EXISTS barber_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    is_available BOOLEAN DEFAULT true,
    morning_available BOOLEAN DEFAULT false,
    afternoon_available BOOLEAN DEFAULT false,
    evening_available BOOLEAN DEFAULT false,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id, day_of_week)
);

-- =====================================================
-- 2. ADVERTISING & PROMOTIONS SYSTEM
-- =====================================================

-- Ad campaign types enum
DO $$ BEGIN
    CREATE TYPE ad_campaign_type AS ENUM ('featured_placement', 'search_boost', 'area_dominance', 'push_notification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ad campaign status enum
DO $$ BEGIN
    CREATE TYPE ad_campaign_status AS ENUM ('draft', 'pending_approval', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Advertising campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    campaign_type ad_campaign_type NOT NULL,
    status ad_campaign_status DEFAULT 'draft',
    -- Budget
    daily_budget_cents INTEGER, -- in agorot/cents
    total_budget_cents INTEGER,
    spent_cents INTEGER DEFAULT 0,
    -- Targeting
    target_area_center GEOGRAPHY(POINT, 4326),
    target_area_radius_km INTEGER,
    target_neighborhoods TEXT[],
    -- Schedule
    start_date DATE,
    end_date DATE,
    -- Pricing (for featured/area dominance)
    slot_position INTEGER, -- 1, 2, 3 for featured placement
    price_per_day_cents INTEGER,
    -- Metadata
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ad impressions tracking
CREATE TABLE IF NOT EXISTS ad_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    impression_type TEXT NOT NULL CHECK (impression_type IN ('view', 'click', 'booking')),
    cost_cents INTEGER DEFAULT 0,
    location GEOGRAPHY(POINT, 4326),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Barber promotions/deals
CREATE TABLE IF NOT EXISTS barber_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    promotion_type TEXT NOT NULL CHECK (promotion_type IN ('first_time', 'referral', 'happy_hour', 'bundle', 'flash_sale', 'custom')),
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value INTEGER NOT NULL, -- percentage or cents
    min_booking_value_cents INTEGER,
    applicable_services UUID[], -- NULL means all services
    promo_code TEXT UNIQUE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Featured barber slots (for home screen carousel)
CREATE TABLE IF NOT EXISTS featured_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_position INTEGER NOT NULL CHECK (slot_position BETWEEN 1 AND 10),
    barber_id UUID REFERENCES barber_profiles(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES ad_campaigns(id) ON DELETE SET NULL,
    area_code TEXT, -- for geographic targeting
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    price_paid_cents INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(slot_position, area_code, start_time)
);

-- Barber wallet/credits for advertising
CREATE TABLE IF NOT EXISTS barber_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    balance_cents INTEGER DEFAULT 0,
    total_deposited_cents INTEGER DEFAULT 0,
    total_spent_cents INTEGER DEFAULT 0,
    auto_replenish BOOLEAN DEFAULT false,
    auto_replenish_amount_cents INTEGER,
    auto_replenish_threshold_cents INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id)
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES barber_wallets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'ad_spend', 'refund', 'bonus')),
    amount_cents INTEGER NOT NULL,
    balance_after_cents INTEGER NOT NULL,
    description TEXT,
    reference_id UUID, -- campaign_id or other reference
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. LOYALTY & REWARDS SYSTEM
-- =====================================================

-- Loyalty tier enum
DO $$ BEGIN
    CREATE TYPE loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Customer loyalty accounts
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_tier loyalty_tier DEFAULT 'bronze',
    total_points INTEGER DEFAULT 0,
    available_points INTEGER DEFAULT 0,
    lifetime_bookings INTEGER DEFAULT 0,
    lifetime_spend_cents INTEGER DEFAULT 0,
    tier_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id)
);

-- Points transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus', 'referral')),
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_type TEXT, -- 'booking', 'review', 'referral'
    reference_id UUID,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')),
    referrer_reward_points INTEGER,
    referee_reward_points INTEGER,
    referrer_rewarded_at TIMESTAMPTZ,
    referee_rewarded_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referrer_id, referee_id)
);

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- =====================================================
-- 4. CLIENT CRM FOR BARBERS
-- =====================================================

-- Client notes and preferences
CREATE TABLE IF NOT EXISTS client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notes TEXT,
    preferred_services TEXT[],
    hair_type TEXT,
    style_preferences TEXT,
    allergies_sensitivities TEXT,
    is_favorite BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    last_booking_date TIMESTAMPTZ,
    total_bookings INTEGER DEFAULT 0,
    total_spend_cents INTEGER DEFAULT 0,
    average_tip_percent NUMERIC(5,2),
    birthday DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id, customer_id)
);

-- Client tags for categorization
CREATE TABLE IF NOT EXISTS client_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#DAA520',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id, name)
);

-- Client-tag associations
CREATE TABLE IF NOT EXISTS client_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_note_id UUID NOT NULL REFERENCES client_notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES client_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(client_note_id, tag_id)
);

-- =====================================================
-- 5. ENHANCED NOTIFICATIONS
-- =====================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    title_template_he TEXT,
    body_template_he TEXT,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('booking', 'promotion', 'reminder', 'system', 'chat')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    notification_type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_pushed BOOLEAN DEFAULT false,
    pushed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 6. ANALYTICS AGGREGATES
-- =====================================================

-- Daily barber stats (for fast dashboard queries)
CREATE TABLE IF NOT EXISTS barber_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID NOT NULL REFERENCES barber_profiles(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,
    tips_cents INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    repeat_clients INTEGER DEFAULT 0,
    avg_rating NUMERIC(3,2),
    reviews_received INTEGER DEFAULT 0,
    requests_received INTEGER DEFAULT 0,
    requests_accepted INTEGER DEFAULT 0,
    online_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id, stat_date)
);

-- Service popularity stats
CREATE TABLE IF NOT EXISTS service_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID REFERENCES barber_profiles(id) ON DELETE CASCADE, -- NULL for platform-wide
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    booking_count INTEGER DEFAULT 0,
    revenue_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(barber_id, service_id, stat_date)
);

-- =====================================================
-- 7. UPDATE EXISTING TABLES
-- =====================================================

-- Add onboarding fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id);

-- Add advertising fields to barber_profiles
ALTER TABLE barber_profiles
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS search_boost_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS search_boost_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
ADD COLUMN IF NOT EXISTS profile_completeness INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_online_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS response_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS acceptance_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time_minutes INTEGER;

-- Add fields to services
ALTER TABLE services
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;

-- Add tip tracking to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS tip_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tip_percentage NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS discount_cents INTEGER DEFAULT 0;

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_barber ON ad_campaigns(barber_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_dates ON ad_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_date ON ad_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_featured_slots_time ON featured_slots(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_barber_promotions_active ON barber_promotions(barber_id, is_active);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_barber ON client_notes(barber_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_barber_daily_stats_date ON barber_daily_stats(barber_id, stat_date);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON onboarding_progress(user_id);

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_daily_stats ENABLE ROW LEVEL SECURITY;

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Onboarding progress policies
CREATE POLICY "Users can view own onboarding" ON onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON onboarding_progress
    FOR ALL USING (auth.uid() = user_id);

-- Barber professional details policies
CREATE POLICY "Barbers can manage own details" ON barber_professional_details
    FOR ALL USING (
        barber_id IN (SELECT id FROM barber_profiles WHERE user_id = auth.uid())
    );
CREATE POLICY "Anyone can view barber details" ON barber_professional_details
    FOR SELECT USING (true);

-- Ad campaigns policies
CREATE POLICY "Barbers can manage own campaigns" ON ad_campaigns
    FOR ALL USING (
        barber_id IN (SELECT id FROM barber_profiles WHERE user_id = auth.uid())
    );

-- Barber promotions policies  
CREATE POLICY "Barbers can manage own promotions" ON barber_promotions
    FOR ALL USING (
        barber_id IN (SELECT id FROM barber_profiles WHERE user_id = auth.uid())
    );
CREATE POLICY "Anyone can view active promotions" ON barber_promotions
    FOR SELECT USING (is_active = true);

-- Featured slots policies
CREATE POLICY "Anyone can view featured slots" ON featured_slots
    FOR SELECT USING (true);

-- Wallet policies
CREATE POLICY "Barbers can view own wallet" ON barber_wallets
    FOR SELECT USING (
        barber_id IN (SELECT id FROM barber_profiles WHERE user_id = auth.uid())
    );

-- Loyalty policies
CREATE POLICY "Users can view own loyalty" ON loyalty_accounts
    FOR SELECT USING (customer_id = auth.uid());

-- Client notes policies
CREATE POLICY "Barbers can manage own client notes" ON client_notes
    FOR ALL USING (
        barber_id IN (SELECT id FROM barber_profiles WHERE user_id = auth.uid())
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON user_notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON user_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to get featured barbers for home screen
CREATE OR REPLACE FUNCTION get_featured_barbers(
    p_latitude FLOAT,
    p_longitude FLOAT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    rating NUMERIC,
    total_reviews INTEGER,
    is_verified BOOLEAN,
    distance_meters FLOAT,
    price_min NUMERIC,
    price_max NUMERIC,
    is_featured BOOLEAN,
    slot_position INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_location AS (
        SELECT ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography AS geog
    )
    SELECT 
        bp.id,
        bp.user_id,
        p.display_name,
        p.avatar_url,
        bp.bio,
        bp.rating,
        bp.total_reviews,
        bp.is_verified,
        ST_Distance(bp.location, ul.geog) AS distance_meters,
        bp.price_min,
        bp.price_max,
        COALESCE(bp.is_featured, false) AS is_featured,
        fs.slot_position
    FROM barber_profiles bp
    JOIN profiles p ON p.id = bp.user_id
    CROSS JOIN user_location ul
    LEFT JOIN featured_slots fs ON fs.barber_id = bp.id 
        AND fs.start_time <= now() 
        AND fs.end_time > now()
    WHERE bp.is_available = true
        AND bp.location IS NOT NULL
    ORDER BY 
        CASE WHEN fs.slot_position IS NOT NULL THEN 0 ELSE 1 END,
        fs.slot_position NULLS LAST,
        bp.is_featured DESC,
        bp.rating DESC,
        distance_meters ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate loyalty tier
CREATE OR REPLACE FUNCTION calculate_loyalty_tier(p_lifetime_bookings INTEGER, p_lifetime_spend_cents INTEGER)
RETURNS loyalty_tier AS $$
BEGIN
    IF p_lifetime_bookings >= 50 OR p_lifetime_spend_cents >= 1000000 THEN
        RETURN 'platinum';
    ELSIF p_lifetime_bookings >= 25 OR p_lifetime_spend_cents >= 500000 THEN
        RETURN 'gold';
    ELSIF p_lifetime_bookings >= 10 OR p_lifetime_spend_cents >= 200000 THEN
        RETURN 'silver';
    ELSE
        RETURN 'bronze';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to award loyalty points
CREATE OR REPLACE FUNCTION award_loyalty_points(
    p_customer_id UUID,
    p_points INTEGER,
    p_transaction_type TEXT,
    p_description TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_account_id UUID;
    v_new_balance INTEGER;
    v_new_total INTEGER;
BEGIN
    -- Get or create loyalty account
    INSERT INTO loyalty_accounts (customer_id)
    VALUES (p_customer_id)
    ON CONFLICT (customer_id) DO NOTHING;
    
    SELECT id, available_points + p_points, total_points + p_points
    INTO v_account_id, v_new_balance, v_new_total
    FROM loyalty_accounts
    WHERE customer_id = p_customer_id;
    
    -- Update account
    UPDATE loyalty_accounts
    SET 
        available_points = v_new_balance,
        total_points = v_new_total,
        current_tier = calculate_loyalty_tier(lifetime_bookings, lifetime_spend_cents),
        updated_at = now()
    WHERE id = v_account_id;
    
    -- Record transaction
    INSERT INTO loyalty_transactions (
        account_id, transaction_type, points, balance_after, 
        description, reference_type, reference_id
    )
    VALUES (
        v_account_id, p_transaction_type, p_points, v_new_balance,
        p_description, p_reference_type, p_reference_id
    );
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO notification_templates (template_key, title_template, body_template, title_template_he, body_template_he, notification_type) VALUES
('booking_confirmed', 'Booking Confirmed!', 'Your appointment with {{barber_name}} is confirmed for {{date}} at {{time}}.', 'ההזמנה אושרה!', 'הפגישה שלך עם {{barber_name}} אושרה לתאריך {{date}} בשעה {{time}}.', 'booking'),
('barber_on_way', '{{barber_name}} is on the way!', 'Your barber will arrive in approximately {{eta}} minutes.', '{{barber_name}} בדרך אליך!', 'הספר שלך יגיע בעוד כ-{{eta}} דקות.', 'booking'),
('barber_arrived', 'Your barber has arrived', '{{barber_name}} has arrived at your location.', 'הספר שלך הגיע', '{{barber_name}} הגיע למיקום שלך.', 'booking'),
('service_completed', 'How was your haircut?', 'Rate your experience with {{barber_name}} and help others find great barbers.', 'איך הייתה התספורת?', 'דרג את החוויה שלך עם {{barber_name}} ועזור לאחרים למצוא ספרים מעולים.', 'booking'),
('new_request', 'New service request!', '{{customer_name}} is looking for a barber nearby. Tap to respond.', 'בקשה חדשה!', '{{customer_name}} מחפש ספר בקרבת מקום. לחץ להגיב.', 'booking'),
('promo_available', 'Special offer for you!', '{{promo_title}} - {{promo_description}}', 'הצעה מיוחדת עבורך!', '{{promo_title}} - {{promo_description}}', 'promotion'),
('haircut_reminder', 'Time for a fresh cut?', 'It''s been {{days}} days since your last haircut. Book your next appointment!', 'הגיע הזמן לתספורת?', 'עברו {{days}} ימים מאז התספורת האחרונה שלך. קבע את הפגישה הבאה!', 'reminder')
ON CONFLICT (template_key) DO NOTHING;
