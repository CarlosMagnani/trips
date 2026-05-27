# Task Specs

Implementation-ready specs for specific features, bugs, refactors, or changes.

## Purpose

Each spec in this folder describes a single change or closely related change set. Specs are written before implementation and guide the development process.

Specs are **not** durable product truth. They are historical artifacts after implementation. For durable project context, see [CONTEXT.md](../../CONTEXT.md). For durable product definition, see [docs/trips-pwa-project-foundation.md](../trips-pwa-project-foundation.md).

## Naming Convention

Use descriptive names that indicate the type of change:

- `feature-name.md` - New feature or capability
- `bug-fix-description.md` - Bug fix
- `refactor-component.md` - Refactoring or technical improvement
- `ui-component-name.md` - UI or design change
- `quality-test-coverage.md` - Testing or quality improvement

Examples:

- `dark-mode-toggle.md`
- `fix-places-sorting-determinism.md`
- `refactor-storage-adapter.md`
- `ui-converter-result-card.md`

## Lifecycle

1. **Draft** - Spec is written using the template
2. **Review** - Spec is reviewed using the checklist
3. **Implementation** - Spec guides development
4. **Completed** - Spec remains as historical artifact

Completed specs may become outdated if product behavior changes. Always check CONTEXT.md and the foundation spec for current product truth.

## Template

Use [docs/specs/_template.md](./_template.md) to create new specs.

## Checklist

Use [docs/specs/_checklist.md](./_checklist.md) to review specs before implementation.

## When to Write a Spec

See [docs/spec-first-workflow.md](../spec-first-workflow.md) for guidance on when a spec is required versus when an issue description is sufficient.
