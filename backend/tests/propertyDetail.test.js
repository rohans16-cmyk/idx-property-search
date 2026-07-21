require("dotenv").config({ quiet: true });

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const pool = require("../db/pool");
const { validateListingId } = require("../utils/listingId");

async function startTestServer() {
  const app = require("../server");
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    },
  };
}

test("validateListingId rejects malformed and oversized IDs", () => {
  assert.ok(validateListingId("").error);
  assert.ok(validateListingId("abc/openhouses").error);
  assert.ok(validateListingId("x".repeat(40)).error);
  assert.equal(validateListingId("1174572339").id, "1174572339");
});

test("GET /api/properties/:id and openhouses endpoints", async (t) => {
  let server;
  try {
    server = await startTestServer();
  } catch (error) {
    t.skip(error.message);
    return;
  }

  try {
    const health = await fetch(`${server.baseUrl}/api/health`);
    const healthBody = await health.json();
    if (!health.ok || healthBody.database !== "connected") {
      t.skip("Database unavailable");
      return;
    }

    const [sample] = await pool.query(`
      SELECT p.L_ListingID
      FROM rets_property p
      INNER JOIN rets_openhouse o ON o.L_ListingID = p.L_ListingID
      LIMIT 1
    `);
    assert.ok(sample.length > 0);
    const id = sample[0].L_ListingID;

    const detailRes = await fetch(`${server.baseUrl}/api/properties/${id}`);
    assert.equal(detailRes.status, 200);
    const detail = await detailRes.json();
    assert.equal(detail.L_ListingID, id);
    assert.ok(detail.L_Address !== undefined);

    const missingRes = await fetch(
      `${server.baseUrl}/api/properties/9999999999`
    );
    assert.equal(missingRes.status, 404);

    const badRes = await fetch(
      `${server.baseUrl}/api/properties/${"9".repeat(40)}`
    );
    assert.equal(badRes.status, 400);

    const ohRes = await fetch(
      `${server.baseUrl}/api/properties/${id}/openhouses`
    );
    assert.equal(ohRes.status, 200);
    const openhouses = await ohRes.json();
    assert.ok(Array.isArray(openhouses));
    assert.ok(openhouses.length >= 1);
    // Ordered by date then start time
    for (let i = 1; i < openhouses.length; i += 1) {
      const prev = `${openhouses[i - 1].OpenHouseDate} ${openhouses[i - 1].OH_StartTime}`;
      const curr = `${openhouses[i].OpenHouseDate} ${openhouses[i].OH_StartTime}`;
      assert.ok(prev <= curr);
    }

    // Property with no open houses → empty array, not 404
    const [lonely] = await pool.query(`
      SELECT p.L_ListingID
      FROM rets_property p
      LEFT JOIN rets_openhouse o ON o.L_ListingID = p.L_ListingID
      WHERE o.id IS NULL
      LIMIT 1
    `);
    if (lonely.length > 0) {
      const emptyRes = await fetch(
        `${server.baseUrl}/api/properties/${lonely[0].L_ListingID}/openhouses`
      );
      assert.equal(emptyRes.status, 200);
      assert.deepEqual(await emptyRes.json(), []);
    }
  } finally {
    if (server) await server.close();
    await pool.end();
  }
});
