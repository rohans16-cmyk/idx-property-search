export function parseCoordinate(value) {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getLatLng(property) {
  if (!property) return null;
  const lat = parseCoordinate(property.LMD_MP_Latitude);
  const lng = parseCoordinate(property.LMD_MP_Longitude);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}
