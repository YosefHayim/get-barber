# BarberConnect UI/UX Enhancements PRD

## Overview
Premium on-demand barber service mobile app for the Israel market. This PRD covers OAuth authentication, consistent UI components, debounced search, and Google Maps enhancements.

## Tech Stack
- React Native + Expo SDK 52
- Expo Router v4
- NativeWind (Tailwind CSS)
- TanStack Query v5
- Zustand v5
- Supabase (Auth + Database)
- react-native-paper (existing)
- lucide-react-native (icons)
- react-native-reanimated (animations)
- react-native-maps (maps)

## Design System (EXISTING - MUST FOLLOW)
Located at: `src/constants/theme.ts`

### Colors
- Gold: #DAA520 (primary accent)
- Gold Dark: #B8860B (buttons)
- Burgundy: #722F37 (logo, accents)
- Background: #FAF9F6
- Surface: #FFFFFF
- Text Primary: #1A1A1A
- Text Muted: #6B7280

### Typography
- xs: 11, sm: 13, base: 15, md: 16, lg: 18, xl: 20, 2xl: 24, 3xl: 28, 4xl: 32

### Spacing
- sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24, 3xl: 32

### Border Radius
- sm: 8, md: 12, lg: 16, xl: 20, 2xl: 24

---

## Feature 1: OAuth Authentication

### 1.1 Google Sign-In
**File:** `src/features/auth/components/SocialAuthButtons.tsx`

Requirements:
- Google logo button with "Continue with Google" text
- Use expo-auth-session for OAuth flow
- Integrate with Supabase OAuth
- Show loading state during authentication
- Handle errors gracefully with toast

### 1.2 Phone Number Authentication (OTP)
**Files:**
- `src/features/auth/components/PhoneAuthInput.tsx`
- `src/features/auth/components/OTPInput.tsx`
- `app/(auth)/phone-login.tsx`

Requirements:
- Israeli phone number input with +972 prefix
- Country code selector (Israel default)
- 6-digit OTP input with auto-focus between digits
- Resend OTP timer (60 seconds countdown)
- Use Supabase phone auth

### 1.3 Apple Sign-In
**File:** `src/features/auth/components/SocialAuthButtons.tsx`

Requirements:
- Apple logo button (black on light, white on dark)
- Only show on iOS devices
- Use expo-apple-authentication
- Integrate with Supabase OAuth

### 1.4 Updated Login Screen
**File:** `app/(auth)/login.tsx` (UPDATE)

Requirements:
- Add social auth buttons below email/password form
- "or continue with" divider
- Maintain existing burgundy/gold theme
- Add "Sign in with Phone" option

---

## Feature 2: Consistent UI Component Library

### 2.1 Button Component
**File:** `src/components/ui/Button.tsx`

