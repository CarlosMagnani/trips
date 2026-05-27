# Project Context

Durable context for the Trips repository. Read this before implementation work.

## Product

**Trips** is a personal, mobile-first React PWA that provides travel utilities for one private user: BRL/ARS currency conversion, manually managed places sorted by distance, and simple budget or transaction notes. The MVP is frontend-only, local-first, offline-friendly, and intentionally avoids accounts, backend services, external APIs, or complex integrations.

## Domain Terms

**Trips** - The application itself; a personal travel toolkit, not a SaaS dashboard or multi-user product.

**Gadget** - A small travel utility inside the app. The MVP includes three gadgets: currency converter, places by distance, and budget notes.

**Currency Converter** - A gadget that converts BRL to ARS using a manually entered exchange rate.

**Exchange Rate** - A manual conversion factor between two currencies. The MVP supports BRL to ARS only. Rates are persisted locally.

**Place** - A manually entered location with a name, optional note, distance from start, and distance unit (km or m).

**Distance** - A numeric value representing how far a place is from the starting point. Places are sorted by distance ascending.

**Budget Note** - The budget gadget as a whole, which tracks income and expense transactions.

**Transaction Note** - A single budget entry with title, amount, currency, type (expense or income), optional note, and date.

**Currency Total** - Aggregated income, expense, and balance for a specific currency. Totals are grouped by currency and never mixed unless a conversion rate is explicitly provided.

**Local-First** - The app remains useful with local device storage and no network dependency for saved data. All MVP data is stored in localStorage.

**Offline Shell** - The app loads after the first successful visit, even when offline. This does not imply background sync or push notifications.

**MVP** - Minimum Viable Product. The current scope: frontend-only, local data, BRL/ARS, manual inputs, no backend, no auth, no live APIs.

## Product Boundaries

### In Scope

- Personal single-user app
- Local device storage only (localStorage)
- Frontend-only, no backend or API
- Manual exchange rates
- Manual place entry
- BRL and ARS currencies
- Offline shell after first visit
- Mobile-first responsive design
- Installable PWA

### Out of Scope

- User login or authentication
- Cloud sync or multi-device support
- Backend API or server-side persistence
- Live exchange-rate API
- Google Maps or external maps API
- Geolocation or automatic distance calculation
- Multi-user support or collaboration
- Complex analytics or reporting
- Push notifications
- Background sync
- Payment integration
- Social or sharing features

## Source of Truth

**Foundation Spec:** [docs/trips-pwa-project-foundation.md](./docs/trips-pwa-project-foundation.md)

The foundation spec defines the MVP product goals, non-goals, features, technical direction, data models, navigation, UI design, PWA requirements, testing expectations, and issue breakdown. It is the primary reference for product decisions.

**Task Specs:** [docs/specs/](./docs/specs/)

Implementation-ready specs for specific features, bugs, refactors, or changes. Each task spec is scoped to one change or closely related change set.

**Architecture Decisions:** [docs/adr/](./docs/adr/)

Records for hard-to-reverse, surprising, or trade-off-heavy decisions. Most routine implementation details do not require an ADR.

## Architecture

- **Stack:** React 19, TypeScript 6, Vite 8, React Router 7, Tailwind CSS 4, Vitest, vite-plugin-pwa
- **Routing:** Client-side routing with four routes: `/`, `/converter`, `/places`, `/budget`
- **Storage:** Versioned localStorage under `trips:v1` namespace
- **UI:** shadcn/ui-style primitives, mobile-first layout
- **PWA:** Installable app with service worker caching the app shell

See the foundation spec for detailed data models, folder structure, and implementation guidance.

## Workflow

This repository uses a **spec-first** workflow. Read [docs/spec-first-workflow.md](./docs/spec-first-workflow.md) before starting implementation work.

Key principles:

- Write a spec before code for normal feature, refactor, UI, or quality work
- Small bugs or copy-only changes can use a lighter path (issue description is enough)
- Broad architecture or irreversible decisions may require an ADR
- Specs guide implementation; they do not replace code review, tests, or human judgment

## For Agents

Before implementing:

1. Read this file (CONTEXT.md)
2. Read the relevant task spec in docs/specs/ (if one exists)
3. Read the foundation spec if the task touches product decisions
4. Check docs/adr/ for relevant architecture decisions
5. Implement with the spec as guidance, not as a substitute for verification

Do not change product boundaries, add backend services, integrate live APIs, or introduce auth without explicitly revising the foundation spec and non-goals.
