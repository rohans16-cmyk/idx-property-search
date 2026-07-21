# IDX Internship — Week 1 & 2 Demo Cheat Sheet

**Project:** `/Users/rohanshah/idx-property-search`  
**Open in VS Code:** `code /Users/rohanshah/idx-property-search`

---

## Setup (do this first)

| Terminal 1 | Terminal 2 |
|------------|------------|
| `cd backend && npm run dev` | Use for docker / curl / mysql |

Expect: `Server running on port 5000`

---

## WEEK 1 — Database Demo

### Show container running
```bash
docker ps
```
**Look for:** `idx-mysql-local` · port `3306` · status `Up`

**Say:** *"MySQL 8 runs in Docker so everyone uses the same version and it stays isolated from my Mac."*

### Show restart works
```bash
docker stop idx-mysql-local && docker start idx-mysql-local && docker ps
```

### Query the database
```bash
docker exec -it idx-mysql-local mysql -uroot -prootpassword rets
```

```sql
SHOW TABLES;
SELECT COUNT(*) FROM rets_property;    -- expect ~53,122
SELECT COUNT(*) FROM rets_openhouse;   -- expect ~4,282
DESCRIBE rets_property;
DESCRIBE rets_openhouse;
SELECT L_ListingID, L_Address, L_City, L_State, L_SystemPrice, L_Keyword2, LM_Dec_3
FROM rets_property LIMIT 3;
EXIT;
```

### Key columns to explain

| Column | What it is |
|--------|------------|
| `L_ListingID` | Unique listing ID |
| `L_Address`, `L_City`, `L_State`, `L_Zip` | Location |
| `L_SystemPrice` | Price |
| `L_Keyword2` | Bedrooms |
| `LM_Dec_3` | Bathrooms |
| `LM_Int2_3` | Square footage |
| `L_Photos` | JSON array of photo URLs |
| `LMD_MP_Latitude` / `LMD_MP_Longitude` | Map coordinates |
| `L_Remarks` | Description |
| `OpenHouseDate`, `OH_StartTime`, `OH_EndTime` | Open house schedule |
| `all_data` | JSON blob with extra open house details |

### Docker (if asked)
> *"A container packages an app + its dependencies in an isolated environment. I use it for MySQL so setup is consistent, easy to reset, and doesn't require a system-wide MySQL install."*

---

## WEEK 2 — Backend Demo

### Files to point to in VS Code

| File | Purpose |
|------|---------|
| `backend/server.js` | Express app, port 5000 |
| `backend/db/pool.js` | MySQL connection pool |
| `backend/routes/health.js` | `GET /api/health` |
| `backend/.env` | DB credentials (local only) |
| `backend/.gitignore` | Excludes `.env` and `node_modules/` |

**Say:** *"React never talks to MySQL directly — everything goes through this Express API."*

### Health check — connected
```bash
curl http://localhost:5000/api/health
```
**Expect:** `{"status":"ok","database":"connected"}`

**Say:** *"This runs `SELECT 1` through the pool to verify the DB is reachable."*

### Health check — disconnected (important!)
```bash
docker stop idx-mysql-local
curl -i http://localhost:5000/api/health
docker start idx-mysql-local
```
**Expect:** HTTP `500` + `{"status":"error","database":"disconnected",...}`

**Say:** *"The server stays up and returns 500 — it doesn't crash when MySQL is down."*

### Auto-restart (optional)
Edit + save `server.js` → nodemon restarts automatically.

---

## Talking Points (if asked)

### Connection pool
> *"A pool keeps reusable DB connections ready. Opening a new connection every request is slow and can hit MySQL's connection limit. The pool borrows and returns connections."*

### HTTP methods
| Method | Use |
|--------|-----|
| **GET** | Read data |
| **POST** | Create something new |
| **PUT** | Replace/update a resource |
| **DELETE** | Remove a resource |

### Status codes
| Code | When |
|------|------|
| **400** | Bad client input — `?minPrice=abc`, `?limit=0` |
| **404** | Resource doesn't exist — unknown listing ID |
| **500** | Server/DB failure — MySQL down, unhandled error |

---

## Demo Checklist

- [ ] `docker ps` → `idx-mysql-local` running
- [ ] Both tables exist, counts > 0
- [ ] `DESCRIBE` both tables
- [ ] `npm run dev` — no errors
- [ ] `/api/health` → OK when MySQL up
- [ ] `/api/health` → 500 when MySQL stopped
- [ ] `.env` in `.gitignore`
- [ ] Can explain Docker, pool, HTTP methods, status codes

---

## If something breaks

```bash
docker start idx-mysql-local          # MySQL not running
lsof -ti:5000 | xargs kill -9         # Port 5000 in use
cd backend && npm run dev             # Restart server
```

**DB password:** `rootpassword` · **Port:** 5000 (API) · 3306 (MySQL)
