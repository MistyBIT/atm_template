require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { loadToolRow, shapeProfile } = require('./db');

const PORT = Number(process.env.PORT || 8080);

const app = express();
app.set('trust proxy', true);
app.use(cors({ origin: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'atm-template-tool-api' });
});

app.get('/v1/tool-profile', async (_req, res) => {
  try {
    const row = await loadToolRow();
    if (!row) {
      return res.status(404).json({
        ok: false,
        error: 'Инструмент не найден (проверьте ATM_TOOL_ID / ATM_TOOL_NAME)',
      });
    }
    return res.json({ ok: true, tool: shapeProfile(row) });
  } catch (e) {
    console.error(e);
    const msg = e.message || 'Ошибка БД';
    const code = msg.includes('DATABASE_URL') || msg.includes('ATM_TOOL') ? 400 : 500;
    return res.status(code).json({ ok: false, error: msg });
  }
});

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`tool-api listening on http://0.0.0.0:${PORT}`);
  console.log('  GET /v1/tool-profile — метаданные из tools.tools');
});
