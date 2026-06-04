# Itinerary Feature Spec

## Overview

A daily itinerary planner that lets users search for places via Google Maps, organize them into day-by-day flashcards, view routes on an interactive map, and optimize travel order. Part of the Trips PWA — a personal, local-first travel toolkit.

## User Story

As a traveler, I want to plan each day of my trip by searching for places, seeing them as photo flashcards on a map, and optimizing the route so I can make the most of my time.

## Scope

### In scope

- Create a single trip with a date range
- Plan stops for each day using Google Places search
- View stops as photo flashcards in a bottom sheet over an interactive map
- Manually reorder stops or auto-optimize the route
- Set optional arrival times and durations per stop
- Check opening hours against planned visit times
- Move stops between days
- Add places Google doesn't know about (manual fallback)
- View flashcard details with full place info and a "Navigate in Google Maps" button
- Offline viewing of planned itinerary (cached data)
- Per-day travel mode (walking/driving) and optional starting point

### Out of scope (future work)

- Multi-trip management (data model supports it, UI does not yet)
- Firestore sync (planned as a separate migration phase after itinerary is built)
- Budget/transaction features (separate feature)
- Turn-by-turn navigation (deep-links to Google Maps instead)
- Sharing itineraries with others
- Importing itineraries from external sources

## Data Model

### Storage shape

The storage adds a `trips` array and `activeTripId` to the existing `TripsStorageV1`:

```typescript
interface TripsStorageV2 {
  exchangeRates: ExchangeRate[]
  places: Place[]
  transactions: TransactionNote[]
  trips: Trip[]
  activeTripId: string | null
}
```

### Trip

```typescript
interface Trip {
  id: string
  name?: string
  startDate: string        // ISO date (YYYY-MM-DD)
  endDate: string          // ISO date (YYYY-MM-DD)
  days: TripDay[]
  createdAt: string
  updatedAt: string
}
```

### TripDay

```typescript
interface TripDay {
  id: string
  date: string             // ISO date (YYYY-MM-DD)
  travelMode: TravelMode
  startingPoint?: string   // address or place name
  stops: ItineraryStop[]
}

type TravelMode = "walking" | "driving"
```

### ItineraryStop

```typescript
interface ItineraryStop {
  id: string
  placeId?: string         // Google Place ID (absent for manual entries)
  name: string
  address?: string
  lat: number
  lng: number
  photoUrl?: string        // cached photo URL (from Google or manual upload)
  rating?: number
  ratingCount?: number
  openingHours?: OpeningHours
  userNote?: string
  arrivalTime?: string     // HH:MM format, optional
  durationMinutes?: number // estimated time at place, optional
  order: number            // position in the day's sequence
  createdAt: string
  updatedAt: string
}

interface OpeningHours {
  // Google's weekday text format: "Monday: 9:00 AM – 6:00 PM"
  weekdayText: string[]
}
```

### Key design decisions

- **`trips[]` from day one** — data model is multi-trip-ready, but UI only exposes the active trip
- **`ItineraryStop` is separate from `Place`** — different entity, different use case
- **One stop per place per day** — independent flashcards, no shared references
- **Photo cached in IndexedDB** — stored as `Blob` for offline access

## UI/UX

### App location

- New gadget card on Home page (`/`)
- New route: `/itinerary`
- Home card shows summary: "Day 3 of 7 · 4 stops · Walking" (or "No trip planned — tap to start")

### Trip setup

When no trip exists, tapping the itinerary card shows a setup screen:

1. **Required**: Start date + end date (two date pickers)
2. **Optional** (editable anytime via settings): Trip name, home base address, default travel mode

After setup, user lands on the itinerary view with empty day tabs.

### Itinerary view layout

```
┌─────────────────────────────┐
│  Day 1 · Mon  Day 2 · Tue … │  ← Day tabs (horizontal scroll, swipeable)
├─────────────────────────────┤
│                             │
│      Google Map (full)      │  ← Route polyline, place markers
│      with route + pins      │
│                             │
├─────────────────────────────┤
│  ▲ Drag up for full list    │
│  ┌───────────────────────┐  │
│  │  [Photo]               │  │  ← Bottom sheet (draggable)
│  │  Place Name            │  │
│  │  Address · 4.5★ · Open │  │
│  │  "Try the empanadas"   │  │
│  ├───────────────────────┤  │
│  │  [Photo]               │  │
│  │  Another Place         │  │
│  │  ...                   │  │
│  └───────────────────────┘  │
│  [+ Add stop]  [Optimize]   │  ← Floating action bar
└─────────────────────────────┘
```

