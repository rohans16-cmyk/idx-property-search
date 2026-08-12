# Week 8 — Property Detail Page End-to-End

## Run it

```bash
docker start idx-mysql-local
cd /Users/rohanshah/idx-property-search/backend && npm run dev
cd /Users/rohanshah/idx-property-search/frontend && BROWSER=none npm start
cd /Users/rohanshah/idx-property-search/frontend && CI=true npm test -- --watchAll=false
```

Open **http://localhost:3000**

Optional official Maps Embed key (restart React after adding):

```bash
# frontend/.env  (gitignored)
REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

Without a key the map still embeds via the public `output=embed` URL so the demo works.

## File map

| File | Role |
|------|------|
| `src/setupProxy.js` | Dev proxy: `/api/*` → Express `:5001` (not `/property/:id`) |
| `src/App.js` | React Router: `/` listings, `/property/:id` detail |
| `src/pages/PropertyDetailPage.js` | Price, address, stats, description, details, map, open houses |
| `src/components/PropertyImageCarousel.js` | Card photos, arrows, `X / Y`, `stopPropagation` |
| `src/components/PropertyImageGallery.js` | Main + thumb strip + lightbox |
| `src/components/PropertyMap.js` | Maps iframe + Get Directions |
| `src/components/OpenHouseList.js` | Date, times, remarks from `all_data` |
| `src/utils/openHouses.js` | `JSON.parse(all_data).OpenHouseRemarks` |

## Debug challenges

**Remarks never show.** `all_data` is a JSON string. Remarks are `OpenHouseRemarks` inside that blob, not a SQL column. Parse in React (`getOpenHouseRemarks`); do not change the backend.

**Escape does not close the lightbox.** A `div` is not focusable by default, so its `onKeyDown` never fires. Fix: `tabIndex={0}` on the lightbox and focus it when it opens. Arrow keys also navigate photos.

## Demo listings

| Need | ID | Notes |
|------|-----|--------|
| Multi-photo + map | `1118422731` | 1461 Laurel Way, Beverly Hills (9 photos) |
| Open-house remarks | `1174690153` | Remarks in `all_data` |
| Invalid id | `/property/invalid-id!` | Error, no crash |

## Checkpoint

- [x] Card click → `/property/[id]`
- [x] Back to listings
- [x] Detail fields: price, address, beds/baths/sqft/year, description, details
- [x] Carousel: arrows cycle, counter `X / Y`, arrows do not navigate
- [x] Gallery: thumbs update main; main opens lightbox
- [x] Lightbox: click-outside + Escape; arrows change photo
- [x] Map only when lat + lng present; Get Directions in a new tab
- [x] Open houses: date, formatted times, remarks; empty copy if none
- [x] Invalid id shows an error
