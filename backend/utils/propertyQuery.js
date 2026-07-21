const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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

  const minPrice = minPriceResult.value;
  const maxPrice = maxPriceResult.value;

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    return { error: "minPrice cannot be greater than maxPrice" };
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

  return {
    limit,
    offset,
    filters: {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds: bedsResult.value,
      baths: bathsResult.value,
    },
  };
}

function buildWhereClause(filters) {
  const conditions = [];
  const values = [];

  if (filters.city !== undefined) {
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

  if (filters.baths !== undefined) {
    conditions.push("CAST(LM_Dec_3 AS UNSIGNED) = ?");
    values.push(filters.baths);
  }

  const whereSql =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereSql, values };
}

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parseQueryParams,
  buildWhereClause,
};