### Day tabs

- Horizontal row of tabs: "Day 1 · Mon 9", "Day 2 · Tue 10", ...
- Scroll horizontally for long trips (10+ days)
- Tap to switch days, or swipe left/right on map or bottom sheet
- Active day is highlighted
- Switching days updates the map route and bottom sheet content

### Flashcard

Each card in the bottom sheet shows:

- **Photo** (top, full-width, ~120px height)
- **Name** (bold)
- **Address** (truncated, one line)
- **Rating** (e.g. "4.5 ★")
- **Opening hours status** ("Open" / "Closed" / "Closed at 7 PM" warning badge if closed at planned arrival time)
- **User note** (italic, if present)
- **Drag handle** (for reordering)
- **Context menu** (⋮): "Move to Day...", "Edit note", "Delete"

### Flashcard detail view

Tapping a flashcard opens a full-screen detail page:

- Large photo
- Full address
- Rating and review count
- Opening hours (full weekly schedule, current day highlighted)
- User note (editable)
- Arrival time picker (optional)
- Duration picker (optional, e.g. "1 hour")
- "Navigate in Google Maps" button (deep-link to `google.maps://`)
- Back button returns to itinerary view

### Adding a stop

1. Tap "+ Add stop" → search input appears at top of bottom sheet
2. User types query → Google Places Autocomplete dropdown
3. User selects a result → flashcard is added to the current day at the end
4. Photo is fetched and cached in IndexedDB immediately

**Manual fallback**: If search returns no results (or user taps "Can't find it?"):
- Form: name (required), tap map to set pin (required), photo from camera roll (optional), note (optional)
- Creates a flashcard with no rating/hours

### Moving stops between days

- Context menu on flashcard → "Move to Day..." → picker with available days
- Stop data (photo, coordinates, Google details) travels with it

### Route optimization

- "Optimize" button per day
- Calls Google Routes API with the day's stops (and starting point if set)
- Reorders stops into the shortest path
- Untimed stops are reordered; stops with explicit arrival times stay pinned, and untimed stops are optimized around them
- Map updates the polyline to reflect new order

### Day starting point

- Optional per-day field: "Start from" (address or place name)
- If set, route optimization includes travel from this point to the first stop
- If not set, route starts at the first flashcard
- Editable via a small "Settings" icon on the day view

### Travel mode

- Per-day: walking or driving
- Default set at trip level (optional), overridable per day
- Affects route polyline and time estimates from Routes API

## Google Maps Integration

### APIs used

| API | Purpose |
|---|---|
| Places API (New) — Autocomplete | Search for places |
| Places API (New) — Place Details | Get photo, coordinates, rating, hours, address |
| Maps JavaScript API | Render interactive map, markers, polyline |
| Routes API | Calculate optimal route and travel times |

### API key management

- Stored in `VITE_GOOGLE_MAPS_KEY` env variable
- Restricted by HTTP referrer to the deployed domain in Google Cloud Console
- Key is visible in the bundle but useless outside the deployed domain

### Map rendering

- Google Maps JavaScript API
- Markers for each stop (with place photo as marker icon if available)
- Polyline showing the route between stops in order
- Tap marker → scrolls bottom sheet to that flashcard
- Tap flashcard → map centers on that marker

## Offline Behavior

### Strategy: Graceful degradation

**Works offline:**
- Viewing planned flashcards (all data cached)
- Seeing the route on cached map tiles
- Editing user notes
- Reordering stops manually
- Viewing flashcard details

**Requires internet:**
- Google Places search (new stops)
- Route optimization (Routes API call)
- Map tile loading for new areas
- Photo fetching for new stops

### Offline UX

