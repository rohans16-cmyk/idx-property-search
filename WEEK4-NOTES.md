# Week 4 — Property Detail & Open Houses

## Endpoints

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/properties/:id` | Full property object, or **404** |
| `GET` | `/api/properties/:id/openhouses` | Array of open houses (empty OK), ordered by date + start time |

Malformed / oversized IDs → **400**. Server errors → **500** (caught; no unhandled rejections).

## Why route order matters

Express matches routes **top to bottom**. In `routes/properties.js`:

1. `GET /`
2. `GET /:id/openhouses`  ← registered first among parameterized routes
3. `GET /:id`

If `/:id` were first, a request to `/api/properties/1174572339/openhouses` would bind `id = "1174572339/openhouses"` (or never reach the openhouses handler). Always register the more specific route before the catch-all param route.

## Request logging

Middleware logs every response:

```text
[2026-07-13T...] GET /api/properties/1174572339 → 200 (12.4 ms)
```

## Curl demos (port 5001)

```bash
docker start idx-mysql-local
cd backend && npm run dev

# Detail
curl "http://localhost:5001/api/properties/1174572339"

# 404
curl "http://localhost:5001/api/properties/9999999999"

# Open houses (empty array is OK)
curl "http://localhost:5001/api/properties/1174572339/openhouses"

# 400 — oversized ID
curl "http://localhost:5001/api/properties/$(python3 -c 'print(\"9\"*40)')"
```

## Debug challenge

**Symptom:** Open houses worked for most listings but one ID caused an **unhandled promise rejection**.

**Cause:** An `async` Express handler without `try/catch`. When MySQL throws (or when code assumes `rows[0]` exists / tries to parse bad JSON), the rejection escapes and Node prints `UnhandledPromiseRejection`.

**What can be “special” about a listing:**
- Missing property row if you skip the existence check and dereference `rows[0]`
- Odd DATE/TIME values that serialize poorly as JS `Date` objects
- Unexpected `all_data` if you forcefully `JSON.parse` it

**Fix we shipped:**
1. Validate the ID → 400
2. Confirm the property exists → 404
3. Query open houses with `CAST(... AS CHAR)` so dates stay JSON-safe
4. Return `all_data` as-is (frontend can parse)
5. Wrap the whole handler in `try/catch` → 500 with a message instead of crashing

## Checkpoint

- [x] Detail endpoint returns full property
- [x] Unknown ID → 404
- [x] Open houses → array (empty allowed), ordered
- [x] Bad IDs → 400
- [x] Request logs with method, URL, status, duration
- [x] `/openhouses` registered before `/:id`
