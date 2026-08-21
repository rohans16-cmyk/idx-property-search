USE rets;

SET SESSION sql_mode = '';

-- Week 9 Part B: composite indexes for common filter combinations.
-- Re-run may error if indexes already exist — that is OK.

-- ZIP + price (common "neighborhood budget" search)
CREATE INDEX idx_rets_property_zip_price ON rets_property (L_Zip, L_SystemPrice);

-- Price + beds (budget + size without city)
CREATE INDEX idx_rets_property_price_beds ON rets_property (L_SystemPrice, L_Keyword2);

-- City + beds + price (most complex UI filter combo)
CREATE INDEX idx_rets_property_city_beds_price ON rets_property (
  (LOWER(TRIM(L_City))),
  L_Keyword2,
  L_SystemPrice
);

-- Support Week 9 sort-by date / sqft
CREATE INDEX idx_rets_property_list_date ON rets_property (ListingContractDate);
CREATE INDEX idx_rets_property_sqft ON rets_property (LM_Int2_3);

-- Verify:
-- SHOW INDEXES FROM rets_property;
