require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

let connection;
let pool;

const initDb = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,       
      user: process.env.DB_USER,       
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,     
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Database pool created successfully.');
  } catch (err) {
    console.error('Error creating database pool:', err);
  }
};


const ensureConnection = async () => {
  if (!connection || connection.connection.state === 'disconnected') {
    console.log('Reinitializing database connection...');
    await initDb();
  }
};

initDb();

// Endpoint pour créer ou récupérer un joueur
app.post('/api/player', async (req, res) => {
  const { pseudo } = req.body;
  if (!pseudo) {
    return res.status(400).json({ error: 'Pseudo is required' });
  }

  try {
    const [rows] = await connection.execute('SELECT player_id FROM players WHERE pseudo = ?', [pseudo]);
    if (rows.length > 0) {
      return res.json({ player_id: rows[0].player_id });
    } else {
      try {
        const [result] = await connection.execute('INSERT INTO players (pseudo) VALUES (?)', [pseudo]);
        return res.json({ player_id: result.insertId });
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          // Le pseudo existe déjà, récupérer son player_id
          const [rows] = await connection.execute('SELECT player_id FROM players WHERE pseudo = ?', [pseudo]);
          if (rows.length > 0) {
            return res.json({ player_id: rows[0].player_id });
          } else {
            return res.status(500).json({ error: 'Internal server error' });
          }
        } else {
          console.error('Error inserting player:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
      }
    } connection.release(); // N'oubliez pas de libérer la connexion
  } catch (err) {
    console.error('Error in /api/player:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Les autres routes, n'oubliez pas d'appeler ensureConnection() au début

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
