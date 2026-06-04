# Handoff: Issue #5 — Home page integration

## What was done

Implemented the Home page integration for the Itinerary feature (#5) end-to-end. Added a fourth gadget card on `/` (Converter, Places, Budget, **Itinerary**) with a Calendar icon and a live hint that reflects the active trip state. Tapping the card navigates to `/itinerary`, which already routes to the existing `ItineraryPage` from #3 and branches on whether a trip exists.

PR: https://github.com/CarlosMagnani/trips/pull/15
Issue: https://github.com/CarlosMagnani/trips/issues/5
Branch: `issue-5` (1 commit, 4 files, +318 / -3)

## Files changed

| File | Why |
|---|---|
| `src/gadgets/itinerary/itineraryUtils.ts` | New pure helper `getItineraryHint(trip, today)` + private `resolveCurrentDayIndex(trip, today)`. |
| `src/gadgets/itinerary/itineraryUtils.test.ts` | 5 new tests covering all branches of `getItineraryHint` (no trip, in-progress, before trip, after trip, singularisation, fallback mode). Added `makeTrip` / `makeDay` test helpers. |
| `src/pages/HomePage.tsx` | Added 4th gadget entry: `to: "/itinerary"`, `label: "Itinerary"`, `description: "Plan your daily trip"`, `icon: Calendar`. Hint delegates to `getItineraryHint` against the active trip. |
| `src/pages/HomePage.test.tsx` | New integration tests for the Home page (6 tests): card render with empty/trip state, all 4 gadgets visible, click → routes to `/itinerary` setup form or itinerary view depending on trip state. |

## Decisions made

### 1. Pure hint helper in `itineraryUtils.ts` (not in `HomePage.tsx`)
Kept the hint logic in the same file as the other itinerary utilities so it's discoverable next to `formatDayLabel`, `generateDays`, and `isValidDateRange`. The function is pure: it takes `(trip, today = new Date())` and returns a string. No IO, no storage access — the page passes the active trip in. This makes it trivially testable without mocks.

### 2. "Current day" resolution policy
- **Today inside the trip range** → that day (1-indexed).
- **Today before the trip starts** → Day 1 (planning state).
- **Today after the trip ends** → last day (post-trip, but we still want a sensible summary).
- **Trip with no days** → Day 1 (defensive — shouldn't happen in practice since `generateDays` always produces ≥ 1 day).

This matches the spec example "Day 3 of 7" for an in-progress trip, and gracefully handles planning and retrospective states.

### 3. Pluralisation
- `0 stops` / `1 stop` / `N stops` (English `s` rule).
- Mode is always `Walking` or `Driving` (capitalised, matching the spec example).

### 4. Active trip lookup mirrors `ItineraryPage`
`HomePage` resolves the active trip the same way `ItineraryPage` does: `data.trips.find((t) => t.id === data.activeTripId) ?? null`. The hint degrades to `"No trip planned — tap to start"` if either `activeTripId` is null or doesn't match any trip. Consistent semantics across the app.

### 5. Integration test setup
Render the page inside `MemoryRouter` with both `/` and `/itinerary` routes so we can verify navigation end-to-end (the click on the card lands on the ItineraryPage, which renders the "Plan Your Trip" setup form when no trip exists, and the "Itinerary" view when a trip exists). This exercises the full stack: link click → router → `ItineraryPage` → `readStorage` → render.

## Acceptance criteria

All met:
- [x] Home page shows itinerary gadget card alongside existing gadgets
- [x] Card shows "No trip planned" hint when no trip exists
- [x] Card shows trip summary (day X of Y, N stops, travel mode) when trip exists
- [x] Tapping the card navigates to `/itinerary`
- [x] `/itinerary` route is registered (already from #3) and shows setup form or itinerary view
- [x] Typecheck passes for changed files
- [x] Lint passes
- [x] `npm run test` — 103 passed, 0 failed

## Verification

```
$ npm run typecheck
src/gadgets/itinerary/placesApi.test.ts(24,24): error TS2683: 'this' implicitly has type 'any' …
```

The single typecheck error is **pre-existing on `main`** and originates from the Places API test mock added in #4. It is outside the scope of #5. Confirming with `git checkout main && npm run typecheck` reproduces the same error. I deliberately did not touch the file to avoid scope creep. Worth filing a cleanup issue separately.

```
$ npm run lint
(no output — clean)

$ npm run test
Test Files  13 passed (13)
     Tests  103 passed (103)
```

## What was NOT done (out of scope)

- Did not touch the pre-existing `placesApi.test.ts` typecheck error.
- Did not add the Itinerary entry to the `MobileNav` (the issue and spec do not call for it; the bottom nav stays as Home/Converter/Places/Budget for now).
- Did not add any deep linking, animation, or other polish — the gadget reuses the existing card layout and `Link` pattern from the other three gadgets.
- Did not introduce new dependencies.

## Open follow-ups for the next agent

- **Mobile nav**: should Itinerary be added to the bottom nav (`MobileNav.tsx`) and the `nav` `links` list? The spec does not require it, but the four-gadget home view now has 4 destinations while the bottom nav still shows 4 (Home + 3 gadgets) — a 5th destination may be needed soon. The next issue to look at is probably #6 (Flashcard detail view) or #8 (Manual place fallback) — both unblocked by #4 — or #9 (Map + bottom sheet) which is blocked by #4.
- **Pre-existing typecheck error in `placesApi.test.ts:24`**: 1-line fix (add `: { id: string }` annotation to the `vi.fn` parameter or refactor to a `Mock` helper). Worth a 1-issue cleanup if it blocks CI.
- **Active trip story**: the `ItineraryPage` resolves the active trip, but the data model is multi-trip ready. Once multi-trip UI is in scope (out of scope per spec), `HomePage` hint will need to list multiple trips or pick the most recent.

## TDD trace

Followed the red-green-refactor loop per the `tdd` skill, one test at a time:
1. RED — `getItineraryHint(null, today) === "No trip planned — tap to start"`. GREEN: stub returning the constant.
2. RED — `getItineraryHint(tripInProgress, todayInTrip) === "Day 3 of 7, 4 stops, Walking"`. GREEN: format the summary (hardcoded `currentDayIndex = 0`).
3. RED — before/after-trip resolution + singularisation + mode fallback (4 cases). GREEN: added `resolveCurrentDayIndex` private helper.
4. RED — `HomePage` integration (6 cases: card render, hint text, navigation, view switching, all 4 gadgets, storage namespace sanity). GREEN: added the gadget to `gadgets[]`.

After all tests passed, removed an unnecessary `eslint-disable` line on the `makeTrip` helper since the cleaner `as Trip` cast sufficed.
