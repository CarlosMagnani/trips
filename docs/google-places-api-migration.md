# Google Places API Migration

## Overview

`src/gadgets/itinerary/placesApi.ts` was migrated from the legacy Google Places API to the Places API (New) for the Maps JavaScript API.

## Why

The legacy Places API classes (`AutocompleteService`, `PlacesService`) are not enabled for projects using Places API (New). The error was:

> "You're calling a legacy API, which is not enabled for your project."

## What Changed

### Autocomplete

**Before (legacy):**
```ts
const service = new google.maps.places.AutocompleteService()
service.getPlacePredictions({ input }, (predictions, status) => {
  // callback-based
})
```

**After (new):**
```ts
const { suggestions } = await google.maps.places.AutocompleteSuggestion
  .fetchAutocompleteSuggestions({ input })
```

### Place Details

**Before (legacy):**
```ts
const service = new google.maps.places.PlacesService(container)
service.getDetails({ placeId, fields }, (place, status) => {
  // callback-based
})
```

**After (new):**
```ts
const place = new google.maps.places.Place({ id: placeId })
await place.fetchFields({ fields })
// place.displayName, place.location, etc.
```

### Field Mappings

| Legacy Field | New Field |
|--------------|-----------|
| `place_id` | `placeId` |
| `name` | `displayName` |
| `formatted_address` | `formattedAddress` |
| `geometry.location` | `location` |
| `user_ratings_total` | `userRatingCount` |
| `opening_hours` | `regularOpeningHours` |
| `opening_hours.open_now` | `isOpen()` (async method) |
| `opening_hours.weekday_text` | `regularOpeningHours.weekdayDescriptions` |
| `photos[0].getUrl({ maxHeight })` | `photos[0].getURI()` |

### Key Differences

1. **Promise-based API** — no more callbacks
2. **No singleton services** — `AutocompleteSuggestion.fetchAutocompleteSuggestions()` is static; `Place` is constructed per-request
3. **`isOpen()` is async** — returns a Promise, throws if opening hours aren't available
4. **Photos use `getURI()`** — no size options needed (or pass `{ maxWidth: 800 }` if desired)

## Testing

Tests mock the new API surface:
- `AutocompleteSuggestion.fetchAutocompleteSuggestions` (static method)
- `Place` constructor + `fetchFields()` + `isOpen()`

See `src/gadgets/itinerary/placesApi.test.ts`.

## Related

- [Itinerary Feature Spec](./specs/itinerary-feature.md) — Phase 2 uses this API
- [ADR-0001](./adr/0001-deepen-storage-with-typed-accessors.md) — future storage refactor (not yet implemented)
