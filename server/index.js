import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// SQLite en carpeta persistente (montar volumen en /app/data en Dokploy)
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'solno.db');

const db = new Database(dbPath);
console.log(`SQLite database: ${dbPath}`);

// Create the key-value store table
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Prepared statements for performance
const getStmt = db.prepare('SELECT value FROM store WHERE key = ?');
const setStmt = db.prepare('INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)');
const delStmt = db.prepare('DELETE FROM store WHERE key = ?');

// GET all data for a key
app.get('/api/store/:key', (req, res) => {
  const { key } = req.params;
  try {
    const row = getStmt.get(key);
    if (row) {
      res.json(JSON.parse(row.value));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    console.error('Error reading key', key, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST to update a key
app.post('/api/store/:key', (req, res) => {
  const { key } = req.params;
  const value = req.body;
  
  try {
    setStmt.run(key, JSON.stringify(value));
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving key', key, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a key
app.delete('/api/store/:key', (req, res) => {
  const { key } = req.params;
  try {
    delStmt.run(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static frontend files from 'dist' directory (production)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all for client-side routing — never swallow /api
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Frontend build not found. Run npm run build.');
  }
  res.sendFile(indexPath);
});

const PORT = Number(process.env.PORT) || 3002;
const server = app.listen({ port: PORT, host: '0.0.0.0', exclusive: true }, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Stop the other process and retry.`);
    process.exit(1);
  }
  throw err;
});
