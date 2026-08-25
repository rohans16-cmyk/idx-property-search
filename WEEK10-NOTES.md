# Week 10 — Git Workflow & Code Organization

## Goal

Professional Git history and a maintainable frontend layout.

## What shipped

| Requirement | Status |
|-------------|--------|
| `develop` branch; feature work off `develop` | Done |
| ≥ 5 conventional commits | Done (history + Week 10 commits) |
| ≥ 3 feature branches merged into `develop` | Done (see below) |
| `.github/pull_request_template.md` | Done |
| `PropertyCard` in own file + PropTypes | Done |
| `frontend/src` → `api/`, `components/`, `pages/`, `hooks/`, `utils/` | Already matched |
| No debug `console.log` / dead code / unused imports | Done |
| `npm run lint` passes | Done |

## Feature branches (merged into `develop`)

1. `feature/pr-template` — PR template
2. `feature/property-card-proptypes` — PropTypes + hook import cleanup
3. `feature/lint-and-cleanup` — ESLint script, backend syntax lint, notes

## Folder map (`frontend/src`)

| Folder | Responsibility |
|--------|----------------|
| `api/` | HTTP client helpers (`fetchProperties`, detail, open houses) |
| `components/` | Reusable UI (cards, filters, pagination, map, gallery, nav) |
| `pages/` | Route-level screens (listings, detail, favorites) |
| `hooks/` | Shared stateful logic (`useFavorites`, Favorites context) |
| `utils/` | Pure helpers (format, photos, coords, open-house remarks) |

## Lint

```bash
cd frontend && npm run lint
cd backend && npm run lint
```

Frontend uses ESLint (`react-app` + `no-console` except `warn`/`error`).
Backend uses `node --check` on source files (syntax gate).

Intentional logs kept:

- `backend/server.js` — startup port message
- `backend/middleware/requestLogger.js` — request timing (Week 9 Part B)
- `ErrorBoundary` — `console.error` for caught render failures

## Checkpoint

- [x] Conventional commit history tells a clear story
- [x] Three feature branches merged into `develop` (no direct commits to `main` for this week)
- [x] PR template present
- [x] PropertyCard PropTypes complete
- [x] Folder structure matches guide
- [x] Linters pass
