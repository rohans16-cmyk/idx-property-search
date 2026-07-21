USE rets;

SET SESSION sql_mode = '';

-- Week 3: indexes for GET /api/properties filters

-- Optional: capture EXPLAIN output before creating indexes
-- EXPLAIN SELECT ... FROM rets_property WHERE ...;

CREATE INDEX idx_rets_property_zip ON rets_property (L_Zip);
CREATE INDEX idx_rets_property_price ON rets_property (L_SystemPrice);
CREATE INDEX idx_rets_property_beds ON rets_property (L_Keyword2);
CREATE INDEX idx_rets_property_baths ON rets_property (LM_Dec_3);

-- Functional index so LOWER(TRIM(L_City)) comparisons can use a key
CREATE INDEX idx_rets_property_city_lower ON rets_property ((LOWER(TRIM(L_City))));

-- Composite index for a common city + price filter combination
CREATE INDEX idx_rets_property_city_price ON rets_property (
  (LOWER(TRIM(L_City))),
  L_SystemPrice
);

-- Verify indexes:
-- SHOW INDEXES FROM rets_property;
