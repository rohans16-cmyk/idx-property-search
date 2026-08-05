# Week 6 — Filters UI + Unit Testing

## Run it

```bash
# Terminal 1 — MySQL + API (PORT=5001)
open -a Docker   # if daemon isn't running
docker start idx-mysql-local
# If the container is missing (fresh Docker), recreate + re-import:
# docker run -d --name idx-mysql-local -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=rets -p 3306:3306 mysql:8
# docker exec -i idx-mysql-local mysql -uroot -prootpassword rets < sql/rets_property.sql
# docker exec -i idx-mysql-local mysql -uroot -prootpassword rets < sql/rets_openhouse.sql
# docker exec -i idx-mysql-local mysql -uroot -prootpassword rets < sql/add_property_indexes.sql

cd /Users/rohanshah/idx-property-search/backend
npm run dev

# Terminal 2 — React
cd /Users/rohanshah/idx-property-search/frontend
BROWSER=none npm start

# Terminal 3 — unit tests
cd /Users/rohanshah/idx-property-search/frontend
CI=true npm test -- --watchAll=false
```

Open **http://localhost:3000**

**Sample cities in this dump (not Austin):** Los Angeles, San Diego, San Jose, Irvine…

## File map

| File | Role |
|------|------|
| `src/components/PropertyFilters.js` | Controlled filter form (city, zipcode, min/max price, beds, baths) + `sanitizeFilters` |
| `src/pages/ListingsPage.js` | Wires filters → `fetchProperties`, Clear, empty state, **request-id race guard** |
| `src/api/client.test.js` | ≥3 unit tests for API client (`fetch` mocked) |
| `src/components/PropertyFilters.test.js` | ≥3 unit tests for filters UI |
| `src/setupTests.js` | Loads `@testing-library/jest-dom` |

## Filter → API query params

Frontend sends only non-empty values. Names match backend `parseQueryParams`:

- `city`, `zipcode`, `minPrice`, `maxPrice`, `beds`, `baths`

## Debug challenge — stale search flash

**Symptom:** Search city A → Clear → Search city B, and A's results briefly flash before B's.

**Cause:** Overlapping async fetches. An older `fetchProperties` call finishes after a newer Search/Clear started, calls `setLoading(false)` + `setData(...)`, and paints stale results.

**Fix:** `requestIdRef` in `ListingsPage`. Each load bumps the id; only the matching (latest) response may update state. Clear also passes `{}` directly into `loadProperties` (no stale React state closure).

## Unit testing talking points

- **Unit test:** Tests one function/component in isolation (API client or form), not the whole stack.
- **Mocking:** Replace a real dependency with a fake you control (`jest.fn()`).
- **Why mock `fetch`?** So tests don't need the backend/DB, run fast/deterministically, and can force success vs error responses.

## Checkpoint

- [x] Six filter inputs + Search / Clear Filters
- [x] Combined filters hit `/api/properties`
- [x] Empty values omitted from query string
- [x] Clear resets form and reloads unfiltered list
- [x] “No properties found” empty state
- [x] `npm test` — 10 passing
- [x] Async race / flash bug fixed with request id
