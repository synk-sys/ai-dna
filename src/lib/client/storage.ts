/**
 * localStorage helpers that never throw. Storage can be unavailable in
 * private browsing, embedded webviews or when the quota is full; the quiz
 * still works in that case, it just can't resume after a refresh.
 */

export function readJson<T>(key: string, guard: (value: unknown) => value is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
