# BarberConnect Wolt-Style UI/UX Redesign PRD

## Overview
Complete UI/UX redesign of BarberConnect to follow a Wolt-style map-centric interface with premium barber aesthetics. This redesign transforms the app from a list-based interface to a map-first experience with rich barber profiles, real-time negotiation, and VIP home service options.

## Tech Stack (Existing)
- React Native + Expo SDK 52
- Expo Router v4
- NativeWind (Tailwind CSS)
- TanStack Query v5
- Zustand v5
- Supabase (Auth + Database + Realtime)
- react-native-maps
- @gorhom/bottom-sheet
- react-native-reanimated
- @shopify/flash-list

---

## Part 1: New Color Scheme - "Classic Barbershop"

### Primary Colors
Replace current gold/burgundy with sophisticated barber-inspired palette:

| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | `#1B2838` | Primary buttons, headers, navigation bars |
| `navyLight` | `#2C3E50` | Secondary buttons, hover states |
| `navyDark` | `#0F1C24` | Dark mode surfaces |
| `copper` | `#B87333` | Accents, CTAs, highlights, links |
| `copperLight` | `#D4956A` | Light accents, badges |
| `copperDark` | `#8B5A2B` | Pressed states |
| `brass` | `#C9A959` | Premium/VIP badges, gold accents |

### Neutral Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#F5F0E6` | Card backgrounds, soft surfaces |
| `offWhite` | `#FAFAF8` | Main app background |
| `surface` | `#FFFFFF` | Cards, modals, sheets |
| `charcoal` | `#1A1A1A` | Primary text |
| `slate` | `#64748B` | Secondary text, captions |
| `muted` | `#94A3B8` | Placeholder text, disabled |

### Status Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `success` | `#2E5A3C` | Success, online, available |
| `successLight` | `#D1E7DD` | Success backgrounds |
| `warning` | `#B8860B` | Warning, pending |
| `warningLight` | `#FFF3CD` | Warning backgrounds |
| `error` | `#8B2942` | Error, offline, urgent |
| `errorLight` | `#F8D7DA` | Error backgrounds |
| `info` | `#4A6FA5` | Info, links |
| `infoLight` | `#CFE2FF` | Info backgrounds |

### Implementation
**File:** `src/constants/theme.ts`

---

## Part 2: Map-Centric Dashboard

### Requirements
Transform the home screen from a list view to a full-screen interactive map.

### UI Components

#### 2.1 Full-Screen Map
- Google Maps as the primary view
- User location centered on load
- Custom map style matching app theme (warm tones)
- Smooth animations when panning/zooming

#### 2.2 Floating Search Bar
**Position:** Top of screen with safe area padding
**Features:**
- Search icon on left
- Placeholder: "Search barbers, services..."
- Tap opens search modal
- Subtle shadow and blur background

#### 2.3 Filter Chips
**Position:** Below search bar, horizontally scrollable
**Options:**
- "Available Now" (green dot indicator)
- "Top Rated" (star icon)
- "Nearby" (location icon)
- "Home Service" (house icon)
- "Best Price" (tag icon)
**Behavior:** Toggle on/off, multiple selection allowed

#### 2.4 Custom Barber Markers
**Design:**
- Circular avatar (40x40px)
- White border (3px)
- Online indicator (green dot, bottom-right)
- Rating badge (small pill above marker)
- Pulse animation when available
- Scale animation on tap

**States:**
- Available: Green glow, pulse animation
- Busy: Orange border
- Offline: Grayscale, no glow

#### 2.5 Map Bottom Sheet
**Position:** Bottom of screen, draggable
**Snap Points:** 15% (collapsed), 50% (partial), 90% (expanded)
**Content:**
- Handle indicator at top
- "X barbers nearby" header
- Horizontally scrollable barber cards (collapsed view)
- Vertical list of barber cards (expanded view)
- Pull up to see full list

#### 2.6 Location Button
**Position:** Right side, above bottom sheet
**Action:** Re-center map on user location

### Implementation
**File:** `app/(tabs)/index.tsx` - Complete redesign

---

