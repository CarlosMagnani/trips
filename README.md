# Trips

Personal travel toolkit: a mobile-first React PWA for BRL/ARS currency conversion, places sorted by distance, and budget notes. Local-first, offline-friendly, no accounts or backend.

## Quick Start

```bash
npm install
npm run dev
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Typecheck and build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint

## Documentation

**Start here:**

- [CONTEXT.md](./CONTEXT.md) - Project context, domain terms, and product boundaries
- [Spec-First Workflow](./docs/spec-first-workflow.md) - How to write specs before code

**Foundation:**

- [Project Foundation Spec](./docs/trips-pwa-project-foundation.md) - MVP product spec, architecture, and data models

**Task Specs:**

- [docs/specs/](./docs/specs/) - Implementation-ready specs for features and changes

**Architecture Decisions:**

- [docs/adr/](./docs/adr/) - Records for hard-to-reverse decisions

## Stack

- React 19 + TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS 4
- shadcn/ui-style primitives
- Vitest
- vite-plugin-pwa

## Routes

- `/` - Home with gadget cards
- `/converter` - BRL to ARS currency converter
- `/places` - Places sorted by distance
- `/budget` - Budget and transaction notes

## MVP Scope

- Personal single-user app
- Local device storage only (localStorage)
- Frontend-only, no backend or API
- Manual exchange rates (no live rates)
- Manual place entry (no maps or geolocation)
- BRL and ARS currencies only
- Offline shell after first visit
- No auth, no cloud sync, no push notifications

## License

Private project.
