/** Format Spring LocalTime (string or [h,m,s] array) for display */
export const formatTime = (t) => {
  if (t == null) return '';
  if (Array.isArray(t)) {
    const h = String(t[0] ?? 0).padStart(2, '0');
    const m = String(t[1] ?? 0).padStart(2, '0');
    return `${h}:${m}`;
  }
  return String(t).slice(0, 5);
};
