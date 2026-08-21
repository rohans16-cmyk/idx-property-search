# Week 9 — Sorting + Favorites + Performance

Chosen advanced feature: **Option 3 (Sorting + Favorites)**.

## Run it

```bash
docker start idx-mysql-local
# apply Week 9 composite indexes once:
docker exec -i idx-mysql-local mysql -uroot -prootpassword < sql/week9_composite_indexes.sql

cd /Users/rohanshah/idx-property-search/backend && npm run dev
cd /Users/rohanshah/idx-property-search/frontend && BROWSER=none npm start
cd /Users/rohanshah/idx-property-search/backend && npm test
cd /Users/rohanshah/idx-property-search/frontend && CI=true npm test -- --watchAll=false
```

Open **http://localhost:3000**

## Part A — Sorting

| Piece | Behavior |
|-------|----------|
| Backend | `sortBy` + `sortOrder` on `GET /api/properties` |
| Whitelist | `L_SystemPrice`, `ListingContractDate`, `LM_Int2_3`, `L_Keyword2` |
| Invalid `sortBy` | HTTP **400** |
| Frontend | Sort controls on listings page |
| Persist | Sort kept when changing pages |
| Reset | Sort clears when Search / Clear Filters runs |

### Curl

```bash
curl "http://localhost:5001/api/properties?sortBy=L_SystemPrice&sortOrder=ASC&limit=5"
curl "http://localhost:5001/api/properties?sortBy=L_SystemPrice&sortOrder=DESC&limit=5"
curl "http://localhost:5001/api/properties?sortBy=ListingContractDate&sortOrder=DESC&limit=5"
curl "http://localhost:5001/api/properties?sortBy=ListPrice"   # → 400
```

## Part A — Favorites

| Piece | Behavior |
|-------|----------|
| Hook | `useFavorites` persists listing IDs in `localStorage` |
| UI | Heart on each `PropertyCard` (`stopPropagation`) |
| View | `/favorites` shows only saved listings |
| Count | Badge in primary nav |

## Part B — Performance

### Request timing

`backend/middleware/requestLogger.js` already logs duration in ms, e.g.

```text
[2026-08-21T01:18:47.062Z] GET /api/properties?minPrice=300000&beds=3 → 200 (20.6 ms)
```

### EXPLAIN (after Week 9 indexes)

Most complex filter: Beverly Hills + price band + beds ≥ 3.

| Column | Meaning (talking points) |
|--------|--------------------------|
| `id` / `select_type` | Query block identity |
| `table` | Scanned table (`rets_property`) |
| `type` | Access method (`ref` = index lookup) |
| `possible_keys` | Candidate indexes |
| `key` | Index actually chosen |
| `rows` | Estimated rows examined |
| `Extra` | Notes (`Using where`, `Using filesort`) |

Observed after `sql/week9_composite_indexes.sql`:

- COUNT + SELECT both chose **`idx_rets_property_city_beds_price`**
- Estimated **~287 rows** (city match) instead of a full table scan
- SELECT still shows `Using filesort` when ordering by price (acceptable; sort index helps other paths)

### New composite indexes

See `sql/week9_composite_indexes.sql`:

- `idx_rets_property_zip_price`
- `idx_rets_property_price_beds`
- `idx_rets_property_city_beds_price`
- `idx_rets_property_list_date`
- `idx_rets_property_sqft`

### Error Boundary

`ErrorBoundary` wraps routes in `App.js` and shows a recovery UI with **Try again**.

## File map

| File | Role |
|------|------|
| `backend/utils/propertyQuery.js` | sort whitelist + validation |
| `backend/routes/properties.js` | `ORDER BY` from whitelist only |
| `frontend/src/components/SortControls.js` | sort UI |
| `frontend/src/hooks/useFavorites.js` | favorites persistence |
| `frontend/src/hooks/FavoritesContext.js` | shared favorites state |
| `frontend/src/pages/FavoritesPage.js` | favorites view |
| `frontend/src/components/ErrorBoundary.js` | render-error recovery |
| `sql/week9_composite_indexes.sql` | Part B indexes |
| `sql/week9_explain_queries.sql` | EXPLAIN harness |

## Checkpoint

- [x] Sorting by price ASC/DESC works
- [x] Sorting by date listed works (`ListingContractDate`)
- [x] Invalid `sortBy` → 400
- [x] Sort persists across pages; resets on filter change
- [x] Favorites persist across refresh via custom hook
- [x] Unfavorite removes immediately from Favorites view
- [x] Heart filled/empty + favorites count in nav
- [x] EXPLAIN documented + composite indexes added
- [x] Request logs include ms timing
- [x] Error Boundary implemented + tested
