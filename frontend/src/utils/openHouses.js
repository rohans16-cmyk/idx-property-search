/**
 * Open-house remarks live in the all_data JSON blob, not a dedicated column.
 * Parse on the client (Week 8 debug challenge) — do not change the API.
 */
export function getOpenHouseRemarks(allData) {
  if (allData == null || allData === "") return null;

  let parsed = allData;
  if (typeof allData === "string") {
    try {
      parsed = JSON.parse(allData);
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") return null;

  const remarks = parsed.OpenHouseRemarks;
  if (typeof remarks !== "string") return null;

  const trimmed = remarks.trim();
  return trimmed ? trimmed : null;
}
