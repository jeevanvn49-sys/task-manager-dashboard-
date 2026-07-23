const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Get all tasks
app.get('/api/tasks', (req, res) => {
  db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Create task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const sql = `INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)`;
  db.run(sql, [title, description || '', priority || 'Medium'], function (err) {
    if (err) {
      console.error('Insert error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
      res.status(201).json(row);
    });
  });
});

// Update task status
app.put('/api/tasks/:id', (req, res) => {
  const { status, priority, title, description } = req.body;
  const { id } = req.params;

  const sql = `
    UPDATE tasks 
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority)
    WHERE id = ?
  `;

  db.run(sql, [title, description, status, priority, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
      res.json(row);
    });
  });
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Task deleted', id: Number(id) });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));