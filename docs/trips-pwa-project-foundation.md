# Spec: Trips PWA Project Foundation

## Summary

Trips is a personal, mobile-first React PWA that provides a small set of travel utilities for one private user: BRL/ARS currency conversion, manually managed places sorted by distance, and simple budget or transaction notes. The MVP should be frontend-only, local-first, offline-friendly, fast to use on a phone, and intentionally avoid accounts, backend services, external APIs, or complex integrations.

## Product Goals

- Build an installable mobile-first PWA for personal travel use.
- Provide a compact travel toolkit rather than a generic dashboard.
- Keep all MVP data local to the device.
- Support BRL and ARS clearly across currency-related flows.
- Make common actions fast on mobile with minimal typing.
- Require no login, accounts, roles, or permissions.
- Require no backend for the MVP.
- Keep architecture open enough to add more currencies, places capabilities, and richer budgeting later without overbuilding now.

## Non-Goals

- User login or authentication.
- Cloud sync.
- Backend API.
- Payment integration.
- Live exchange-rate API.
- Google Maps or external maps API.
- Multi-user support.
- Complex analytics.
- Push notifications.
- Server-side database or hosted persistence.
- Social, sharing, collaboration, or trip team features.
- Sensitive financial workflows beyond local personal notes.

## MVP Features

### 1. Home

- Show available gadgets as clear, tappable cards.
- Navigate to each gadget.
- Work well on mobile as the primary viewport.
- Give each gadget a concise label and useful current-state hint, such as last used rate or number of saved places when available.
- Avoid marketing copy, onboarding tours, or explanatory landing-page sections.

### 2. Currency Converter

- Convert BRL to ARS.
- Allow manual exchange-rate input.
- Show the exact rate being used.
- Format currency values clearly for BRL and ARS.
- Allow entering either source amount or target amount if the first implementation can do this cleanly; otherwise prioritize BRL amount to ARS result.
- Persist the last manual rate locally.
- Keep the data structure open for future currencies without adding live rates in the MVP.

### 3. Places by Distance

- Allow manual place creation.
- Each place should have:
  - name
  - optional note
  - distance from start
  - distance unit
- Sort places by distance ascending.
- Support editing and deleting places.
- Keep structure open for future geolocation or maps integration without implementing either in the MVP.
- Make sorting deterministic when distances are equal.

### 4. Budget and Transaction Notes

- Allow simple budget and transaction notes.
- Each transaction should have:
  - title
  - amount
  - currency
  - type: expense or income
  - optional note
  - date
- Required currencies:
  - BRL
  - ARS
- Preserve the selected currency on each transaction.
- Show totals grouped by currency.
- Do not mix totals across currencies unless a conversion rate is explicitly provided.
- Support creating, editing, and deleting transaction notes.

## Technical Direction

Expected stack:

- React
- TypeScript
- Vite
- PWA support through a Vite PWA plugin or equivalent lightweight setup
- localStorage for MVP persistence
- shadcn/ui if available and useful
- mobile-first responsive CSS

Recommended local persistence option: use `localStorage` for the MVP behind a small typed storage adapter.

Rationale:

- The first dataset is small: rates, places, and transaction notes.
- localStorage is enough for simple offline local-first behavior.
- It avoids IndexedDB complexity while the product model is still small.
- A storage adapter keeps the app open to moving to IndexedDB later if notes, attachments, search, or larger datasets become necessary.

Storage expectations:

- Use one versioned namespace, for example `trips:v1`.
- Store data as JSON with basic runtime validation before accepting parsed values.
- Treat corrupt or unknown stored data as recoverable: ignore invalid records, keep the app usable, and avoid crashing.
- Keep persistence utilities separate from React components.
- Avoid global state libraries unless a later issue demonstrates a real need.

Repository context note:

- The Multica checkout failed because the local bare cache for `https://github.com/CarlosMagnani/trips.git` had no usable refs. This spec is based on the issue requirements and squad instructions, not an inspected existing codebase. If the repo already has conflicting conventions when implementation starts, prefer the existing project pattern and update the child issue before coding.

## Suggested Folder Structure

```text
src/
  app/
    App.tsx
    routes.tsx
    layout/
      AppShell.tsx
      MobileNav.tsx
  pages/
    HomePage.tsx
    ConverterPage.tsx
    PlacesPage.tsx
    BudgetPage.tsx
  components/
    ui/
    EmptyState.tsx
    FieldError.tsx
    PageHeader.tsx
  gadgets/
    converter/
      ConverterForm.tsx
      converterUtils.ts
      converterTypes.ts
    places/
      PlaceForm.tsx
      PlacesList.tsx
      placesUtils.ts
      placesTypes.ts
    budget/
      TransactionForm.tsx
      TransactionList.tsx
      budgetUtils.ts
      budgetTypes.ts
  storage/
    storageKeys.ts
    localStore.ts
    migrations.ts
  currency/
    currencyTypes.ts
    formatCurrency.ts
    exchangeRates.ts
  types/
    common.ts
  tests/
    setup.ts
```

