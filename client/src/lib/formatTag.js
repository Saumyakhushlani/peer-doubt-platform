/** Display label: first character uppercase, rest unchanged. */
export function formatTagLabel(name) {
  if (!name || typeof name !== "string") return "";
  const t = name.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}