Variants:
- `primary` - Gold background (#B8860B), white text
- `secondary` - Burgundy background (#722F37), white text
- `outline` - Transparent, gold border, gold text
- `ghost` - Transparent, gold text, no border
- `danger` - Red background, white text

Sizes: `sm`, `md`, `lg`

Props:
- variant, size, loading, disabled, icon (left/right), fullWidth

### 2.2 Input Component
**File:** `src/components/ui/Input.tsx`

Variants:
- `default` - Standard text input
- `search` - With search icon, clear button
- `phone` - With country code dropdown

Props:
- label, error, helper text, left/right icon

### 2.3 Skeleton Loader
**File:** `src/components/ui/Skeleton.tsx`

Variants:
- `text` - Single line shimmer
- `avatar` - Circular shimmer
- `card` - Rectangular shimmer
- `list-item` - Avatar + text lines

Props:
- width, height, borderRadius, animated

### 2.4 Toast Notifications
**File:** `src/components/ui/Toast.tsx`
**File:** `src/providers/ToastProvider.tsx`
**File:** `src/hooks/useToast.ts`

Types: `success`, `error`, `warning`, `info`

Requirements:
- Slide in from top
- Auto-dismiss after 3 seconds
- Swipe to dismiss
- Icon based on type
- Use Reanimated for animations

### 2.5 Empty State
**File:** `src/components/ui/EmptyState.tsx`

Props:
- icon, title, description, actionLabel, onAction

### 2.6 Badge Component
**File:** `src/components/ui/Badge.tsx`

Variants:
- `default` - Gray background
- `success` - Green
- `warning` - Amber
- `error` - Red
- `gold` - Gold (premium)

### 2.7 Card Component
**File:** `src/components/ui/Card.tsx`

Variants:
- `default` - Standard card with shadow
- `elevated` - Larger shadow, more padding
- `outlined` - Border, no shadow
- `interactive` - Pressable with scale animation

---

## Feature 3: Debounced Search

### 3.1 useDebounce Hook
**File:** `src/hooks/useDebounce.ts`

```typescript
function useDebounce<T>(value: T, delay: number): T
```

### 3.2 useDebouncedCallback Hook
**File:** `src/hooks/useDebouncedCallback.ts`

```typescript
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T
```

### 3.3 Enhanced Search Screen
**File:** `app/(modals)/search.tsx` (UPDATE)

Requirements:
- Debounced search input (300ms delay)
- Recent searches (persisted with AsyncStorage)
- Search suggestions/autocomplete
- Filter chips (Available Now, Top Rated, Nearby, Best Price)
- Clear search history option
- Loading skeleton while searching
- Empty state when no results

### 3.4 SearchInput Component
**File:** `src/components/ui/SearchInput.tsx`

Props:
- value, onChangeText, placeholder, onClear, loading

Requirements:
- Search icon on left
- Clear button when has value
- Loading spinner when searching
- Animated focus state

---

## Feature 4: Google Maps Enhancements

### 4.1 Places Autocomplete
**File:** `src/features/map/components/PlacesAutocomplete.tsx`

Requirements:
- Google Places API integration
- Debounced input (300ms)
- Show recent/saved places
- Israeli addresses prioritized
- Show place type icon (home, work, etc.)

### 4.2 Map Style
**File:** `src/features/map/constants/mapStyle.ts`

Requirements:
- Custom premium map style matching app theme
- Gold accent colors for POIs
- Subtle warm tones

### 4.3 Directions Component
**File:** `src/features/map/components/DirectionsOverlay.tsx`

Requirements:
- Show route polyline from user to barber
- Display ETA and distance
- Step-by-step directions list
- Walking/driving mode toggle

### 4.4 Enhanced BarberMapView
**File:** `src/features/map/components/BarberMapView.tsx` (UPDATE)

Requirements:
- Marker clustering for multiple barbers
- Custom animated markers (already have AnimatedBarberMarker)
- Current location button
- Zoom to show all markers
- Re-center on user location

---

## Feature 5: Additional UI Enhancements

### 5.1 Pull-to-Refresh Indicator
**File:** `src/components/ui/RefreshIndicator.tsx`

Requirements:
- Custom gold-colored refresh indicator
- Scissors icon animation while refreshing

### 5.2 Screen Header
**File:** `src/components/ui/ScreenHeader.tsx`

Props:
- title, subtitle, showBack, rightAction, transparent

Requirements:
- Consistent back button with haptic feedback
- Optional right action button
- Animated title on scroll

### 5.3 Bottom Sheet Modal
**File:** `src/components/ui/BottomSheetModal.tsx`

Requirements:
- Reusable confirmation dialogs
- Action sheets
- Use @gorhom/bottom-sheet (already installed)
- Backdrop blur effect

---

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── SearchInput.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       ├── EmptyState.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── ScreenHeader.tsx
│       ├── BottomSheetModal.tsx
│       ├── RefreshIndicator.tsx
│       └── index.ts (barrel export)
├── features/
│   ├── auth/
│   │   └── components/
│   │       ├── SocialAuthButtons.tsx
│   │       ├── PhoneAuthInput.tsx
│   │       └── OTPInput.tsx
│   └── map/
│       ├── components/
│       │   ├── PlacesAutocomplete.tsx
│       │   └── DirectionsOverlay.tsx
│       └── constants/
│           └── mapStyle.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useDebouncedCallback.ts
│   └── useToast.ts
├── providers/
│   └── ToastProvider.tsx
└── app/
    └── (auth)/
        └── phone-login.tsx
```

---

## Implementation Notes

1. **MUST use existing theme** from `src/constants/theme.ts`
2. **MUST follow existing code patterns** (see existing components)
3. **Use TypeScript** with proper types
4. **Use react-native-reanimated** for animations
5. **Export all components** from barrel files
6. **Add JSDoc comments** for complex props
7. **Handle loading/error states** consistently
8. **Support RTL** where applicable (Hebrew)
