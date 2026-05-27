# Architecture Decision Records

ADRs document decisions that are hard to reverse, surprising, or involve significant trade-offs. Most routine implementation details do not require an ADR.

## When to Write an ADR

Write an ADR when:

- The decision is hard to reverse without significant rework
- The decision is surprising or counterintuitive
- The decision involves a significant trade-off (e.g., performance vs. complexity)
- The decision revises MVP non-goals or product boundaries
- The decision affects multiple gadgets or the core architecture

Do not write an ADR for:

- Routine implementation details
- Reversible choices (e.g., variable naming, component structure)
- Choices already covered by the foundation spec or CONTEXT.md
- Small bug fixes or copy changes

## ADR Format

Use the filename pattern: `NNN-short-description.md`

Example: `001-storage-migration-indexeddb.md`

Structure:

```markdown
# ADR NNN: Title

## Status

Accepted | Superseded | Deprecated

## Context

Why this decision is needed. What problem or opportunity triggered it.

## Decision

What was decided. Be specific.

## Consequences

What becomes easier, harder, or different as a result. Include both positive and negative consequences.

## Alternatives Considered

What else was considered and why it was not chosen.
```

## Current ADRs

None yet. This section will be updated as ADRs are created.

## Examples of ADR-Worthy Decisions

- Migrating from localStorage to IndexedDB
- Adding a new currency beyond BRL/ARS
- Introducing a state management library (e.g., Zustand, Jotai)
- Changing the routing library or strategy
- Revising MVP non-goals to add backend services or live APIs
- Adopting a new build tool or bundler
- Changing the PWA strategy or service worker approach

## Examples of Non-ADR Decisions

- Adding a new UI component
- Refactoring a utility function
- Fixing a bug in place sorting
- Adding a new field to a transaction note
- Updating test coverage
- Changing CSS styles or layout

## For Agents

Before creating an ADR:

1. Check if the decision meets the criteria above
2. Check if an existing ADR already covers the decision
3. If the decision is routine or reversible, skip the ADR
4. If the decision is significant, write the ADR and link it from the relevant task spec

ADRs are durable. Do not delete or overwrite them. Superseded ADRs should be marked as "Superseded" with a link to the new ADR.
