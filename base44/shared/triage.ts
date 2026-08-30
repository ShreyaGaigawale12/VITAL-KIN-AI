// Shared triage color rules used by the AI function and the UI.
export const SEVERITY_COLORS = {
  red: { bg: "#ef4444", text: "#ffffff", label: "Urgent — seek emergency care now" },
  yellow: { bg: "#c9a04a", text: "#1a1a1a", label: "Moderate — see a doctor soon" },
  green: { bg: "#418E66", text: "#ffffff", label: "Mild — home care may help" },
  none: { bg: "#262626", text: "#e0e0e0", label: "" }
};

export function painToSeverity(pain) {
  if (pain == null) return "none";
  if (pain >= 8) return "red";
  if (pain >= 5) return "yellow";
  return "green";
}

export function painColor(pain) {
  if (pain == null) return "#262626";
  if (pain <= 2) return "#4a917e";
  if (pain <= 4) return "#8fb347";
  if (pain <= 7) return "#c9a04a";
  if (pain <= 9) return "#c4793f";
  return "#a34242";
}
