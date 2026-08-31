# Week 11 — Comprehensive Testing & Documentation

## Goal

70%+ test coverage on critical paths and a complete README for onboarding.

## What shipped

| Requirement | Status |
|-------------|--------|
| Backend route tests (Jest + Supertest, mocked pool) | Done — `backend/tests/properties.routes.test.js` |
| `GET /api/properties` — success, pagination, filters, invalid inputs | Done |
| `GET /api/properties/:id` — success, 404, invalid ID | Done |
| `GET /api/properties/:id/openhouses` — success, empty, 404 | Done |
| Frontend: PropertyFilters tests | Done (Week 6+) |
| Frontend: Pagination tests | Done (Week 7+) |
| Frontend: PropertyCard tests (data + navigation + favorites) | Done |
| 70%+ coverage on `routes/properties.js` | Done — 100% in Jest report |
| 70%+ coverage on frontend components | Done — ~79% statements / ~83% lines |
| `README.md` — setup, architecture, API, schema, known issues | Done |
| Inline comments on non-obvious logic | Done (query building, photos, pagination, route order) |

## Run tests

```bash
# Everything (from repo root)
npm test

# Backend — mocked routes (no Docker required)
cd backend && npm run test:unit

# Backend — optional live DB integration
cd backend && npm run test:integration

# Frontend with component coverage
cd frontend && CI=true npm test -- --watchAll=false --coverage \
  --collectCoverageFrom='src/components/**/*.{js,jsx}' \
  --collectCoverageFrom='!src/**/*.test.js'
```

## Backend test layout

| File | Runner | DB |
|------|--------|-----|
| `tests/properties.routes.test.js` | Jest + Supertest | Mocked `pool.query` |
| `tests/propertyFilters.test.js` | Node test | Live MySQL (skips if down) |
| `tests/propertyDetail.test.js` | Node test | Live MySQL (skips if down) |

Jest is configured in `backend/jest.config.js` with a 70% coverage threshold on `routes/properties.js`.

## Frontend coverage notes

Required components exceed 70%:

- `PropertyFilters.js` — 96%
- `Pagination.js` — 94–100%
- `PropertyCard.js` — 100%

`AppNav.js` and `SortControls.js` are thin wrappers tested indirectly through page flows; overall component folder coverage stays above the guide target.

## README checklist

- [x] Project description
- [x] Tech stack with versions
- [x] Step-by-step setup from a fresh machine
- [x] API reference with example requests/responses
- [x] Database schema summary
- [x] Known issues and future improvements
- [ ] Screenshot — add `docs/screenshots/listings.png` before Week 12 demo

## Checkpoint

- [x] `npm test` passes in `backend/` and `frontend/`
- [x] Coverage targets met on critical files
- [x] README supports setup without tribal knowledge
- [x] Comments explain *why* (whitelist sort columns, route order, photo parsing, pagination ellipsis)

## Next: Week 12

Final demo & presentation — refresh `rets_property` / `rets_openhouse` from your team lead before presenting so image URLs stay valid.
