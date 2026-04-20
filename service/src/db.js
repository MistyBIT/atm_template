const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({ connectionString: url, max: 8 });
  }
  return pool;
}

/**
 * Загружает строку tools.tools по ATM_TOOL_ID или ATM_TOOL_NAME.
 * @returns {Promise<object|null>}
 */
async function loadToolRow() {
  const idRaw = process.env.ATM_TOOL_ID;
  const nameRaw = process.env.ATM_TOOL_NAME;
  const id = idRaw != null && String(idRaw).trim() !== '' ? parseInt(idRaw, 10) : NaN;
  const name = nameRaw != null ? String(nameRaw).trim() : '';

  if (!Number.isFinite(id) && !name) {
    throw new Error('Set ATM_TOOL_ID or ATM_TOOL_NAME');
  }

  const p = getPool();
  const sql = Number.isFinite(id)
    ? `SELECT id, name, version, description, status, docker_image, endpoint_url,
              frontend_remote_entry, config, created_by, created_at, updated_at
       FROM tools.tools WHERE id = $1 LIMIT 1`
    : `SELECT id, name, version, description, status, docker_image, endpoint_url,
              frontend_remote_entry, config, created_by, created_at, updated_at
       FROM tools.tools WHERE name = $1 LIMIT 1`;
  const params = Number.isFinite(id) ? [id] : [name];
  const { rows } = await p.query(sql, params);
  if (!rows.length) return null;
  return rows[0];
}

function shapeProfile(row) {
  const cfg = row.config && typeof row.config === 'object' ? row.config : {};
  const ui = cfg.ui && typeof cfg.ui === 'object' ? cfg.ui : {};
  const studio = cfg.studio && typeof cfg.studio === 'object' ? cfg.studio : {};
  return {
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description,
    status: row.status,
    docker_image: row.docker_image,
    endpoint_url: row.endpoint_url,
    frontend_remote_entry: row.frontend_remote_entry,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ui: {
      slug: ui.slug ?? null,
      label: ui.label ?? null,
      groupId: ui.groupId ?? null,
      groupTitle: ui.groupTitle ?? null,
      remoteKey: ui.remoteKey ?? null,
      description: ui.description ?? null,
    },
    studio: {
      dev_mf_port: studio.dev_mf_port ?? null,
      dev_api_port: studio.dev_api_port ?? null,
      public_host: studio.public_host ?? null,
    },
    config: cfg,
  };
}

module.exports = { getPool, loadToolRow, shapeProfile };
