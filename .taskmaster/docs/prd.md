# BarberConnect - Product Requirements Document

## Executive Summary

BarberConnect is a premium on-demand mobile barber service platform for the Israeli market, operating similarly to Uber/Gett but for barbering services. The platform connects customers with professional barbers who come to their location.

**Current State**: MVP with basic map, booking flow, chat/negotiation, customer and barber modes.

**Vision**: Create an extraordinary platform where customers effortlessly find premium barbers, and barbers grow their businesses with powerful tools including paid promotions/advertisements.

---

## User Types

### 1. Customers
People who need barber services at their location.

### 2. Barbers (Business Owners)
Professional barbers offering mobile services who want to:
- Accept/manage bookings
- Grow their client base
- Access business analytics
- Promote their services through paid advertisements

---

## PHASE 1: Onboarding System

### 1.1 Customer Onboarding Flow

**Goal**: Collect user preferences to personalize experience and gain insights for analytics.

#### Step 1: Welcome & Value Proposition (1 screen)
- Premium animated splash with brand identity
- "Get a professional barber at your doorstep"
- Continue button

#### Step 2: User Type Selection (1 screen)
- "I need a barber" (Customer)
- "I am a barber" (Business)
- Clear visual distinction with icons

#### Step 3: Basic Profile (1 screen)
- Full Name (required)
- Phone Number with Israeli format (+972) (required)
- Profile Photo (optional, camera/gallery)
- Progress indicator (Step 1/4)

#### Step 4: Location Setup (1 screen)
- Request location permission with clear explanation
- Add home address (optional)
- Add work address (optional)
- "These help us find barbers faster"
- Progress indicator (Step 2/4)

#### Step 5: Preferences (1 screen)
- **Preferred Services** (multi-select chips):
  - Haircut, Beard Trim, Hot Towel Shave, Fade, Coloring, Kids Cut
- **How often do you get a haircut?**
  - Every 2 weeks, Monthly, Every 6 weeks, Occasionally
- **Preferred time of day**
  - Morning, Afternoon, Evening, Flexible
- Progress indicator (Step 3/4)

#### Step 6: Notification Preferences (1 screen)
- Enable push notifications (with benefits explanation)
- Notification preferences:
  - Booking updates (recommended)
  - Promotions & deals
  - New barbers in your area
- Progress indicator (Step 4/4)

#### Step 7: Completion (1 screen)
- Success animation
- "You're all set!"
- Option to browse featured barbers or go to map
- First-time user discount code display (if applicable)

### 1.2 Barber/Business Onboarding Flow

**Goal**: Collect business information, verify identity, and set up for success.

#### Step 1: Welcome for Pros (1 screen)
- "Grow your barbering business"
- Key benefits: More clients, Flexible schedule, Easy payments, Business tools
- Continue button

#### Step 2: Business Profile (1 screen)
- Business/Display Name (required)
- Phone Number (required)
- Profile Photo (required - professional)
- Progress indicator (Step 1/6)

#### Step 3: Professional Background (1 screen)
- Years of Experience (dropdown: <1, 1-3, 3-5, 5-10, 10+)
- Specialties (multi-select):
  - Classic Cuts, Fades, Beard Styling, Hot Towel Shave, Hair Design, Kids Haircuts, Coloring
- Certifications/Training (optional text)
- Progress indicator (Step 2/6)

#### Step 4: Services & Pricing (1 screen)
- Select services you offer (from predefined list)
- Set your price range (min-max)
- Average service duration
- Progress indicator (Step 3/6)

#### Step 5: Work Preferences (1 screen)
- **Working Hours**:
  - Days available (checkboxes)
  - Time slots (Morning/Afternoon/Evening for each day)
- **Service Area**:
  - Base location (address)
  - Maximum travel distance (km slider: 5-50)
- Progress indicator (Step 4/6)

#### Step 6: Portfolio Setup (1 screen)
- Upload work photos (minimum 3, maximum 10)
- Tips for good portfolio photos
- Instagram connection (optional)
- Progress indicator (Step 5/6)

#### Step 7: Verification & Equipment (1 screen)
- Government ID upload (required for verification badge)
- Equipment checklist confirmation:
  - Professional clippers
  - Portable chair/cape
  - Sanitization supplies
- Terms of service agreement
- Progress indicator (Step 6/6)

