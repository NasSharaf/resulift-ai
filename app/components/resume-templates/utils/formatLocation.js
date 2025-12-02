export function formatLocation(loc) {
  if (!loc || typeof loc !== "object") return null;

  const parts = [
    loc.city,
    loc.region,
    loc.country,
    loc.countryCode,
    loc.postalCode
  ].filter(Boolean);

  if (parts.length === 0) return null;

  return parts.join(", ");
}
