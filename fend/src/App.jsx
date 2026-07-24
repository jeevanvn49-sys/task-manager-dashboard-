import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Fetch users on load
  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        if (data.length > 0) setCurrentUser(data[0]);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch data dynamically on role/user switch
  const loadData = () => {
    if (!currentUser) return;

    fetch(`${API_BASE}/subscriptions?userId=${currentUser.id}&role=${currentUser.role}`)
      .then((res) => res.json())
      .then((data) => setSubscriptions(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/invoices?userId=${currentUser.id}&role=${currentUser.role}`)
      .then((res) => res.json())
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleRoleSwitch = (e) => {
    const selectedUser = users.find((u) => u.id === parseInt(e.target.value));
    setCurrentUser(selectedUser);
  };

  const handleUpgrade = (subId) => {
    fetch(`${API_BASE}/subscriptions/${subId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: currentUser.role,
        plan_name: 'Enterprise Ultra',
        price: 499.0
      })
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || data.error);
        loadData();
      });
  };

  const handlePayInvoice = (invoiceId) => {
    fetch(`${API_BASE}/invoices/${invoiceId}/pay`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: currentUser.role })
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || data.error);
        loadData();
      });
  };

  if (!currentUser) return <div className="container">Loading users from backend...</div>;

  return (
    <div className="container">
      <header className="header">
        <div>
          <h2>⚡ SaaS Billing Portal</h2>
          <p style={{ color: '#94a3b8' }}>
            Logged in as: <strong>{currentUser.name}</strong>
          </p>
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>Simulate User:</label>
          <select className="role-selector" value={currentUser.id} onChange={handleRoleSwitch}>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div style={{ marginTop: '1rem' }}>
        Current Role: <span className={`badge ${currentUser.role}`}>{currentUser.role.replace('_', ' ')}</span>
      </div>

      {/* Subscriptions */}
      <section className="section">
        <h3>Active Subscriptions</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.user_name}</td>
                <td>{sub.plan_name}</td>
                <td>${sub.price}/mo</td>
                <td><span className="status-tag paid">{sub.status}</span></td>
                <td>
                  <button
                    className="btn"
                    disabled={currentUser.role === 'member'}
                    onClick={() => handleUpgrade(sub.id)}
                  >
                    Upgrade to Ultra ($499)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Invoices */}
      <section className="section">
        <h3>Invoices & Billing History</h3>
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>#{inv.id}</td>
                <td>{inv.user_name}</td>
                <td>${inv.amount}</td>
                <td>
                  <span className={`status-tag ${inv.status}`}>{inv.status}</span>
                </td>
                <td>
                  {inv.status === 'pending' ? (
                    <button
                      className="btn"
                      disabled={currentUser.role !== 'admin'}
                      onClick={() => handlePayInvoice(inv.id)}
                    >
                      Approve Payment
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}