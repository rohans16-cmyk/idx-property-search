USE rets;

-- Week 9 EXPLAIN harness for the most complex filter query.
-- Run before/after sql/week9_composite_indexes.sql and compare `key` / `rows`.

EXPLAIN
SELECT COUNT(*) AS total
FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Beverly Hills'))
  AND L_SystemPrice >= 500000
  AND L_SystemPrice <= 2000000
  AND CAST(L_Keyword2 AS UNSIGNED) >= 3;

EXPLAIN
SELECT
  L_ListingID,
  L_Address,
  L_City,
  L_State,
  L_Zip,
  L_SystemPrice,
  L_Keyword2,
  LM_Dec_3,
  LM_Int2_3,
  ListingContractDate
FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Beverly Hills'))
  AND L_SystemPrice >= 500000
  AND L_SystemPrice <= 2000000
  AND CAST(L_Keyword2 AS UNSIGNED) >= 3
ORDER BY L_SystemPrice ASC, L_ListingID ASC
LIMIT 20 OFFSET 0;
