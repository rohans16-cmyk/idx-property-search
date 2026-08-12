export function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price N/A";
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return amount.toLocaleString("en-US");
}

export function formatOpenHouseDate(raw) {
  if (!raw) return "Date TBA";
  const date = new Date(`${String(raw).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(raw);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatOpenHouseTime(raw) {
  if (raw == null || raw === "") return "—";
  const text = String(raw).trim();
  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return text;

  let hours = Number(match[1]);
  const minutes = match[2];
  if (!Number.isFinite(hours)) return text;

  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}