Implementation notes:

- Keep gadget-specific components and utilities inside `src/gadgets/<gadget>`.
- Keep shared currency formatting in `src/currency`.
- Keep persistence in `src/storage`.
- Keep pages thin: compose gadget modules, route structure, and page layout.
- Use `src/components/ui` for shadcn/ui components if shadcn is added.

## Data Models

```ts
export type CurrencyCode = "BRL" | "ARS";

export interface ExchangeRate {
  id: string;
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  updatedAt: string;
  source: "manual";
}

export type DistanceUnit = "km" | "m";

export interface Place {
  id: string;
  name: string;
  note?: string;
  distance: number;
  distanceUnit: DistanceUnit;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "expense" | "income";

export interface TransactionNote {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  currency: CurrencyCode;
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
}

export interface TripsStorageV1 {
  exchangeRates: ExchangeRate[];
  places: Place[];
  transactions: TransactionNote[];
}
```

Model rules:

- IDs should be stable client-generated strings.
- Dates should be stored as ISO strings.
- Amounts, rates, and distances must be finite positive numbers unless a specific UI field allows a zero value.
- Currency totals must be grouped by `CurrencyCode`.
- Future currencies should require adding to `CurrencyCode` and formatting metadata, not rewriting every gadget.

## Navigation

Expected routes:

- `/`
- `/converter`
- `/places`
- `/budget`

Navigation model:

- Use client-side routing.
- Home is the default route.
- Each gadget route should have a clear page title and a path back to Home.
- On mobile, use large touch targets and simple top or bottom navigation.
- Avoid deep nested routes for the MVP.
- Unknown routes should redirect to `/` or show a simple not-found state with a Home action.

## UI Design Direction

The app should feel like a practical travel toolkit, not a SaaS dashboard.

Prefer:

- Mobile-first layout.
- Clear gadget cards.
- Large touch targets.
- Readable numbers and currency values.
- Simple forms.
- Offline-friendly behavior.
- Clean hierarchy.
- Minimal friction.
- Compact repeated lists that are easy to scan while traveling.
- Plain-language field labels and errors.

Avoid:

- Desktop-first layouts.
- Complex tables.
- Unnecessary modals.
- Unnecessary animations.
- Generic placeholder UI.
- Decorative gradients or visual treatments that reduce readability.
- Hidden interactions that are hard to discover on mobile.

Baseline interaction expectations:

- Forms should use native-friendly inputs where possible.
- Primary actions should be obvious and reachable with one hand on mobile.
- Empty states should explain what to add next, not describe the app.
- Error states should say what to fix.
- Lists should remain usable with several saved items without forcing horizontal scrolling.

## PWA Requirements

- Installable app.
- App manifest with sensible name, short name, theme color, background color, and display mode.
- Service worker with an offline app shell.
- Responsive mobile layout.
- Icon placeholder strategy:
  - use generated or simple checked-in icons for required manifest sizes
  - keep icon source editable
  - avoid blocking MVP on final branding
- App should load when offline after the first successful visit.
- Locally saved data should be available offline.
- Do not add push notifications in the MVP.
- Do not add background sync in the MVP.

## Testing Expectations

Expected automated validation:

- Typecheck.
- Lint.
- Core utility tests.
- Currency formatting tests.
- Conversion calculation tests.
- Places sorting tests.
- Budget summary tests grouped by currency.
- Local persistence tests where useful.

Expected manual validation:

- Mobile preview for all routes.
- Refresh persistence check for exchange rate, places, and transactions.
- Offline reload check after first visit.
- Invalid form input check.
- Empty state check for all gadgets.

Testing guidance:

- Keep tests focused on utilities and local data behavior for the first slice.
- Do not create a large testing framework unless the app foundation issue explicitly needs it.
- Add component or E2E tests only where they protect meaningful user flows.

## Issue Breakdown

### 1. Initialize React + TypeScript + Vite PWA Project

Summary: Create the base frontend project with React, TypeScript, Vite, package scripts, baseline styling, and PWA-ready build configuration.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- React + TypeScript + Vite project runs locally.
- Build, typecheck, and lint scripts exist.
- App renders a minimal shell.
- No backend, auth, or external API integration is added.

### 2. Add App Shell, Routing, and Mobile Navigation

Summary: Add the primary app shell, four MVP routes, mobile-friendly navigation, and a simple not-found behavior.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- Routes exist for `/`, `/converter`, `/places`, and `/budget`.
- Home links to each gadget.
- Each gadget page can navigate back to Home.
- Navigation uses mobile-friendly touch targets.
- Unknown routes are handled cleanly.

