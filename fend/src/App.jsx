import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority }),
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTitle('');
      setDescription('');
      setPriority('Medium');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const pending = tasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className="dashboard-container">
      <header>
        <h1 className="header-title">Task Dashboard</h1>
        <p className="header-subtitle">Manage your daily activities efficiently</p>
      </header>

      {/* Stats Section */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tasks</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending / Active</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{completed}</div>
        </div>
      </section>

      {/* Add Task Form */}
      <section className="form-card">
        <h3 style={{ marginBottom: '1rem' }}>Add New Task</h3>
        <form onSubmit={handleAddTask} className="form-grid">
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <button type="submit" className="btn">+ Add Task</button>
        </form>
      </section>

      {/* Task List */}
      <main className="task-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className={`badge badge-${(task.priority || 'Medium').toLowerCase()}`}>
                  {task.priority || 'Medium'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{task.id}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{task.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {task.description || 'No description provided.'}
              </p>
            </div>

            <div className="task-footer">
              <select
                value={task.status || 'Pending'}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}