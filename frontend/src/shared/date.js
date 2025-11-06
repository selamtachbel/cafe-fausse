// frontend/src/shared/date.js

export function toISODate(input) {
  // already YYYY-MM-DD?
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;

  const m = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) throw new Error("Invalid date");

  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function to24h(timeStr) {
  // already HH:mm?
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const m = timeStr.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!m) throw new Error("Invalid time");

  let [, hh, mm, ap] = m;
  hh = parseInt(hh, 10);
  ap = ap.toUpperCase();

  if (ap === "AM") hh = hh === 12 ? 0 : hh;
  else hh = hh === 12 ? 12 : hh + 12;

  return `${String(hh).padStart(2, "0")}:${mm}`;
}