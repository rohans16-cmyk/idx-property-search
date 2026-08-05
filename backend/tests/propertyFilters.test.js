require("dotenv").config();

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const pool = require("../db/pool");
const { parseQueryParams, buildWhereClause } = require("../utils/propertyQuery");

test("parseQueryParams defaults limit to 20 and offset to 0", () => {
  const parsed = parseQueryParams({});
  assert.equal(parsed.limit, 20);
  assert.equal(parsed.offset, 0);
});

test("parseQueryParams rejects invalid limit and offset", () => {
  assert.equal(parseQueryParams({ limit: "0" }).error, "limit must be at least 1");
  assert.equal(
    parseQueryParams({ limit: "200" }).error,
    "limit must be at most 100"
  );
  assert.equal(
    parseQueryParams({ limit: "abc" }).error,
    "limit must be a valid number"
  );
  assert.equal(
    parseQueryParams({ offset: "-1" }).error,
    "offset must be a non-negative integer"
  );
});

test("parseQueryParams rejects invalid numeric filters", () => {
  assert.equal(
    parseQueryParams({ minPrice: "abc" }).error,
    "minPrice must be a valid number"
  );
  assert.equal(
    parseQueryParams({ beds: "xyz" }).error,
    "beds must be a valid number"
  );
});

test("buildWhereClause maps params to MLS columns with placeholders", () => {
  const { whereSql, values } = buildWhereClause({
    city: "Portland",
    zipcode: "97201",
    minPrice: 300000,
    maxPrice: 900000,
    beds: 3,
    baths: 2,
  });

  assert.match(whereSql, /LOWER\(TRIM\(L_City\)\) = LOWER\(TRIM\(\?\)\)/);
  assert.match(whereSql, /TRIM\(L_Zip\) = \?/);
  assert.match(whereSql, /L_SystemPrice >= \?/);
  assert.match(whereSql, /L_SystemPrice <= \?/);
  assert.match(whereSql, /CAST\(L_Keyword2 AS UNSIGNED\) = \?/);
  assert.match(whereSql, /CAST\(LM_Dec_3 AS UNSIGNED\) = \?/);
  assert.deepEqual(values, ["Portland", "97201", 300000, 900000, 3, 2]);
});

test("buildWhereClause supports minBeds/minBaths as greater-or-equal", () => {
  const { whereSql, values } = buildWhereClause({
    minBeds: 6,
    minBaths: 6,
  });

  assert.match(whereSql, /CAST\(L_Keyword2 AS UNSIGNED\) >= \?/);
  assert.match(whereSql, /CAST\(LM_Dec_3 AS UNSIGNED\) >= \?/);
  assert.deepEqual(values, [6, 6]);
});

async function startTestServer() {
  const app = require("../server");
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

test("API integration: minPrice + beds total matches unpaginated dataset length", async (t) => {
  let server;

  try {
    server = await startTestServer();
  } catch (error) {
    t.skip(`Unable to start API server: ${error.message}`);
    return;
  }

  try {
    const health = await fetch(`${server.baseUrl}/api/health`);
    const healthBody = await health.json();
    if (!health.ok || healthBody.database !== "connected") {
      t.skip("Database unavailable — start idx-mysql-local and retry");
      return;
    }

    // Task 3: API call with both minPrice and beds together
    const apiRes = await fetch(
      `${server.baseUrl}/api/properties?minPrice=300000&beds=3&limit=20&offset=0`
    );
    assert.equal(apiRes.status, 200);

    const body = await apiRes.json();
    assert.equal(body.limit, 20);
    assert.equal(body.offset, 0);
    assert.ok(Array.isArray(body.results));
    assert.ok(body.results.length <= 20);

    // True unpaginated dataset length (no LIMIT/OFFSET interference on COUNT)
    const filters = { minPrice: 300000, beds: 3 };
    const { whereSql, values } = buildWhereClause(filters);
    const [truthCountRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM rets_property ${whereSql}`,
      values
    );
    const truthTotal = Number(truthCountRows[0].total);

    assert.equal(
      body.total,
      truthTotal,
      "API total must match the true filtered dataset length (proves COUNT params are not polluted by limit/offset)"
    );

    // Also fetch one full max page and confirm length matches min(total, 100)
    const fullPageRes = await fetch(
      `${server.baseUrl}/api/properties?minPrice=300000&beds=3&limit=100&offset=0`
    );
    assert.equal(fullPageRes.status, 200);
    const fullPage = await fullPageRes.json();
    assert.equal(fullPage.total, truthTotal);
    assert.equal(fullPage.results.length, Math.min(truthTotal, 100));

    for (const row of body.results) {
      assert.ok(Number(row.L_SystemPrice) >= 300000);
      assert.equal(Number.parseInt(row.L_Keyword2, 10), 3);
    }
  } finally {
    if (server) {
      await server.close();
    }
  }
});

test("API validation: invalid inputs return 400", async (t) => {
  let server;

  try {
    server = await startTestServer();
  } catch (error) {
    t.skip(`Unable to start API server: ${error.message}`);
    return;
  }

  try {
    const badLimit = await fetch(`${server.baseUrl}/api/properties?limit=0`);
    assert.equal(badLimit.status, 400);
    assert.ok((await badLimit.json()).error);

    const badPrice = await fetch(
      `${server.baseUrl}/api/properties?minPrice=abc`
    );
    assert.equal(badPrice.status, 400);
    assert.ok((await badPrice.json()).error);
  } finally {
    if (server) {
      await server.close();
    }
    await pool.end();
  }
});
