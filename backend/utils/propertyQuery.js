const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Whitelist of actual rets_property column names allowed for sortBy.
 * ORDER BY expressions may CAST text-ish MLS columns for numeric order.
 */
const SORT_COLUMNS = {
  L_SystemPrice: "L_SystemPrice",
  ListingContractDate: "ListingContractDate",
  LM_Int2_3: "LM_Int2_3",
  L_Keyword2: "CAST(L_Keyword2 AS UNSIGNED)",
};

const DEFAULT_SORT_BY = "L_ListingID";
const DEFAULT_SORT_ORDER = "ASC";

function parseNonNegativeInt(value, fieldName) {
  if (value === undefined || value === "") {
    return { value: undefined };
  }

  const asNumber = Number(value);
  if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) {
    return { error: `${fieldName} must be a valid number` };
  }

  if (!Number.isInteger(asNumber) || asNumber < 0) {
    return { error: `${fieldName} must be a non-negative integer` };
  }

  return { value: asNumber };
}

function parseNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === "") {
    return { value: undefined };
  }

  const asNumber = Number(value);
  if (Number.isNaN(asNumber) || !Number.isFinite(asNumber)) {
    return { error: `${fieldName} must be a valid number` };
  }

  if (asNumber < 0) {
    return { error: `${fieldName} must be a non-negative number` };
  }

  return { value: asNumber };
}

function parseQueryParams(query) {
  const limitResult =
    query.limit === undefined || query.limit === ""
      ? { value: DEFAULT_LIMIT }
      : parseNonNegativeInt(query.limit, "limit");

  if (limitResult.error) {
    return { error: limitResult.error };
  }

  const offsetResult =
    query.offset === undefined || query.offset === ""
      ? { value: 0 }
      : parseNonNegativeInt(query.offset, "offset");

  if (offsetResult.error) {
    return { error: offsetResult.error };
  }

  const limit = limitResult.value;
  const offset = offsetResult.value;

  if (limit < 1) {
    return { error: "limit must be at least 1" };
  }

  if (limit > MAX_LIMIT) {
    return { error: `limit must be at most ${MAX_LIMIT}` };
  }

  if (offset < 0) {
    return { error: "offset cannot be negative" };
  }

  const minPriceResult = parseNonNegativeNumber(query.minPrice, "minPrice");
  if (minPriceResult.error) {
    return { error: minPriceResult.error };
  }

  const maxPriceResult = parseNonNegativeNumber(query.maxPrice, "maxPrice");
  if (maxPriceResult.error) {
    return { error: maxPriceResult.error };
  }

  const bedsResult = parseNonNegativeInt(query.beds, "beds");
  if (bedsResult.error) {
    return { error: bedsResult.error };
  }

  const bathsResult = parseNonNegativeInt(query.baths, "baths");
  if (bathsResult.error) {
    return { error: bathsResult.error };
  }

  const minBedsResult = parseNonNegativeInt(query.minBeds, "minBeds");
  if (minBedsResult.error) {
    return { error: minBedsResult.error };
  }

  const minBathsResult = parseNonNegativeInt(query.minBaths, "minBaths");
  if (minBathsResult.error) {
    return { error: minBathsResult.error };
  }

  const minPrice = minPriceResult.value;
  const maxPrice = maxPriceResult.value;

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    return { error: "minPrice cannot be greater than maxPrice" };
  }

  if (
    bedsResult.value !== undefined &&
    minBedsResult.value !== undefined
  ) {
    return { error: "beds and minBeds cannot be used together" };
  }

  if (
    bathsResult.value !== undefined &&
    minBathsResult.value !== undefined
  ) {
    return { error: "baths and minBaths cannot be used together" };
  }

  const city =
    query.city === undefined || query.city === ""
      ? undefined
      : String(query.city).trim();
  const zipcode =
    query.zipcode === undefined || query.zipcode === ""
      ? undefined
      : String(query.zipcode).trim();

  if (city !== undefined && city.length === 0) {
    return { error: "city cannot be empty" };
  }

  if (zipcode !== undefined && zipcode.length === 0) {
    return { error: "zipcode cannot be empty" };
  }

  const sortResult = parseSortParams(query.sortBy, query.sortOrder);
  if (sortResult.error) {
    return { error: sortResult.error };
  }

  return {
    limit,
    offset,
    sortBy: sortResult.sortBy,
    sortOrder: sortResult.sortOrder,
    orderBySql: sortResult.orderBySql,
    filters: {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds: bedsResult.value,
      baths: bathsResult.value,
      minBeds: minBedsResult.value,
      minBaths: minBathsResult.value,
    },
  };
}

function parseSortParams(sortByRaw, sortOrderRaw) {
  const hasSortBy = sortByRaw !== undefined && sortByRaw !== "";
  const hasSortOrder = sortOrderRaw !== undefined && sortOrderRaw !== "";

  if (!hasSortBy && !hasSortOrder) {
    return {
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER,
      orderBySql: `${DEFAULT_SORT_BY} ${DEFAULT_SORT_ORDER}`,
    };
  }

  if (!hasSortBy) {
    return { error: "sortBy is required when sortOrder is provided" };
  }

  const sortBy = String(sortByRaw).trim();
  if (!Object.prototype.hasOwnProperty.call(SORT_COLUMNS, sortBy)) {
    return {
      error: `sortBy must be one of: ${Object.keys(SORT_COLUMNS).join(", ")}`,
    };
  }

  let sortOrder = DEFAULT_SORT_ORDER;
  if (hasSortOrder) {
    const normalized = String(sortOrderRaw).trim().toUpperCase();
    if (normalized !== "ASC" && normalized !== "DESC") {
      return { error: "sortOrder must be ASC or DESC" };
    }
    sortOrder = normalized;
  }

  const columnExpr = SORT_COLUMNS[sortBy];
  // Tie-break on listing id so pagination stays stable when values collide.
  return {
    sortBy,
    sortOrder,
    orderBySql: `${columnExpr} ${sortOrder}, L_ListingID ASC`,
  };
}

function buildWhereClause(filters) {
  const conditions = [];
  const values = [];

  if (filters.city !== undefined) {
    // MLS city strings vary in casing ("portland" vs "Portland"); normalize both sides.
    conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
    values.push(filters.city);
  }

  if (filters.zipcode !== undefined) {
    conditions.push("TRIM(L_Zip) = ?");
    values.push(filters.zipcode);
  }

  if (filters.minPrice !== undefined) {
    conditions.push("L_SystemPrice >= ?");
    values.push(filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    conditions.push("L_SystemPrice <= ?");
    values.push(filters.maxPrice);
  }

  if (filters.beds !== undefined) {
    conditions.push("CAST(L_Keyword2 AS UNSIGNED) = ?");
    values.push(filters.beds);
  }

  if (filters.minBeds !== undefined) {
    conditions.push("CAST(L_Keyword2 AS UNSIGNED) >= ?");
    values.push(filters.minBeds);
  }

  if (filters.baths !== undefined) {
    conditions.push("CAST(LM_Dec_3 AS UNSIGNED) = ?");
    values.push(filters.baths);
  }

  if (filters.minBaths !== undefined) {
    conditions.push("CAST(LM_Dec_3 AS UNSIGNED) >= ?");
    values.push(filters.minBaths);
  }

  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereSql, values };
}

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  SORT_COLUMNS,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  parseQueryParams,
  parseSortParams,
  buildWhereClause,
};
