function validateListingId(rawId) {
  if (rawId === undefined || rawId === null || String(rawId).trim() === "") {
    return { error: "Listing ID is required" };
  }

  const id = String(rawId).trim();

  if (id.length > 32) {
    return { error: "Listing ID is too long (max 32 characters)" };
  }

  // Allow typical MLS listing IDs (digits / letters / hyphen / underscore)
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return { error: "Listing ID contains invalid characters" };
  }

  return { id };
}

module.exports = { validateListingId };