#### Step 8: Completion & Next Steps (1 screen)
- Success animation
- "Your profile is under review" (if verification needed)
- OR "You're ready to start!" (if auto-approved)
- Tips for getting first bookings
- Go to Dashboard button

---

## PHASE 2: Enhanced Customer Experience

### 2.1 Smart Home Screen (Replace basic map)

#### Featured Barbers Carousel
- **Premium Sponsored Slots** (paid placement - top 3)
  - Highlighted with "Featured" badge
  - Higher visibility
  - Barbers pay for these positions
- Top-rated barbers nearby
- "New in your area" section
- Quick filter pills: Available Now, Top Rated, Best Price

#### Recent/Favorites Section
- Last 3 barbers used
- Favorited barbers quick access
- "Book Again" one-tap action

#### Personalized Recommendations
- Based on onboarding preferences
- "Recommended for you" section
- Machine learning suggestions (future)

### 2.2 Advanced Search & Filters

#### Search Bar
- Search by barber name
- Search by specialty
- Search by location/area

#### Filter Options
- Price range slider
- Rating minimum (4+, 4.5+ stars)
- Distance (1km, 5km, 10km, 15km+)
- Availability (Now, Today, This week)
- Services offered
- Experience level
- Verified only toggle
- **Sort by**: Distance, Rating, Price (Low-High), Price (High-Low), Most Booked

### 2.3 Barber Profile Enhancement

#### Profile Sections
- Hero image/cover photo
- Profile photo with verification badge
- Rating & review summary
- Bio/About section
- **Portfolio Gallery** (swipeable images)
- Services list with prices
- Availability calendar preview
- Reviews section with filter (Most Recent, Highest, Lowest)
- Location/service area map

#### Social Proof
- "Booked X times this month"
- "Usually responds in X minutes"
- Customer testimonials highlights
- Instagram feed integration (if connected)

### 2.4 Booking Flow Enhancement

#### Service Selection
- Visual service cards with icons
- Package deals/combos with savings indicator
- Estimated duration for each service
- Running total display

#### Scheduling
- Calendar view for future bookings
- Time slot selection with availability
- "ASAP" option for immediate requests
- Buffer time options (arrive in 30min, 1hr, etc.)

#### Address & Notes
- Saved addresses quick-select
- Map picker for custom location
- Special instructions field
- Parking/access notes

#### Price Negotiation Enhancement
- Show barber's typical price range
- Suggest fair price based on services
- Counter-offer with preset amounts
- Final price confirmation

### 2.5 Customer Loyalty & Rewards

#### Points System
- Earn points per booking
- Bonus points for reviews
- Bonus for referrals

#### Rewards Tiers
- Bronze, Silver, Gold tiers
- Tier benefits (discounts, priority booking)
- Progress visualization

#### Referral Program
- Unique referral code
- Reward for both referrer and referee
- Track referrals in profile

---

## PHASE 3: Enhanced Barber/Business Experience

### 3.1 Advanced Dashboard

#### Live Status Widget
- Online/Offline toggle (prominent)
- Current earnings today (real-time)
- Active bookings count
- Pending requests badge

#### Performance Metrics
- Today's earnings vs goal
- Week/Month comparisons
- Acceptance rate
- Response time average
- Customer satisfaction score

#### Quick Stats Cards
- Total bookings this period
- Average booking value
- Repeat customer rate
- Tips earned

### 3.2 Request Management

#### Smart Request Queue
- Priority sorting (new, high-value, repeat customers)
- Countdown timers for expiring requests
- Customer rating preview
- Distance and travel time estimate
- Price suggestion based on services

#### Batch Actions
- Accept multiple requests
- Set auto-decline rules (too far, wrong services)
- Quick responses ("On my way", "Need 15 more min")

### 3.3 Client Management (CRM)

#### Client List
- All past customers
- Search and filter
- Customer notes (preferences, tips)
- Booking history per client
- Favorite clients marking

#### Client Insights
- Booking frequency per client
- Average spend per client
- Services they typically request
- Last booking date

#### Re-engagement Tools
- "Haven't seen in 30 days" list
- Send promotions to specific clients
- Birthday/special occasion reminders

### 3.4 Business Analytics

