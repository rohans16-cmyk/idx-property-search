# Week 3 Checkpoint Notes

Property search endpoint with filters, validation, parameterized queries, and indexes.

## Curl examples (port 5001)

Start MySQL + API first:

```bash
docker start idx-mysql-local
cd /Users/rohanshah/idx-property-search/backend
npm run dev
```

### Standard execution

```bash
# Default page: 20 results + total
curl "http://localhost:5001/api/properties"

# Portland sample with limit=5
curl "http://localhost:5001/api/properties?city=Portland&limit=5"

# Pagination: page 3 when limit=10 (rows 21-30)
curl "http://localhost:5001/api/properties?limit=10&offset=20"
```

### Multi-filter execution

```bash
# city + minPrice + beds
curl "http://localhost:5001/api/properties?city=Portland&minPrice=300000&beds=3&limit=20&offset=0"

# zipcode + baths + maxPrice
curl "http://localhost:5001/api/properties?zipcode=97201&baths=2&maxPrice=900000"
```

### 400 validation errors

```bash
curl "http://localhost:5001/api/properties?limit=0"
curl "http://localhost:5001/api/properties?limit=200"
curl "http://localhost:5001/api/properties?offset=-1"
curl "http://localhost:5001/api/properties?minPrice=abc"
curl "http://localhost:5001/api/properties?beds=xyz"
```

Each should return HTTP **400** with a JSON body like `{ "error": "..." }`.

## SQL injection talking points (for your supervisor)

**Why is SQL injection dangerous?**

If we glued user input straight into SQL with string concatenation, a malicious visitor could change the query itself. Something like `city=Portland' OR '1'='1` could dump every listing—or worse, probe for data they should never see. Injection turns “search for Portland” into “run whatever SQL I want.”

**How do parameterized queries stop that?**

We never concat filters into the SQL string. We build a template with `?` placeholders and pass values in a separate array:

```javascript
pool.query(
  "SELECT ... FROM rets_property WHERE LOWER(TRIM(L_City)) = LOWER(TRIM(?))",
  [city]
);
```

The MySQL driver sends the SQL and the values separately. The database binds each value as **data**, not executable SQL. Even if someone sends `'; DROP TABLE rets_property; --`, it is treated as a city name to compare against—not as a command.

## Debug challenge retrospective: COUNT placeholder alignment

**The bug**

When both `minPrice` and `beds` were applied, the filtered `total` was wrong. The common mistake looked like this:

```javascript
const filterValues = [300000, 3]; // two placeholders in WHERE
const shared = [...filterValues, limit, offset]; // accidentally 4 values

await pool.query(countSql, shared); // COUNT only has 2 `?` placeholders
```

COUNT has only filter placeholders. Extra values (`limit`, `offset`) get bound to the wrong slots—so MySQL treats `beds` as `20` (the limit) instead of `3`. Result: wrong total whenever those filters are combined.

**The fix**

Keep two separate parameter arrays:

1. **COUNT** → only `filterValues`
2. **SELECT** → `[...filterValues, limit, offset]`

```javascript
await pool.query(countSql, filterValues);
await pool.query(selectSql, [...filterValues, limit, offset]);
```

That is exactly what `backend/routes/properties.js` does now, and the integration test hits `GET /api/properties?minPrice=300000&beds=3` to prove `total` matches the true filtered dataset length.

## File map

| File | Role |
|------|------|
| `backend/routes/properties.js` | `GET /api/properties` route |
| `backend/utils/propertyQuery.js` | validation + dynamic WHERE builder |
| `backend/server.js` | mounts router at `/api/properties` |
| `backend/tests/propertyFilters.test.js` | unit + HTTP integration tests |
| `sql/add_property_indexes.sql` | filter indexes |
| `sql/explain_property_queries.sql` | EXPLAIN before/after |

## Column mapping

| Query param | MLS column |
|-------------|------------|
| `city` | `L_City` (`LOWER(TRIM())` both sides) |
| `zipcode` | `L_Zip` |
| `minPrice` / `maxPrice` | `L_SystemPrice` |
| `beds` | `L_Keyword2` |
| `baths` | `LM_Dec_3` |

## Run tests

```bash
cd /Users/rohanshah/idx-property-search/backend
npm test
```
