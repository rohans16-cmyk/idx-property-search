const express = require("express");
const pool = require("../db/pool");
const { parseQueryParams, buildWhereClause } = require("../utils/propertyQuery");
const { validateListingId } = require("../utils/listingId");

const router = express.Router();

const LIST_SELECT_FIELDS = `
  L_ListingID,
  L_Address,
  L_City,
  L_State,
  L_Zip,
  L_SystemPrice,
  L_Keyword2,
  LM_Dec_3,
  LM_Int2_3,
  L_Photos,
  L_Remarks
`;

// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  const parsed = parseQueryParams(req.query);

  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const { limit, offset, filters } = parsed;
  const { whereSql, values: filterValues } = buildWhereClause(filters);

  try {
    const countSql = `SELECT COUNT(*) AS total FROM rets_property ${whereSql}`;
    const [countRows] = await pool.query(countSql, filterValues);
    const total = Number(countRows[0].total);

    const selectSql = `
      SELECT ${LIST_SELECT_FIELDS}
      FROM rets_property
      ${whereSql}
      ORDER BY L_ListingID
      LIMIT ? OFFSET ?
    `;
    const [results] = await pool.query(selectSql, [
      ...filterValues,
      limit,
      offset,
    ]);

    return res.json({ total, limit, offset, results });
  } catch (error) {
    console.error("Property search failed:", error.message);
    return res.status(500).json({
      error: "Failed to search properties",
      message: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
// IMPORTANT: /:id/openhouses MUST be registered BEFORE /:id
// Express matches routes in definition order. If /:id came first,
// /1174572339/openhouses would bind id="1174572339/openhouses".
// ---------------------------------------------------------------------------
router.get("/:id/openhouses", async (req, res) => {
  const parsed = validateListingId(req.params.id);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const { id } = parsed;

  try {
    const [properties] = await pool.query(
      "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID '${id}' was not found`,
      });
    }

    // dateStrings avoids Invalid Date objects that can crash res.json()
    // for edge-case DATE/TIME values on some listings.
    const [openhouses] = await pool.query(
      `
        SELECT
          id,
          L_ListingID,
          L_DisplayId,
          CAST(OpenHouseDate AS CHAR) AS OpenHouseDate,
          CAST(OH_StartTime AS CHAR) AS OH_StartTime,
          CAST(OH_EndTime AS CHAR) AS OH_EndTime,
          CAST(OH_StartDate AS CHAR) AS OH_StartDate,
          CAST(OH_EndDate AS CHAR) AS OH_EndDate,
          all_data,
          updated_date,
          up_date,
          API_OH_StartDate,
          API_OH_EndDate
        FROM rets_openhouse
        WHERE L_ListingID = ?
        ORDER BY OpenHouseDate ASC, OH_StartTime ASC
      `,
      [id]
    );

    // Empty array is a valid response — not an error.
    return res.json(openhouses);
  } catch (error) {
    // Debug challenge: without this try/catch, a DB/serialize failure for
    // one listing becomes an unhandled promise rejection and crashes the route.
    console.error(`Open houses failed for listing ${id}:`, error.message);
    return res.status(500).json({
      error: "Failed to fetch open houses",
      message: error.message,
    });
  }
});

// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const parsed = validateListingId(req.params.id);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const { id } = parsed;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID '${id}' was not found`,
      });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error(`Property detail failed for listing ${id}:`, error.message);
    return res.status(500).json({
      error: "Failed to fetch property",
      message: error.message,
    });
  }
});

module.exports = router;