#### Revenue Dashboard
- Daily/Weekly/Monthly/Yearly views
- Revenue breakdown by service
- Revenue by day of week
- Revenue by time of day
- Trend graphs

#### Performance Analytics
- Busiest times heatmap
- Most requested services
- Average rating trend
- Review sentiment analysis

#### Growth Insights
- New vs returning customers
- Customer acquisition sources
- Geographic spread of clients

### 3.5 Portfolio & Gallery Management

#### Photo Management
- Upload/organize work photos
- Tag by service type
- Set featured images
- Before/after comparisons

#### Video Support (Future)
- Short transformation videos
- Technique showcases

---

## PHASE 4: Commercial & Advertising System

### 4.1 Barber Advertising Platform

#### Ad Types

##### 1. Featured Placement (Premium Visibility)
- **Home Screen Featured Carousel**
  - Top 3 positions in customer home screen
  - 24-hour slots or weekly packages
  - Pricing: Pay per day or weekly bundle
  - ROI tracking (impressions, clicks, bookings)

##### 2. Search Boost
- **Priority in Search Results**
  - Appear above organic results
  - "Promoted" label (subtle, transparent)
  - Pay per impression or pay per click

##### 3. Area Dominance
- **Geographic Targeting**
  - "Top Barber in [Neighborhood]" badge
  - Exclusive for one barber per area
  - Weekly/monthly packages
  - Higher pricing for dense areas

##### 4. Push Notification Ads (Opt-in customers only)
- "Featured barber near you" notifications
- Limited to X per week to avoid spam
- Higher conversion, premium pricing

### 4.2 Promotion Tools (Free & Paid)

#### Free Promotions
- First-time customer discount
- Refer a friend discount
- Happy hour pricing
- Bundle deals

#### Paid Promotions
- Broadcast promotion to nearby customers
- Limited-time flash sales with push notification
- Targeted promotions (specific neighborhoods)

### 4.3 Advertising Dashboard

#### Campaign Management
- Create new campaigns
- Set budget (daily/total)
- Choose ad type
- Target audience/area
- Schedule (start/end dates)

#### Campaign Analytics
- Impressions served
- Click-through rate
- Bookings attributed
- Cost per booking
- ROI calculator

#### Budget & Billing
- Wallet/credits system
- Auto-replenish option
- Invoice history
- Spending limits

### 4.4 Ranking Algorithm Factors

#### Organic Ranking (No Payment)
1. Rating score (weighted)
2. Number of reviews
3. Response rate
4. Acceptance rate
5. Distance from customer
6. Recent activity
7. Profile completeness
8. Verification status

#### Boosted Ranking (With Payment)
1. Active "Search Boost" campaign
2. "Featured" placement purchase
3. "Area Dominance" package
4. Organic factors (as tiebreaker)

**Transparency**: Paid placements clearly marked with subtle "Featured" or "Ad" label

---

## PHASE 5: Communication & Notifications

### 5.1 Smart Notifications

#### Customer Notifications
- Booking confirmations
- Barber on the way (with ETA)
- Barber arrived
- Service completed - leave review prompt
- Promotional offers (opt-in)
- Reminder for regular haircut

#### Barber Notifications
- New request (urgent)
- Booking confirmed
- Customer message
- Review received
- Earnings milestone
- Promotion performance

### 5.2 In-App Messaging

#### Enhanced Chat
- Quick reply templates
- Image sharing
- Location sharing
- Voice messages (future)
- Read receipts
- Typing indicators

---

## PHASE 6: Reviews & Ratings

### 6.1 Review System

#### Customer Review Flow
- 5-star rating (required)
- Optional written review
- Service tags (Quick, Professional, Friendly, etc.)
- Photo upload option
- Anonymous option

#### Barber Response
- Reply to reviews
- Flag inappropriate reviews
- Thank customers

### 6.2 Rating Display
- Overall rating
- Rating breakdown (5-star, 4-star, etc.)
- Recent reviews highlighted
- Verified booking badge on reviews

---

## PHASE 7: Payments & Pricing

### 7.1 Payment Methods

#### Customer Payment
- Credit/Debit cards (Stripe)
- Apple Pay / Google Pay
- Cash (with barber confirmation)
- Bit / PayBox integration (Israel-specific)

#### Split Payment
- Multiple payment methods for single booking

### 7.2 Barber Payouts

