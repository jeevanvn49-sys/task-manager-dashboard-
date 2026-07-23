const db = require('./database');

const sampleTasks = [
  { title: 'Design Dashboard UI', description: 'Create responsive mockup in Figma', status: 'Completed', priority: 'High' },
  { title: 'Setup SQLite Backend', description: 'Build REST endpoints with Express', status: 'In Progress', priority: 'High' },
  { title: 'Connect React Frontend', description: 'Fetch API and handle state management', status: 'In Progress', priority: 'Medium' },
  { title: 'Write Documentation', description: 'Document API routes and setup guide', status: 'Pending', priority: 'Low' },
];

// Clear existing tasks and insert sample data
db.run('DELETE FROM tasks', (err) => {
  if (err) return console.error(err.message);

  const stmt = db.prepare('INSERT INTO tasks (title, description, status, priority) VALUES (?, ?, ?, ?)');
  
  sampleTasks.forEach((t) => {
    stmt.run(t.title, t.description, t.status, t.priority);
  });
  
  stmt.finalize();
  console.log('Database seeded successfully!');
});