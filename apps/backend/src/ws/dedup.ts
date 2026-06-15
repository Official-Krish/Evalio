export function dedupAppend(buf: string, incoming: string): string {
  const t = incoming.trim();
  if (!t) return buf;
  if (!buf) return t;
  if (t.startsWith(buf)) return t;
  if (buf.endsWith(t) || buf.startsWith(t)) return buf;

  const lastChar = buf[buf.length - 1];
  const firstChar = t[0];
  if (
    t.length <= 2 &&
    lastChar !== undefined &&
    firstChar !== undefined &&
    /[a-zA-Z]/.test(lastChar) &&
    /[a-zA-Z]/.test(firstChar)
  ) {
    return buf + t;
  }

  return buf + " " + t;
}