#### Payout Options
- Bank transfer
- Instant payout (small fee)
- PayPal

#### Payout Schedule
- Weekly automatic
- On-demand (instant)

### 7.3 Tipping

#### Customer Tipping
- Post-service tip prompt
- Preset amounts (10%, 15%, 20%, custom)
- Cash tip tracking

---

## PHASE 8: Safety & Trust

### 8.1 Verification

#### Barber Verification
- ID verification
- Background check (optional premium)
- Certification verification
- Verification badge display

#### Customer Verification
- Phone verification (SMS)
- Email verification
- Profile completeness

### 8.2 Safety Features

#### Emergency Contact
- Set emergency contact
- Discreet SOS button

#### Trip Tracking
- Share booking with friend/family
- Real-time location during service (opt-in)

### 8.3 Insurance (Future)
- Service guarantee
- Damage coverage

---

## PHASE 9: Localization & Cultural Features

### 9.1 Israeli Market Specifics

#### Shabbat Mode
- Auto-offline during Shabbat (optional)
- Pre-Shabbat reminder for bookings
- Havdalah availability resume

#### Hebrew Support
- Full RTL layout
- Hebrew content
- Language toggle (Hebrew/English/Russian/Arabic)

#### Local Payments
- Bit integration
- PayBox integration
- Israeli bank transfers

### 9.2 Holiday Awareness
- Jewish holiday notifications
- Special holiday promotions
- Busy period warnings (pre-holiday rush)

---

## PHASE 10: Admin & Operations

### 10.1 Admin Dashboard (Web)

#### User Management
- View/edit users
- Suspend/ban users
- Verify barbers
- Handle disputes

#### Analytics
- Platform-wide metrics
- Revenue tracking
- User growth
- Geographic distribution

#### Content Management
- Services catalog
- Pricing guidelines
- Promotional banners
- Terms & conditions

### 10.2 Support System

#### Customer Support
- In-app chat support
- FAQ section
- Report issues
- Dispute resolution

---

## Technical Requirements

### Performance
- App launch under 2 seconds
- Map loading under 1 second
- Real-time updates (< 500ms latency)
- Offline mode for viewing saved info

### Security
- End-to-end encryption for messages
- Secure payment handling (PCI compliant)
- Data encryption at rest
- GDPR/Israeli privacy law compliance

### Infrastructure
- Supabase backend (existing)
- React Native + Expo (existing)
- Push notifications (Expo, Firebase)
- Real-time subscriptions (Supabase)
- Image CDN for portfolio photos
- Analytics integration

---

## Success Metrics

### Customer Metrics
- DAU/MAU ratio
- Booking completion rate
- Average booking frequency
- Customer lifetime value
- NPS score

### Barber Metrics
- Active barbers (weekly)
- Average bookings per barber
- Barber retention rate
- Average earnings per barber
- Ad spend per barber

### Platform Metrics
- Total bookings
- Gross merchandise value (GMV)
- Platform revenue (commissions + ads)
- Customer acquisition cost
- Market penetration (by city)

---

## Implementation Priority

### Immediate (This Sprint)
1. Customer onboarding flow
2. Barber onboarding flow
3. Featured barbers carousel (basic)
4. Enhanced barber profile

### Short Term (Next 2 Sprints)
5. Advanced search & filters
6. Client CRM for barbers
7. Business analytics dashboard
8. Basic advertising system (featured placement)

### Medium Term (Next Quarter)
9. Loyalty & rewards program
10. Full advertising platform
11. Enhanced notifications
12. Payment enhancements

### Long Term (Future)
13. Insurance/guarantees
14. Video portfolio
15. AI recommendations
16. Multi-city expansion

---

## Database Schema Additions Needed

### New Tables
- `user_preferences` (onboarding data)
- `onboarding_progress` (step tracking)
- `promotions` (barber promotions/deals)
- `ad_campaigns` (advertising)
- `ad_impressions` (tracking)
- `loyalty_points` (customer rewards)
- `referrals` (referral tracking)
- `client_notes` (barber CRM)
- `saved_addresses` (enhanced - exists)
- `notifications_preferences` (exists - enhance)

### Schema Modifications
- `profiles`: Add onboarding_completed, preferences_json
- `barber_profiles`: Add featured_until, search_boost_active, subscription_tier
- `services`: Add icon, category, is_popular
