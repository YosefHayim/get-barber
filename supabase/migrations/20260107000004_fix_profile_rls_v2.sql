-- ============================================================================
-- FIX PROFILE RLS POLICY V2
-- Version: 2.0.0
-- Description: Properly fix RLS to allow profile creation during signup
-- 
-- The issue: When a new user signs up, they have NO profile yet.
-- The RLS policy was checking if auth.uid() = id, but auth.uid() returns
-- the user's ID from the JWT token, which IS available during signup.
-- 
-- The REAL problem: The original policy used a subquery (SELECT auth.uid())
-- which may have different behavior than calling auth.uid() directly.
-- 
-- This migration ensures the INSERT policy is correct and also adds
-- a fallback mechanism using a service role function.
-- ============================================================================

-- Drop all existing insert policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a simple, working INSERT policy
-- During signup, auth.uid() should return the newly created user's ID
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also ensure the SELECT policy allows users to see their own profile
-- (This should already exist but let's make sure)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Ensure UPDATE policy is correct
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ALTERNATIVE APPROACH: Use a SECURITY DEFINER function for profile creation
-- This bypasses RLS entirely and is the most reliable approach
-- ============================================================================

-- Create a function that can be called right after signup to create profile
-- This function runs with elevated privileges (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  p_user_id UUID,
  p_display_name TEXT,
  p_phone TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL,
  p_user_type user_type DEFAULT 'customer'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, phone, avatar_url, user_type)
  VALUES (p_user_id, p_display_name, p_phone, p_avatar_url, p_user_type)
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO anon;
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO service_role;
