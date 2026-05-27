# Spec-First Workflow

This repository uses a **spec-first** workflow: write a structured, behavior-oriented spec before changing code. This is not spec-anchored (maintaining specs indefinitely) or spec-as-source (generating code only from specs). It is a practical middle ground that keeps overhead low while ensuring agents and humans start from shared context.

Reference: [Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) by Birgitta Boeckeler.

## What is a Spec?

A spec is a structured, behavior-oriented Markdown artifact that expresses software functionality and guides implementation. It describes what should happen, not how to implement every detail.

Specs are different from:

- **Project context** (CONTEXT.md) - durable across many tasks
- **Foundation spec** - durable product definition
- **Code comments** - implementation details
- **Issue descriptions** - problem statements without structured acceptance criteria

## When to Write a Spec

### Small Bug or Copy-Only Change

**No spec file needed.** The issue description or comment is enough if it states:

- Current behavior (what happens now)
- Desired behavior (what should happen)
- Validation (how to verify the fix)

Example: "The converter shows 'ARS' instead of '$' for the result label. Change to use the currency symbol. Verify by converting 100 BRL at rate 180 and checking the result shows '$ 18,000.00'."

### Normal Feature, Refactor, UI, or Quality Task

**Write or update one implementation spec** in `docs/specs/` before code. This is the default path for most work.

The spec should cover:

- Summary and goals
- Current behavior and desired behavior
- Functional requirements
- Technical design (affected areas, data model changes, API changes)
- Test plan
- Acceptance criteria
- Risks and edge cases

Use the template: [docs/specs/_template.md](./specs/_template.md)

### Broad Architecture or Irreversible Decision

**Write a spec and consider an ADR** if the decision meets ADR criteria (see [docs/adr/README.md](./adr/README.md)).

Examples:

- Changing the storage layer from localStorage to IndexedDB
- Adding a new currency beyond BRL/ARS
- Introducing a state management library
- Revising MVP non-goals (e.g., adding backend services)

## Workflow Steps

### 1. Read Project Context

Before writing a spec or starting implementation:

- Read [CONTEXT.md](../CONTEXT.md) for domain terms and boundaries
- Read the relevant task spec if one exists
- Read the foundation spec if the task touches product decisions

### 2. Write or Update the Spec

For normal work:

- Create a new spec file in `docs/specs/` using the template
- Name it descriptively: `feature-name.md`, `bug-fix-description.md`, `refactor-component.md`
- Fill in all sections, especially acceptance criteria and test plan
- Keep it focused on one change or closely related change set

For small bugs:

- Skip the spec file
- Ensure the issue description covers current behavior, desired behavior, and validation

### 3. Review the Spec

Use the checklist: [docs/specs/_checklist.md](./specs/_checklist.md)

Key questions:

- Is the scope clear and bounded?
- Are acceptance criteria testable?
- Does the spec align with CONTEXT.md boundaries?
- Are risks and edge cases addressed?

### 4. Implement

- Use the spec as guidance, not as a substitute for verification
- Run tests, typecheck, and lint after implementation
- Update the spec if implementation reveals gaps (but do not let specs drift from product truth)

### 5. Verify

- Run the test plan defined in the spec
- Manually verify acceptance criteria
- Check that the change does not violate CONTEXT.md boundaries

### 6. Archive or Update

After implementation:

- Completed task specs may remain in `docs/specs/` as historical artifacts
- If the change affects durable product behavior, update CONTEXT.md or the foundation spec
- Do not treat completed specs as automatically durable product truth

## What This Workflow Avoids

**Spec-anchored overhead:** We do not maintain specs indefinitely or treat them as living artifacts for the lifetime of a feature. Completed specs are historical, not automatically current.

**Spec-as-source generation:** We do not generate code only from specs or prevent humans from editing code directly. Specs guide implementation; they do not replace it.

**Over-engineering for small changes:** A one-line bug fix does not require a multi-file spec. The issue description is enough.

**Under-specifying large features:** A broad refactor or new feature should have a clear spec before implementation starts. If the problem is too vague, refine the spec or ask for clarification before coding.

## Examples

### Small Bug (No Spec File)

**Issue:** "Places list does not sort deterministically when distances are equal."

**Comment:** "Current: Places with equal distance appear in arbitrary order. Desired: Sort by createdAt ascending when distances are equal. Validation: Add two places with distance 5km, verify the older one appears first."

**Action:** Implement the fix, add a test, verify.

### Normal Feature (Spec File)

**Issue:** "Add dark mode toggle."

**Spec:** `docs/specs/dark-mode-toggle.md`

- Summary: Add a theme toggle to the app shell
- Goals: Support light and dark themes, persist preference locally
- Current behavior: App uses light theme only
- Desired behavior: User can toggle theme, preference persists
- Functional requirements: Toggle button in header, localStorage for preference, CSS variables for theme colors
- Technical design: Add theme context, update CSS variables, add toggle component
- Test plan: Unit test for theme persistence, manual test for visual appearance
- Acceptance criteria: Toggle visible, theme switches, preference persists after refresh
- Risks: Color contrast in dark mode, flash of wrong theme on load

**Action:** Write the spec, review with checklist, implement, verify.

### Architecture Decision (Spec + ADR)

**Issue:** "Migrate storage from localStorage to IndexedDB."

**Spec:** `docs/specs/storage-migration-indexeddb.md`

- Summary: Replace localStorage with IndexedDB for larger datasets
- Goals: Support attachments, search, and larger transaction histories
- Current behavior: All data in localStorage under `trips:v1`
- Desired behavior: IndexedDB with versioned schema, migration from localStorage
- Functional requirements: Storage adapter interface, migration script, fallback for unsupported browsers
- Technical design: New storage layer, migration on first load, update all gadgets
- Test plan: Migration tests, storage adapter tests, manual test for data preservation
- Acceptance criteria: Existing data migrates, new data uses IndexedDB, app works offline
- Risks: Migration failure, browser support, complexity increase

**ADR:** `docs/adr/001-storage-migration-indexeddb.md`

- Context: Why localStorage is no longer sufficient
- Decision: Use IndexedDB with a storage adapter
- Consequences: Increased complexity, better scalability, migration risk

**Action:** Write the spec and ADR, review both, implement, verify.

## For Agents

When starting a task:

1. Check if a spec exists in `docs/specs/` for this task
2. If yes, read it and use it as guidance
3. If no, determine if a spec is needed based on the criteria above
4. If a spec is needed and does not exist, stop and ask for clarification or create one for review
5. Do not implement large features without a spec
6. Do not create an ADR for routine implementation details

Specs guide implementation; they do not replace code review, tests, or human judgment.
