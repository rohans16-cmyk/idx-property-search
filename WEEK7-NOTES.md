# Week 7 — Pagination UI & Component Testing

## Run it

```bash
docker start idx-mysql-local
cd /Users/rohanshah/idx-property-search/backend && npm run dev
cd /Users/rohanshah/idx-property-search/frontend && BROWSER=none npm start
cd /Users/rohanshah/idx-property-search/frontend && CI=true npm test -- --watchAll=false
```

Open **http://localhost:3000**

## File map

| File | Role |
|------|------|
| `src/components/Pagination.js` | Prev/Next + page numbers + ellipsis; exports `getPageItems` |
| `src/components/Pagination.test.js` | First/last/middle, clicks, ellipsis, **near-end duplicate bug** |
| `src/pages/ListingsPage.js` | `currentPage` + `itemsPerPage`, offset fetch, filter → page 1, scroll top |

## Behavior

- Summary: **Showing X–Y of Z properties**
- Page change → `offset = (page - 1) * itemsPerPage`, keep filters, `window.scrollTo(0, 0)`
- New Search / Clear → reset to page **1**
- Pagination hidden when `totalPages <= 1`

## Debug challenge

**Bug:** Near the end, naive generators always append `totalPages` even when the window already includes it → duplicate last page (e.g. `1 … 8 9 10 … 10`).

**Fix:** Separate near-start / near-end / middle cases in `getPageItems`; near-end builds `[1, …, last-4 … last]` once. Covered by unit tests.

## Checkpoint

- [x] Pagination under the grid
- [x] Prev disabled on page 1; Next disabled on last page
- [x] Page number clicks work
- [x] Ellipsis for large counts
- [x] Showing X–Y of Z
- [x] Filters reset to page 1
- [x] Hidden when only one page
- [x] Tests pass (23 total including pagination)
