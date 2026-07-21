USE rets;

-- Run these before and after sql/add_property_indexes.sql
-- Compare the `key` column in EXPLAIN output (NULL means no index used)

EXPLAIN
SELECT COUNT(*) AS total
FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Portland'))
  AND L_SystemPrice >= 300000
  AND CAST(L_Keyword2 AS UNSIGNED) = 3;

EXPLAIN
SELECT
  L_ListingID,
  L_Address,
  L_City,
  L_State,
  L_Zip,
  L_SystemPrice,
  L_Keyword2,
  LM_Dec_3
FROM rets_property
WHERE LOWER(TRIM(L_City)) = LOWER(TRIM('Portland'))
  AND L_SystemPrice >= 300000
  AND CAST(L_Keyword2 AS UNSIGNED) = 3
ORDER BY L_ListingID
LIMIT 20 OFFSET 0;
