const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database initialization
const db = new sqlite3.Database('./myhisob.db', (err) => {
  if (err) {
    console.error('Database error:', err);
  } else {
    console.log('✅ Database connected');
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Income table
    db.run(`CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Expense table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Debts table (Qarzlar)
    db.run(`CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'given' yoki 'taken'
      person_name TEXT NOT NULL,
      amount REAL NOT NULL,
      remaining_amount REAL NOT NULL,
      due_date DATE,
      description TEXT,
      status TEXT DEFAULT 'active', -- 'active', 'paid', 'overdue'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Debt payments table
    db.run(`CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (debt_id) REFERENCES debts(id)
    )`);
  });
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token kerak' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Yaroqsiz token' });
    }
    req.user = user;
    next();
  });
};

// ============ AUTH ENDPOINTS ============

// Register
app.post('/api/register', async (req, res) => {
  const { username, password, full_name } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username va password kerak' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, password, full_name) VALUES (?, ?, ?)',
      [username, hashedPassword, full_name],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Username band' });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.json({ 
          token, 
          user: { id: this.lastID, username, full_name } 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server xatosi' });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Foydalanuvchi topilmadi' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Noto\'g\'ri parol' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ 
      token, 
      user: { id: user.id, username: user.username, full_name: user.full_name } 
    });
  });
});

// ============ INCOME ENDPOINTS ============

// Get all income
app.get('/api/income', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add income
app.post('/api/income', authenticateToken, (req, res) => {
  const { amount, category, description, date } = req.body;
  
  db.run(
    'INSERT INTO income (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, amount, category, description, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Daromad qo\'shildi' });
    }
  );
});

// ============ EXPENSE ENDPOINTS ============

// Get all expenses
app.get('/api/expenses', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add expense
app.post('/api/expenses', authenticateToken, (req, res) => {
  const { amount, category, description, date } = req.body;
  
  db.run(
    'INSERT INTO expenses (user_id, amount, category, description, date) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, amount, category, description, date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Xarajat qo\'shildi' });
    }
  );
});

// ============ DEBTS ENDPOINTS ============

// Get all debts
app.get('/api/debts', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM debts WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add debt
app.post('/api/debts', authenticateToken, (req, res) => {
  const { type, person_name, amount, due_date, description } = req.body;
  
  db.run(
    'INSERT INTO debts (user_id, type, person_name, amount, remaining_amount, due_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, type, person_name, amount, amount, due_date, description],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Qarz qo\'shildi' });
    }
  );
});

// Add debt payment
app.post('/api/debts/:id/payment', authenticateToken, (req, res) => {
  const { amount, payment_date } = req.body;
  const debtId = req.params.id;

  db.serialize(() => {
    // Add payment record
    db.run(
      'INSERT INTO debt_payments (debt_id, amount, payment_date) VALUES (?, ?, ?)',
      [debtId, amount, payment_date],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Update remaining amount
        db.run(
          'UPDATE debts SET remaining_amount = remaining_amount - ? WHERE id = ?',
          [amount, debtId],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Check if fully paid
            db.get('SELECT remaining_amount FROM debts WHERE id = ?', [debtId], (err, row) => {
              if (row && row.remaining_amount <= 0) {
                db.run('UPDATE debts SET status = ? WHERE id = ?', ['paid', debtId]);
              }
            });
            
            res.json({ message: 'To\'lov qo\'shildi' });
          }
        );
      }
    );
  });
});

// ============ ANALYTICS ENDPOINTS ============

// Get dashboard statistics
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const stats = {};

  db.serialize(() => {
    // Total income
    db.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM income WHERE user_id = ?',
      [userId],
      (err, row) => {
        stats.totalIncome = row.total;
      }
    );

    // Total expenses
    db.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE user_id = ?',
      [userId],
      (err, row) => {
        stats.totalExpenses = row.total;
      }
    );

    // Active debts given
    db.get(
      'SELECT COALESCE(SUM(remaining_amount), 0) as total FROM debts WHERE user_id = ? AND type = ? AND status = ?',
      [userId, 'given', 'active'],
      (err, row) => {
        stats.debtsGiven = row.total;
      }
    );

    // Active debts taken
    db.get(
      'SELECT COALESCE(SUM(remaining_amount), 0) as total FROM debts WHERE user_id = ? AND type = ? AND status = ?',
      [userId, 'taken', 'active'],
      (err, row) => {
        stats.debtsTaken = row.total;
        stats.balance = stats.totalIncome - stats.totalExpenses;
        res.json(stats);
      }
    );
  });
});

// AI Analysis endpoint
app.get('/api/ai-analysis', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const analysis = {
    insights: [],
    recommendations: [],
    alerts: []
  };

  db.serialize(() => {
    // Expense category analysis
    db.all(
      `SELECT category, SUM(amount) as total, COUNT(*) as count 
       FROM expenses 
       WHERE user_id = ? AND date >= date('now', '-30 days')
       GROUP BY category 
       ORDER BY total DESC`,
      [userId],
      (err, categories) => {
        if (categories && categories.length > 0) {
          const topCategory = categories[0];
          const totalExpenses = categories.reduce((sum, cat) => sum + cat.total, 0);
          const percentage = ((topCategory.total / totalExpenses) * 100).toFixed(1);
          
          analysis.insights.push({
            type: 'spending',
            title: 'Eng ko\'p xarajat',
            message: `Oxirgi 30 kunda "${topCategory.category}" kategoriyasiga ${percentage}% (${topCategory.total.toLocaleString()} so'm) sarfladingiz.`
          });

          if (percentage > 40) {
            analysis.recommendations.push({
              type: 'warning',
              title: 'Xarajatni kamaytirish',
              message: `"${topCategory.category}" xarajatini 15% qisqartirsangiz, oyiga ${(topCategory.total * 0.15).toLocaleString()} so'm tejaysiz.`
            });
          }
        }

        // Check overdue debts
        db.all(
          `SELECT * FROM debts 
           WHERE user_id = ? AND status = 'active' AND due_date < date('now')`,
          [userId],
          (err, overdueDebts) => {
            if (overdueDebts && overdueDebts.length > 0) {
              analysis.alerts.push({
                type: 'danger',
                title: 'Muddati o\'tgan qarzlar',
                message: `${overdueDebts.length} ta qarzning muddati o'tgan. Jami: ${overdueDebts.reduce((sum, d) => sum + d.remaining_amount, 0).toLocaleString()} so'm`
              });
            }

            res.json(analysis);
          }
        );
      }
    );
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