## Part 3: Barber Popup Dialog (5 Tabs)

### Trigger
When user taps a barber marker on the map

### UI Structure
Bottom sheet modal with:
- Sticky header with barber photo/name
- Tab bar with 5 tabs
- Scrollable content area
- Fixed action buttons at bottom

### Tab 1: Overview
**Content:**
- Large profile photo (80x80)
- Display name with verified badge
- Star rating (4.8) with review count "(124 reviews)"
- Distance: "1.2 km away"
- Availability status:
  - "Available Now" (green badge)
  - "Next available: 2:30 PM" (orange badge)
- Price range: "₪60 - ₪150"
- Brief bio (2-3 lines, expandable)

**Quick Actions:**
- "Book Now" button (primary, copper)
- "Chat" button (outline)
- Heart icon (favorite toggle)
- Share icon

### Tab 2: Services & Pricing
**Content:**
- Service categories with expandable sections
- Each service shows:
  - Service name
  - Duration (e.g., "30 min")
  - Price (e.g., "₪80")
  - Checkbox for selection
- Running total at bottom
- "VIP Home Service" toggle with surcharge display

### Tab 3: Portfolio
**Content:**
- Masonry grid of photos/videos
- Tap to view full screen
- Categories: "Haircuts", "Beards", "Styling"
- Before/After comparisons

### Tab 4: Reviews
**Content:**
- Overall rating (large number)
- Rating breakdown bar chart (5★ to 1★)
- Review cards:
  - Customer avatar and name
  - Date
  - Star rating
  - Comment text
  - Photo attachments (if any)
- "See all reviews" link

### Tab 5: Location & Social
**Content:**
- Mini map showing barbershop location
- Address text (tappable for directions)
- Distance and ETA:
  - Walking: "12 min walk"
  - Driving: "5 min drive"
- "Get Directions" button (opens Maps app)
- Social media links:
  - Instagram icon + handle
  - TikTok icon + handle
  - Facebook icon
  - WhatsApp Business

### Implementation
**Files:**
- `app/(modals)/barber-detail/[id].tsx` - Redesign
- `src/features/barber/components/BarberProfileTabs.tsx` - New
- `src/features/barber/components/OverviewTab.tsx` - New
- `src/features/barber/components/ServicesTab.tsx` - New
- `src/features/barber/components/PortfolioTab.tsx` - New
- `src/features/barber/components/ReviewsTab.tsx` - New
- `src/features/barber/components/LocationTab.tsx` - New

---

## Part 4: Booking Request Flow

### Screen: Booking Request
**File:** `app/(modals)/booking-request.tsx`

### UI Sections

#### 4.1 Barber Summary Card
- Small avatar, name, rating
- "Change" link to go back

#### 4.2 Selected Services
- List of selected services with prices
- Edit link to modify selection
- Subtotal

#### 4.3 Service Location
**Toggle Options:**
- "At Barbershop" (default)
  - Shows barbershop address
  - Shows distance/ETA
- "Home Service (VIP)"
  - Address input field
  - "Use current location" button
  - Surcharge display (e.g., "+₪50")
  - Premium badge

