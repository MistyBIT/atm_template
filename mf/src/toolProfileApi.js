/**
 * Профиль инструмента с микросервиса (в Docker nginx проксирует /v1 → tool-api).
 * Относительный URL — тот же origin, что и у MF.
 */
export async function fetchToolProfile() {
  const res = await fetch('/v1/tool-profile', {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      error: data.error || `HTTP ${res.status}`,
      tool: null,
    };
  }
  return { ok: true, tool: data.tool || null, error: null };
}
