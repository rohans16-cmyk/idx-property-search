/**
 * Safely parse L_Photos from the database.
 * Rows may contain: valid JSON arrays, null, empty strings, malformed JSON,
 * a single URL string, or non-array JSON — never let that crash the UI.
 */
export function parsePhotoUrls(rawPhotos) {
  if (rawPhotos == null || rawPhotos === "") {
    return [];
  }

  if (Array.isArray(rawPhotos)) {
    return rawPhotos.filter((url) => typeof url === "string" && url.trim());
  }

  if (typeof rawPhotos !== "string") {
    return [];
  }

  const trimmed = rawPhotos.trim();
  if (!trimmed || trimmed === "null" || trimmed === "[]") {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((url) => typeof url === "string" && url.trim());
    }
    if (typeof parsed === "string" && parsed.trim()) {
      return [parsed.trim()];
    }
    return [];
  } catch {
    // Not valid JSON — treat as a lone URL only if it looks like one
    if (/^https?:\/\//i.test(trimmed)) {
      return [trimmed];
    }
    return [];
  }
}

export function getPrimaryPhotoUrl(rawPhotos) {
  const urls = parsePhotoUrls(rawPhotos);
  return urls[0] || null;
}
