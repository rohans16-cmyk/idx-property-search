# Week 5 — React Listings Page

## Run it

```bash
# Terminal 1 — API
# NOTE: Mac AirPlay Receiver often owns port 5000, so Express uses 5001
# (backend/.env has PORT=5001). Proxy must match.
docker start idx-mysql-local
cd /Users/rohanshah/idx-property-search/backend
npm run dev

# Terminal 2 — React (port 3000)
cd /Users/rohanshah/idx-property-search/frontend
npm start
```

Open **http://localhost:3000**

Proxy in `frontend/package.json`:

```json
"proxy": "http://localhost:5001"
```

CRA forwards `/api/*` to Express during local dev. Restart `npm start` after changing proxy.

## File map

| File | Role |
|------|------|
| `src/api/client.js` | `fetchProperties`, `fetchPropertyDetail`, `fetchOpenHouses` |
| `src/pages/ListingsPage.js` | Grid page + loading/error/count |
| `src/components/PropertyCard.js` | Photo, price, address, city/state, beds/baths/sqft |
| `src/utils/photos.js` | Defensive `L_Photos` parsing |

## Debug challenge — broken images

**Symptom:** Some cards show images; others are broken or the UI crashes.

**Investigation:** `L_Photos` is a **JSON string** in MySQL. It is not always a valid array:
- `null` / empty string
- malformed JSON
- `[]` (no photos)
- occasionally a single URL string

Blind `JSON.parse(property.L_Photos)[0]` crashes or yields `undefined` `src`.

**Fix:** `parsePhotoUrls()` / `getPrimaryPhotoUrl()` wrap parse in `try/catch`, accept arrays or lone URLs, and fall back to a “No photo” placeholder. Image `onError` also hides dead URLs.

## Checkpoint

- [x] React on port 3000
- [x] Real listing grid from `/api/properties`
- [x] First photo parsed safely from `L_Photos`
- [x] Loading + error states
- [x] “Showing X of Y properties”
- [x] Card hover effect
- [x] API client throws meaningful HTTP errors

## Screen-share checklist (Week 5 meeting)

See the list in chat / below — do these live in order.
