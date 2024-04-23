const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const db = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the database.');
    initTable(); // Call the initTable function after connecting to the database
  }
});

// Function to initialize the "Users" table
function initTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Users (
      username TEXT NOT NULL PRIMARY KEY,
      email TEXT NOT NULL
    )
  `;

  db.run(sql, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });
}

// Middleware to parse JSON request bodies
app.use(express.json());

// GET all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT * FROM Users';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;
    const sql = 'SELECT * FROM Users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(row);
    });
  });

// POST a new user
app.post('/api/users', (req, res) => {
  const { username, email } = req.body;
  const sql = 'INSERT INTO Users (username, email) VALUES (?, ?)';
  db.run(sql, [username, email], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'User created' });
  });
});



// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});