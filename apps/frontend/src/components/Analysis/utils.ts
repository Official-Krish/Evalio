import type { Session } from "./types";

export function extractValues(
  sessions: Session[],
  key: keyof Session,
): number[] {
  return sessions.map((s) => s[key]).filter((v): v is number => v != null);
}

export function buildNarrative(
  values: number[],
  label: string,
  _sessions: Session[],
): string {
  if (values.length < 2) {
    if (values.length === 1)
      return `Your ${label.toLowerCase()} score is ${values[0]}%. Complete more sessions to track your trend.`;
    return `No ${label.toLowerCase()} data yet. Complete an interview to get started.`;
  }

  const first = values[0]!;
  const last = values[values.length - 1]!;
  const delta = last - first;
  const total = values.length;
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  const direction =
    delta > 5 ? "improved" : delta < -5 ? "declined" : "remained steady";
  const magnitude = Math.abs(delta);

  const prefix =
    magnitude > 20 ? "significantly" : magnitude > 10 ? "notably" : "slightly";

  const tip =
    last >= 80
      ? "You're performing at a high level. Focus on maintaining consistency."
      : last >= 60
        ? `You're on a solid trajectory — ${magnitude > 10 ? `${prefix} ` : ""}${direction} by ${magnitude} pts. Keep practicing to break into the 80+ range.`
        : `There's room for growth. Your scores have ${direction} ${prefix ? `${prefix} ` : ""}by ${magnitude} pts across ${total} session${total > 1 ? "s" : ""}.`;

  if (delta <= 5 && delta >= -5) {
    return `Your ${label.toLowerCase()} scores have been consistent around ${avg}% across ${total} sessions. ${tip}`;
  }

  return `${label} has ${direction} ${prefix ? `${prefix} ` : ""}from ${first}% to ${last}% — a ${delta > 0 ? "+" : ""}${delta} pt change across ${total} session${total > 1 ? "s" : ""}. ${tip}`;
}
