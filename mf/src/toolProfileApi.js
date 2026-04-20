/**
 * Профиль инструмента с микросервиса (в Docker nginx проксирует /v1 → tool-api).
 * При встраивании в host ATM страница с :3000 — относительный /v1 ушёл бы на host; задаём
 * абсолютный origin MF (DefinePlugin ATM_TOOL_MF_PUBLIC_ORIGIN из webpack.config).
 */
export async function fetchToolProfile() {
  const origin = String(process.env.ATM_TOOL_MF_PUBLIC_ORIGIN || '').replace(/\/$/, '');
  const url = origin ? `${origin}/v1/tool-profile` : '/v1/tool-profile';
  const res = await fetch(url, {
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
