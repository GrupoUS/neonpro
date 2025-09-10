# Governance Service Tests

Layering strategy:
- contract/: Public surface guarantees (service method behavior, invariants)
- scenario/: Multi-step behavioral flows spanning multiple services
- unit/: Pure deterministic helpers & calculation logic
- placeholder/: Structural presence tests (e.g., schema exports) pending real implementation

Execution Order: Create failing tests first (T005–T015) then implement models/helpers (T016–T020) then services (T021–T025).
