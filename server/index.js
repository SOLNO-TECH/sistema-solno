import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite Database
const db = new Database('solno.db');

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

// Serve static frontend files from 'dist' directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve the React index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
