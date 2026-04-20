import React, { useEffect, useState } from 'react';
import { fetchToolProfile } from './toolProfileApi';

const remoteName =
  typeof process.env.ATM_TEMPLATE_REMOTE_NAME === 'string'
    ? process.env.ATM_TEMPLATE_REMOTE_NAME
    : 'remote_template';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tool, setTool] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetchToolProfile();
      if (cancelled) return;
      setLoading(false);
      if (!r.ok) {
        setError(r.error || 'Ошибка загрузки');
        setTool(null);
        return;
      }
      setError(null);
      setTool(r.tool);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="tpl">
        <p className="muted">Загрузка данных инструмента из БД…</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="tpl">
        <p className="err">{error || 'Нет данных'}</p>
        <p className="muted">
          Проверьте, что микросервис запущен и заданы <code>DATABASE_URL</code>,{' '}
          <code>ATM_TOOL_ID</code> или <code>ATM_TOOL_NAME</code>. В dev MF проксирует{' '}
          <code>/v1</code> на <code>TOOL_API_PROXY_TARGET</code>.
        </p>
      </div>
    );
  }

  const { ui, studio } = tool;

  return (
    <div className="tpl">
      <div className="tpl-badge">{remoteName}</div>
      <h1>{ui.label || tool.name}</h1>
      <p className="muted">{tool.description || ui.description || '—'}</p>

      <dl>
        <dt>ID в БД</dt>
        <dd>{tool.id}</dd>

        <dt>name</dt>
        <dd>
          <code>{tool.name}</code>
        </dd>

        <dt>version</dt>
        <dd>{tool.version}</dd>

        <dt>status</dt>
        <dd>{tool.status}</dd>

        <dt>slug (UI)</dt>
        <dd>{ui.slug || '—'}</dd>

        <dt>remoteKey</dt>
        <dd>
          <code>{ui.remoteKey || '—'}</code>
        </dd>

        <dt>Группа</dt>
        <dd>
          {ui.groupTitle || '—'} <span className="muted">({ui.groupId || '—'})</span>
        </dd>

        <dt>Порт MF (dev)</dt>
        <dd>{studio.dev_mf_port != null ? studio.dev_mf_port : '—'}</dd>

        <dt>Порт API (dev)</dt>
        <dd>{studio.dev_api_port != null ? studio.dev_api_port : '—'}</dd>

        <dt>public_host</dt>
        <dd>{studio.public_host || '—'}</dd>

        <dt>frontend_remote_entry</dt>
        <dd>
          <code>{tool.frontend_remote_entry || '—'}</code>
        </dd>

        <dt>endpoint_url</dt>
        <dd>
          <code>{tool.endpoint_url || '—'}</code>
        </dd>

        <dt>Обновлено</dt>
        <dd>{tool.updated_at ? new Date(tool.updated_at).toLocaleString() : '—'}</dd>
      </dl>
    </div>
  );
}
