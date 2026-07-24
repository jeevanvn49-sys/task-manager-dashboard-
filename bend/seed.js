const db = require('./database');

db.serialize(() => {
  db.run('DELETE FROM invoices');
  db.run('DELETE FROM subscriptions');
  db.run('DELETE FROM users');

  // Insert Users
  const stmtUser = db.prepare('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)');
  stmtUser.run(1, 'Alice Admin', 'admin@saas.com', 'admin');
  stmtUser.run(2, 'Bob Manager', 'manager@saas.com', 'billing_manager');
  stmtUser.run(3, 'Charlie Member', 'member@saas.com', 'member');
  stmtUser.finalize();

  // Insert Subscriptions
  const stmtSub = db.prepare('INSERT INTO subscriptions (user_id, plan_name, price, status) VALUES (?, ?, ?, ?)');
  stmtSub.run(1, 'Enterprise Pro', 299.00, 'active');
  stmtSub.run(2, 'Team Growth', 99.00, 'active');
  stmtSub.run(3, 'Starter Plan', 29.00, 'active');
  stmtSub.finalize();

  // Insert Invoices
  const stmtInv = db.prepare('INSERT INTO invoices (user_id, amount, status) VALUES (?, ?, ?)');
  stmtInv.run(1, 299.00, 'paid');
  stmtInv.run(2, 99.00, 'pending');
  stmtInv.run(2, 99.00, 'pending');
  stmtInv.run(3, 29.00, 'paid');
  stmtInv.finalize();

  console.log('✅ Database seeded successfully!');
});