- Detect offline state via `navigator.onLine` + `online`/`offline` events
- Disable search input and optimize button with a friendly message: "Connect to internet to search"
- Show cached flashcards and route from IndexedDB
- Queue nothing — offline actions are local-only edits that sync on next storage write

### Caching

- **IndexedDB** (via `idb` or `Dexie` library)
- Store: `itineraryCache` — trip data, stop details, photo Blobs
- Photos cached as `Blob` on plan (when flashcard is created)
- Photo size: ~200KB each, ~6MB for a 30-stop trip

## Day Editing

- **Extend**: Add days at the end (extend the trip)
- **Shrink**: Remove empty days from the end
- Cannot insert or remove days in the middle (leave a day empty for a rest day)

## Opening Hours Warnings

- When a stop has `openingHours` and an `arrivalTime`, check if the place is open at that time on that day
- If closed: show a red warning badge on the flashcard ("Closed at 7 PM")
- Non-blocking — user can keep the stop (they may know better)
- No alternative suggestions (future enhancement)

## File Structure

```
src/
├── gadgets/
│   └── itinerary/
│       ├── itineraryTypes.ts      # Trip, TripDay, ItineraryStop types
│       ├── itineraryUtils.ts      # Pure functions (ordering, validation)
│       ├── itineraryUtils.test.ts
│       ├── TripSetupForm.tsx      # Date range picker for new trip
│       ├── DayTabs.tsx            # Horizontal day tab bar
│       ├── ItineraryMap.tsx       # Google Maps component
│       ├── BottomSheet.tsx        # Draggable bottom sheet
│       ├── Flashcard.tsx          # Individual stop card
│       ├── FlashcardList.tsx      # List of flashcards for a day
│       ├── FlashcardDetail.tsx    # Full detail view
│       ├── PlaceSearch.tsx        # Google Places autocomplete
│       ├── ManualPlaceForm.tsx    # Fallback for places not in Google
│       ├── DaySettings.tsx        # Starting point, travel mode
│       └── RouteOptimizer.ts      # Google Routes API integration
├── pages/
│   └── ItineraryPage.tsx          # Route /itinerary
├── storage/
│   ├── indexedDb.ts               # IndexedDB wrapper (idb/Dexie)
│   └── migrations.ts              # Updated for TripsStorageV2
```

## Dependencies to Add

| Package | Purpose |
|---|---|
| `@googlemaps/js-api-loader` | Load Google Maps JavaScript API |
| `idb` or `dexie` | IndexedDB wrapper for offline cache |

## Routes

| Route | Page |
|---|---|
| `/itinerary` | Itinerary view (map + bottom sheet) |
| `/itinerary/stop/:stopId` | Flashcard detail view |

## Implementation Phases

### Phase 1: Core data model + trip setup
- Types (`Trip`, `TripDay`, `ItineraryStop`)
- Storage migration to V2
- `TripSetupForm` (date range picker)
- Empty itinerary view with day tabs

### Phase 2: Google Places search + flashcards
- Google Maps API key setup (env variable)
- `PlaceSearch` component (Autocomplete)
- `Flashcard` component
- `FlashcardList` with drag-reorder
- Photo caching in IndexedDB

### Phase 3: Map + bottom sheet
- `ItineraryMap` component (Google Maps JS API)
- Markers for stops, polyline for route
- `BottomSheet` component
- Map ↔ flashcard interaction (tap marker scrolls sheet, tap card centers map)

### Phase 4: Flashcard detail + manual fallback
- `FlashcardDetail` page
- Note editor, arrival time, duration
- "Navigate in Google Maps" deep-link
- `ManualPlaceForm` (name + map pin + optional photo)

### Phase 5: Route optimization + time features
- `RouteOptimizer` (Google Routes API)
- "Optimize" button per day
- Opening hours warnings
- Day starting point + travel mode

### Phase 6: Day management + polish
- Extend/shrink days
- Move stops between days
- Offline detection + graceful degradation
- Home page gadget card

## Open Questions

None — all design decisions resolved.

## Future Enhancements (not in scope)

- Multi-trip management UI
- Firestore sync for two-device sharing
- "Suggest alternative day" for closed places
- Import itinerary from Google Maps saved places
- Export itinerary as PDF or shareable link
- Budget integration (link stops to planned expenses)