### 3. Add Shared UI Foundation and shadcn/ui Setup

Summary: Establish shared UI primitives and styling conventions, using shadcn/ui where it fits the project.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- Shared components exist for page header, empty state, field error, buttons, inputs, and cards or panels.
- Components are accessible and mobile-friendly.
- shadcn/ui is configured if compatible with the project setup.
- UI does not introduce generic dashboard or marketing layout patterns.

### 4. Implement BRL/ARS Currency Converter

Summary: Build the currency converter using manual rate input, clear currency formatting, and local persistence for the last rate.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- User can enter a BRL amount and manual BRL-to-ARS rate.
- App shows the ARS result.
- The active rate is visible.
- BRL and ARS are formatted clearly.
- Invalid amount or rate input shows useful errors.
- Last manual rate persists after refresh.

### 5. Implement Local Persistence Utilities

Summary: Add typed localStorage utilities with versioned keys, safe parsing, and clear defaults.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- Storage adapter reads and writes `TripsStorageV1`.
- Missing storage returns safe defaults.
- Corrupt storage does not crash the app.
- Storage keys are namespaced and versioned.
- Unit tests cover basic persistence behavior.

### 6. Implement Places List Sorted by Distance

Summary: Build manual place entry, local persistence, deterministic sorting, editing, and deleting.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- User can create a place with name, optional note, distance, and unit.
- Places persist after refresh.
- Places sort by distance ascending.
- Equal distances sort deterministically.
- User can edit and delete places.
- Empty and invalid input states are handled.

### 7. Implement Budget and Transaction Notes

Summary: Build transaction note creation, editing, deletion, local persistence, and grouped currency totals.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- User can create a transaction with title, amount, currency, type, optional note, and date.
- Required currencies are BRL and ARS.
- Transactions persist after refresh.
- Totals are grouped by currency.
- BRL and ARS totals are not mixed.
- User can edit and delete transactions.
- Invalid inputs show useful errors.

### 8. Add PWA Manifest, Service Worker, and Offline Shell

Summary: Complete installability and offline shell behavior for the MVP.

Recommended assignee: Front Dev Agent

Acceptance criteria:

- Manifest includes app name, short name, display mode, colors, and icons.
- Service worker caches the app shell.
- App loads offline after first successful visit.
- Local data remains available offline.
- Push notifications and background sync are not added.

### 9. Add QA Pass for MVP Mobile Flows

Summary: Verify the implemented MVP against the foundation spec and create precise follow-up issues for gaps.

Recommended assignee: Devils Advocate QA Agent

Acceptance criteria:

- QA checks all MVP routes on a mobile viewport.
- QA checks converter, places, and budget happy paths.
- QA checks invalid input, empty states, refresh persistence, and offline behavior.
- QA verifies totals do not mix currencies.
- QA reports approval or specific blocking findings.

## Acceptance Criteria

- A complete project foundation spec is posted in the issue comments.
- MVP scope and non-goals are explicit.
- Recommended architecture is simple and frontend-only.
- Suggested folder structure is defined.
- Initial data models are defined.
- Local persistence strategy is recommended.
- PWA requirements are defined.
- Testing expectations are defined.
- Initial implementation issues are proposed.
- The spec is ready for the Front Dev Agent to start implementation from follow-up issues.

## Recommended Assignee

Spec Agent for this foundation spec.

Recommended follow-up execution:

- Front Dev Agent for implementation issues 1 through 8.
- Devils Advocate QA Agent for implementation issue 9 and review passes.
- Carlos Magnani for product decisions only when a future issue conflicts with these MVP assumptions.

## Developer Agent Handoff

Implementation order:

1. Initialize the React + TypeScript + Vite PWA project.
2. Add routing and mobile app shell.
3. Add shared UI primitives.
4. Add storage utilities.
5. Implement converter.
6. Implement places.
7. Implement budget notes.
8. Complete PWA installability and offline shell.
9. Run QA against mobile and local-first behavior.

Read first:

- This foundation spec.
- `AGENTS.md` squad instructions.
- Existing repository files, if checkout is available during implementation.

Do not change:

- Do not add authentication.
- Do not add backend services.
- Do not add live exchange-rate APIs.
- Do not add map or geolocation APIs.
- Do not add payment integrations.
- Do not build multi-user or sync behavior.

Definition of done:

- MVP scope is implemented in small reviewable slices.
- Available checks pass.
- Mobile behavior is manually validated.
- Local persistence survives refresh.
- Offline shell works after first successful load.
- QA has reviewed the result and no S0 or S1 findings remain.

## Open Questions

- None for the foundation spec. The MVP should proceed with manual inputs, localStorage persistence, no backend, and no external APIs unless a future issue explicitly changes that scope.
