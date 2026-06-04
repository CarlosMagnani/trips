# Deepen storage with per-entity typed accessors and React hooks

BudgetPage, PlacesPage, and ItineraryPage each duplicated ~30 lines of identical CRUD boilerplate (readStorage → mutate slice → writeStorage → setState). We deepened the storage module with per-entity typed accessors (`addTransaction`, `updatePlace`, etc.) wrapped by React hooks (`useTransactions`, `usePlaces`, etc.). Pages became thin renderers.

## Considered Options

**Generic CRUD vs per-entity accessors.** Generic (`add<T>(key, entity)`) gives a smaller interface but leaks string keys and blob shape to callers. Per-entity (`addTransaction(t)`) is type-safe at the call site and hides the blob schema. Chose per-entity for navigability.

**Pure data access vs React hooks.** Pure accessors keep the store framework-agnostic but leave pages managing their own state. Hooks absorb state management, making pages nearly stateless. Chose hooks for caller leverage.

**Pure accessors + hooks vs logic-in-hooks.** Separating pure functions (in `storage/transactions.ts`) from React hooks (in `storage/useTransactions.ts`) gives two adapters per entity — real seams testable without React. Folding logic into hooks gives one adapter — hypothetical seam. Chose separation for testability.

**Exchange rates: CRUD vs singleton.** Exchange rates are always a single-element array with no list/edit/delete. Modeling as CRUD leaks the "always one element" invariant to callers. Modeling as singleton (`saveExchangeRate`, `getExchangeRate`) hides the array detail. Chose singleton for honest interface.

**ID/timestamp stamping in accessor vs hook.** Accessor stamping concentrates entity lifecycle in one place. Hook stamping keeps accessors side-effect-free but spreads lifecycle logic. Chose accessor stamping for locality.

**Shared state vs per-instance state.** Module-level cache syncs all hook instances but adds complexity for a scenario that doesn't exist (pages navigate, not coexist). Per-instance state matches today's behavior. Chose per-instance for simplicity.

## Consequences

- Storage logic concentrates in `storage/` (transactions.ts, places.ts, trips.ts, exchangeRates.ts + matching hooks). Gadgets stay focused on domain types and UI.
- Rate resolution stays in `currency/` as a pure function behind fetcher/cache seams, composed with the storage hook by `useExchangeRate`.
- Each hook instance reads localStorage on mount and manages local state. Cross-page sync is not provided.
- `readStorage()`/`writeStorage()` become internal to the storage module. Pages no longer import them directly.
