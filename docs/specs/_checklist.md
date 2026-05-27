# Spec Review Checklist

Use this checklist to review a spec before implementation begins.

## Clarity

- [ ] Summary is clear and concise (1-2 sentences)
- [ ] Goals are specific and measurable
- [ ] Non-goals explicitly exclude likely scope creep
- [ ] Current behavior accurately describes the starting point
- [ ] Desired behavior is specific and user-visible

## Scope

- [ ] Scope is bounded and achievable in one change set
- [ ] Spec does not mix unrelated changes
- [ ] If the scope is too large, it should be split into multiple specs
- [ ] If the scope is too vague, it should be refined before implementation

## Requirements

- [ ] Functional requirements are complete and unambiguous
- [ ] Domain rules are stated and align with CONTEXT.md
- [ ] Edge cases are identified with expected handling
- [ ] Validation and error handling are defined

## Technical Design

- [ ] Affected areas are identified
- [ ] Data model changes are documented (or explicitly "None")
- [ ] API changes are documented (or explicitly "None")
- [ ] Permissions changes are documented (or explicitly "None")
- [ ] Technical approach aligns with existing architecture

## Testing

- [ ] Unit test plan covers utility and logic changes
- [ ] Integration test plan covers cross-component behavior (if applicable)
- [ ] E2E test plan covers user flows (if applicable)
- [ ] Manual validation steps are defined
- [ ] Test plan is realistic for the scope

## Acceptance Criteria

- [ ] Acceptance criteria are testable and specific
- [ ] Criteria include standard checks: lint, typecheck, tests
- [ ] Criteria cover both happy path and error states
- [ ] Criteria are verifiable without reading the spec

## Alignment

- [ ] Spec aligns with CONTEXT.md product boundaries
- [ ] Spec does not violate MVP non-goals (no backend, no auth, no live APIs, etc.)
- [ ] If the spec revises non-goals, it explicitly states the revision
- [ ] Spec links to or references the foundation spec where relevant

## Risks

- [ ] Risks are identified with mitigations
- [ ] Open questions are resolved or documented
- [ ] Spec does not introduce dependencies on external services or APIs (unless explicitly revising non-goals)

## Developer Handoff

- [ ] Recommended assignee is identified
- [ ] Implementation order is clear
- [ ] "Read first" list is complete
- [ ] "Do not change" boundaries are explicit
- [ ] Definition of done is specific

## Final Check

- [ ] Spec is ready for implementation
- [ ] Reviewer has approved the spec
- [ ] Any blocking questions are resolved
