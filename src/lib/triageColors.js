export function painColor(pain) {
  if (pain == null) return "#262626";
  if (pain <= 2) return "#4a917e";
  if (pain <= 4) return "#8fb347";
  if (pain <= 7) return "#c9a04a";
  if (pain <= 9) return "#c4793f";
  return "#a34242";
}

export function painToSeverity(pain) {
  if (pain == null) return "none";
  if (pain >= 8) return "red";
  if (pain >= 5) return "yellow";
  return "green";
}

export const SEV_STYLE = {
  red: { bg: "#ef4444", label: "Urgent — emergency care now" },
  yellow: { bg: "#c9a04a", label: "Moderate — see a doctor soon" },
  green: { bg: "#418E66", label: "Mild — home care may help" },
  none: { bg: "#262626", label: "" },
};
