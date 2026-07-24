const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

// Enable CORS for all ports and origins
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Root endpoint test
app.get('/', (req, res) => {
  res.send('Backend API is running successfully!');
});

// Users endpoint
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Subscriptions endpoint
app.get('/api/subscriptions', (req, res) => {
  const { userId, role } = req.query;
  let query = 'SELECT s.*, u.name as user_name, u.email FROM subscriptions s JOIN users u ON s.user_id = u.id';
  let params = [];

  if (role === 'member') {
    query += ' WHERE s.user_id = ?';
    params.push(userId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Invoices endpoint
app.get('/api/invoices', (req, res) => {
  const { userId, role } = req.query;
  let query = 'SELECT i.*, u.name as user_name FROM invoices i JOIN users u ON i.user_id = u.id';
  let params = [];

  if (role === 'member') {
    query += ' WHERE i.user_id = ?';
    params.push(userId);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Upgrade plan endpoint
app.put('/api/subscriptions/:id', (req, res) => {
  const { role, plan_name, price } = req.body;
  if (role === 'member') {
    return res.status(403).json({ error: 'Permission denied. Members cannot upgrade plans.' });
  }

  db.run(
    'UPDATE subscriptions SET plan_name = ?, price = ? WHERE id = ?',
    [plan_name, price, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Subscription updated successfully!' });
    }
  );
});

// Pay invoice endpoint
app.put('/api/invoices/:id/pay', (req, res) => {
  const { role } = req.body;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied. Only Admins can approve payments.' });
  }

  db.run('UPDATE invoices SET status = "paid" WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Invoice marked as paid!' });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));