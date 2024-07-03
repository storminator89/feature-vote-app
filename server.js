// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Verbindung zur SQLite-Datenbank
const db = new sqlite3.Database('./featureideas.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the featureideas database.');
  }
});

// Tabellen erstellen
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`, (err) => {
    if (err) console.error('Error creating users table:', err.message);
    else console.log('Users table created or already exists.');
  });

  db.run(`CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    category TEXT,
    votes INTEGER DEFAULT 0
  )`, (err) => {
    if (err) console.error('Error creating ideas table:', err.message);
    else console.log('Ideas table created or already exists.');
  });

  db.run(`CREATE TABLE IF NOT EXISTS user_votes (
    user_id INTEGER,
    idea_id INTEGER,
    vote_direction TEXT,
    PRIMARY KEY (user_id, idea_id)
  )`, (err) => {
    if (err) console.error('Error creating user_votes table:', err.message);
    else console.log('User_votes table created or already exists.');
  });

  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idea_id INTEGER,
    user_id INTEGER,
    text TEXT,
    username TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idea_id) REFERENCES ideas (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Error creating comments table:', err.message);
    else console.log('Comments table created or already exists.');
  });
});

// Registrierung
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Registering user:', username);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function(err) {
    if (err) {
      console.error('Registration error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('User registered:', { id: this.lastID, username });
    res.json({ id: this.lastID, username });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username);
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      console.error('Login error:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (row) {
      console.log('Login successful:', { id: row.id, username: row.username });
      res.json({ message: 'Login successful', user: { id: row.id, username: row.username } });
    } else {
      console.log('Login failed: Invalid credentials');
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Idee hinzufügen
app.post('/api/ideas', (req, res) => {
  const { title, description, category } = req.body;
  console.log('Adding new idea:', { title, category });
  db.run(`INSERT INTO ideas (title, description, category) VALUES (?, ?, ?)`, [title, description, category], function(err) {
    if (err) {
      console.error('Error adding idea:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Idea added:', { id: this.lastID, title, description, category });
    res.json({ id: this.lastID, title, description, category, votes: 0, comments: [] });
  });
});

// Ideen abrufen
app.get('/api/ideas', (req, res) => {
  console.log('Fetching all ideas');
  db.all(`SELECT ideas.*, 
          (SELECT COUNT(*) FROM comments WHERE comments.idea_id = ideas.id) as comment_count
          FROM ideas`, [], (err, rows) => {
    if (err) {
      console.error('Error fetching ideas:', err.message);
      return res.status(400).json({ error: err.message });
    }
    
    // Fetch comments for each idea
    const fetchComments = rows.map(idea => 
      new Promise((resolve, reject) => {
        db.all(`SELECT * FROM comments WHERE idea_id = ?`, [idea.id], (err, comments) => {
          if (err) reject(err);
          idea.comments = comments;
          resolve();
        });
      })
    );

    Promise.all(fetchComments)
      .then(() => {
        console.log('Ideas fetched successfully');
        res.json(rows);
      })
      .catch(error => {
        console.error('Error fetching comments:', error.message);
        res.status(400).json({ error: error.message });
      });
  });
});

// Für Idee abstimmen
app.post('/api/ideas/:id/vote', (req, res) => {
  const { id } = req.params;
  const { direction, userId } = req.body;
  const voteChange = direction === 'up' ? 1 : -1;

  console.log('Voting for idea:', { id, direction, userId });

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Prüfen, ob der Benutzer bereits abgestimmt hat
    db.get('SELECT * FROM user_votes WHERE user_id = ? AND idea_id = ?', [userId, id], (err, row) => {
      if (err) {
        console.error('Error checking existing vote:', err.message);
        db.run('ROLLBACK');
        return res.status(400).json({ error: err.message });
      }

      if (row) {
        console.log('User has already voted for this idea');
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'User has already voted for this idea' });
      }

      // Vote aktualisieren und in user_votes speichern
      db.run(`UPDATE ideas SET votes = votes + ? WHERE id = ?`, [voteChange, id], function(err) {
        if (err) {
          console.error('Error updating vote count:', err.message);
          db.run('ROLLBACK');
          return res.status(400).json({ error: err.message });
        }

        db.run(`INSERT INTO user_votes (user_id, idea_id, vote_direction) VALUES (?, ?, ?)`, 
          [userId, id, direction], function(err) {
          if (err) {
            console.error('Error recording user vote:', err.message);
            db.run('ROLLBACK');
            return res.status(400).json({ error: err.message });
          }

          db.run('COMMIT');
          console.log('Vote recorded successfully');
          res.json({ message: 'Vote recorded' });
        });
      });
    });
  });
});

// Idee löschen
app.delete('/api/ideas/:id', (req, res) => {
  const { id } = req.params;
  console.log('Deleting idea:', id);
  db.run(`DELETE FROM ideas WHERE id = ?`, id, function(err) {
    if (err) {
      console.error('Error deleting idea:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      console.log('Idea not found:', id);
      return res.status(404).json({ error: 'Idea not found' });
    }
    console.log('Idea deleted successfully:', id);
    res.json({ message: 'Idea deleted' });
  });
});

// Votes eines Benutzers abrufen
app.get('/api/users/:userId/votes', (req, res) => {
  const { userId } = req.params;
  console.log('Fetching votes for user:', userId);
  db.all(`SELECT idea_id, vote_direction FROM user_votes WHERE user_id = ?`, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching user votes:', err.message);
      return res.status(400).json({ error: err.message });
    }
    const votes = rows.reduce((acc, row) => {
      acc[row.idea_id] = row.vote_direction;
      return acc;
    }, {});
    console.log('User votes fetched successfully:', votes);
    res.json(votes);
  });
});

// Kommentar hinzufügen
app.post('/api/ideas/:ideaId/comments', (req, res) => {
  const { ideaId } = req.params;
  const { text, userId, username } = req.body;
  console.log('Adding comment:', { ideaId, userId, username, text });
  db.run(`INSERT INTO comments (idea_id, user_id, text, username) VALUES (?, ?, ?, ?)`, [ideaId, userId, text, username], function(err) {
    if (err) {
      console.error('Error adding comment:', err.message);
      return res.status(400).json({ error: err.message });
    }
    const newComment = { 
      id: this.lastID, 
      idea_id: ideaId, 
      user_id: userId, 
      text, 
      username, 
      created_at: new Date().toISOString() 
    };
    console.log('Comment added successfully:', newComment);
    res.json(newComment);
  });
});

// Kommentare für eine Idee abrufen
app.get('/api/ideas/:ideaId/comments', (req, res) => {
  const { ideaId } = req.params;
  console.log('Fetching comments for idea:', ideaId);
  db.all(`SELECT * FROM comments WHERE idea_id = ?`, [ideaId], (err, rows) => {
    if (err) {
      console.error('Error fetching comments:', err.message);
      return res.status(400).json({ error: err.message });
    }
    console.log('Comments fetched successfully:', rows);
    res.json(rows);
  });
});

// Kommentar löschen
app.delete('/api/ideas/:ideaId/comments/:commentId', (req, res) => {
  const { ideaId, commentId } = req.params;
  console.log('Deleting comment:', { ideaId, commentId });
  db.run(`DELETE FROM comments WHERE id = ? AND idea_id = ?`, [commentId, ideaId], function(err) {
    if (err) {
      console.error('Error deleting comment:', err.message);
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      console.log('Comment not found:', { ideaId, commentId });
      return res.status(404).json({ error: 'Comment not found' });
    }
    console.log('Comment deleted successfully');
    res.json({ message: 'Comment deleted' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