#### 4.4 Date & Time
**Options:**
- "ASAP" (default, highlighted)
- "Schedule for later"
  - Date picker
  - Time slot picker (barber's available slots)

#### 4.5 Notes
- Optional text input
- Placeholder: "Any special requests?"

#### 4.6 Price Breakdown
- Services subtotal
- Home service surcharge (if applicable)
- Total
- Deposit info: "10% deposit (₪X) required on acceptance"

#### 4.7 Action Button
- "Send Request" (primary button)
- Disclaimer: "Barber has 15 minutes to respond"

---

## Part 5: 15-Minute Negotiation System

### Screen: Negotiation
**File:** `app/(modals)/negotiation/[requestId].tsx`

### UI Components

#### 5.1 Header
- Barber avatar and name
- Request status badge
- Close/Cancel button

#### 5.2 Countdown Timer
**Design:**
- Circular progress indicator
- Large time display: "14:32"
- Color changes:
  - Green: > 5 minutes
  - Orange: 2-5 minutes
  - Red: < 2 minutes (pulsing)
- Text below: "Waiting for response..."

#### 5.3 Request Summary Card
- Services requested
- Location type
- Proposed price
- Date/time

#### 5.4 Chat Area
**Messages:**
- User messages (right, navy background)
- Barber messages (left, cream background)
- System messages (center, gray)
- Price offer bubbles (special styling):
  - Amount prominently displayed
  - "Accept" / "Counter" buttons
  - Status: Pending/Accepted/Declined

#### 5.5 Chat Input
- Text input field
- Send button
- "Make Offer" button (opens price input)

#### 5.6 Action Buttons (for barber)
- "Accept" (green)
- "Decline" (red outline)
- "Counter Offer" (opens price input)

### States
1. **Pending** - Waiting for barber response
2. **Negotiating** - Back and forth offers
3. **Accepted** - Request accepted, proceed to payment
4. **Declined** - Barber declined
5. **Expired** - 15 minutes passed, no response

### Implementation
**Files:**
- `app/(modals)/negotiation/[requestId].tsx` - New
- `src/features/booking/components/NegotiationTimer.tsx` - New
- `src/features/booking/components/PriceOfferBubble.tsx` - New
- `src/features/booking/hooks/useNegotiation.ts` - New

---

## Part 6: Payment Flow

### Screen: Payment Confirmation
**File:** `app/(modals)/payment/[bookingId].tsx`

### UI Sections

#### 6.1 Success Header
- Checkmark animation
- "Booking Confirmed!"
- Booking reference number

#### 6.2 Booking Summary
- Barber info
- Services
- Date/time
- Location

#### 6.3 Payment Breakdown
- Services total: ₪120
- Home service: +₪50
- **Total: ₪170**
- Deposit (10%): ₪17
- Due on arrival: ₪153

#### 6.4 Payment Method
- Saved cards list
- "Add new card" option
- Apple Pay / Google Pay buttons

#### 6.5 Action Button
- "Pay Deposit (₪17)"
- Loading state during processing
- Success → Navigate to booking tracker

### Implementation
**Files:**
- `app/(modals)/payment/[bookingId].tsx` - New
- `src/features/booking/components/PaymentBreakdown.tsx` - New
- `src/features/booking/components/PaymentMethodSelector.tsx` - New

---

## Part 7: Live Booking Tracker

### Screen: Booking Tracker
**File:** `app/(modals)/booking-tracker/[id].tsx`

### UI Components

#### 7.1 Map View
- Full screen map
- User location marker
- Barber location marker (live updating)
- Route polyline
- ETA display

#### 7.2 Status Steps
**Progress indicator showing:**
1. ✓ Request Accepted
2. ● Barber En Route (current)
3. ○ Barber Arrived
4. ○ Service In Progress
5. ○ Complete

#### 7.3 Barber Card
- Avatar, name, rating
- ETA: "Arriving in 8 min"
- Vehicle info (if applicable)
- "Call" and "Chat" buttons

#### 7.4 Booking Details (collapsible)
- Services
- Price
- Address

### Implementation
**Files:**
- `app/(modals)/booking-tracker/[id].tsx` - New
- `src/features/booking/components/BookingTracker.tsx` - New
- `src/features/booking/components/StatusStepper.tsx` - New
- `src/features/booking/hooks/useBarberLocation.ts` - New

---

## Part 8: Database Schema Updates

### Migration: Add Home Service Fields
```sql
-- barber_profiles additions
ALTER TABLE barber_profiles 
ADD COLUMN home_service_available BOOLEAN DEFAULT false,
ADD COLUMN home_service_surcharge DECIMAL(10,2) DEFAULT 0,
ADD COLUMN instagram_url TEXT,
ADD COLUMN tiktok_url TEXT,
ADD COLUMN facebook_url TEXT,
ADD COLUMN whatsapp_number TEXT;

-- service_requests additions
ALTER TABLE service_requests 
ADD COLUMN negotiation_expires_at TIMESTAMPTZ,
ADD COLUMN is_home_service BOOLEAN DEFAULT false,
ADD COLUMN home_address TEXT,
ADD COLUMN home_location GEOGRAPHY(POINT, 4326);

-- bookings additions
ALTER TABLE bookings 
ADD COLUMN deposit_amount DECIMAL(10,2),
ADD COLUMN deposit_paid_at TIMESTAMPTZ,
ADD COLUMN remaining_amount DECIMAL(10,2),
ADD COLUMN barber_live_location GEOGRAPHY(POINT, 4326),
ADD COLUMN barber_location_updated_at TIMESTAMPTZ;
```

---

## Part 9: New Components Summary

### UI Components
| Component | File | Description |
|-----------|------|-------------|
| `FilterChips` | `src/features/map/components/FilterChips.tsx` | Horizontal scrollable filter pills |
| `BarberMarker` | `src/features/map/components/BarberMarker.tsx` | Custom map marker with avatar |
| `MapBottomSheet` | `src/features/map/components/MapBottomSheet.tsx` | Pull-up barber list |
| `BarberProfileTabs` | `src/features/barber/components/BarberProfileTabs.tsx` | Tab navigation for profile |
| `PortfolioGallery` | `src/features/barber/components/PortfolioGallery.tsx` | Photo/video grid |
| `NegotiationTimer` | `src/features/booking/components/NegotiationTimer.tsx` | Circular countdown |
| `PriceOfferBubble` | `src/features/booking/components/PriceOfferBubble.tsx` | Price offer in chat |
| `PaymentBreakdown` | `src/features/booking/components/PaymentBreakdown.tsx` | Price summary |
| `BookingTracker` | `src/features/booking/components/BookingTracker.tsx` | Live tracking map |
| `StatusStepper` | `src/features/booking/components/StatusStepper.tsx` | Progress steps |
| `TabBar` | `src/components/ui/TabBar.tsx` | Reusable tab component |
| `CountdownTimer` | `src/components/ui/CountdownTimer.tsx` | Circular timer |

### Screens
| Screen | File | Description |
|--------|------|-------------|
| Map Home | `app/(tabs)/index.tsx` | Full redesign |
| Barber Detail | `app/(modals)/barber-detail/[id].tsx` | Tabbed redesign |
| Booking Request | `app/(modals)/booking-request.tsx` | New |
| Negotiation | `app/(modals)/negotiation/[requestId].tsx` | New |
| Payment | `app/(modals)/payment/[bookingId].tsx` | New |
| Booking Tracker | `app/(modals)/booking-tracker/[id].tsx` | New |

---

## Part 10: Implementation Priority

### Phase 1: Foundation (Theme + Map)
1. Update theme.ts with new colors
2. Update mockData with new fields
3. Redesign map home screen
4. Create BarberMarker component
5. Create MapBottomSheet
6. Create FilterChips

### Phase 2: Barber Profile
1. Create BarberProfileTabs
2. Create all 5 tab components
3. Redesign barber-detail modal
4. Add social media links

### Phase 3: Booking Flow
1. Create booking-request screen
2. Create PaymentBreakdown component
3. Add home service selection

### Phase 4: Negotiation
1. Add database migration
2. Create NegotiationTimer
3. Create PriceOfferBubble
4. Create negotiation screen
5. Add Supabase realtime subscriptions

### Phase 5: Payment
1. Create payment screen
2. Integrate Stripe (or other gateway)
3. Handle deposit flow

### Phase 6: Live Tracking
1. Create BookingTracker
2. Create StatusStepper
3. Create booking-tracker screen
4. Add location updates

---

## Implementation Notes

1. **MUST use new color scheme** from updated theme.ts
2. **MUST follow existing code patterns** in the codebase
3. **Use TypeScript** with proper types - no `any`
4. **Use react-native-reanimated** for all animations
5. **Use @gorhom/bottom-sheet** for all sheets
6. **Export all components** from barrel files
7. **Add JSDoc comments** for complex props
8. **Handle loading/error states** consistently
9. **Support RTL** for Hebrew text
10. **Test on both iOS and Android**
