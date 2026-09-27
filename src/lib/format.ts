const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2021-06-01" -> "Jun 2021". Sanity dates are plain YYYY-MM-DD, so format in UTC. */
export function formatMonthYear(date?: string | null) {
  return date ? monthYear.format(new Date(`${date}T00:00:00Z`)) : "";
}

/** "Jun 2021 – Present", or "2019 – 2023" style when only years matter. */
export function formatRange(start?: string | null, end?: string | null, present = "Present") {
  const from = formatMonthYear(start);
  const to = end ? formatMonthYear(end) : present;
  return from ? `${from} – ${to}` : to === present ? "" : to;
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
