const express = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
app.use(express.json());

let db;

// Function to ensure database is initialized
async function initializeDatabase() {
  // Use a temporary directory for Vercel's serverless environment
  const tempDir = os.tmpdir();
  const dbPath = path.join(tempDir, "greeting.db");

  // Open the database
  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS greeting (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timeofDay TEXT NOT NULL,
      language TEXT NOT NULL,
      greetingMessage TEXT NOT NULL,
      tone TEXT NOT NULL
    )
  `);

  // Check if data exists, if not, insert initial data
  const existingData = await db.all(`SELECT COUNT(*) as count FROM greeting`);
  if (existingData[0].count === 0) {
    const greetings = [
      { timeofDay: "Morning", language: "English", message: "Good Morning", tone: "Formal" },
      { timeofDay: "Afternoon", language: "English", message: "Good Afternoon", tone: "Formal" },
      { timeofDay: "Evening", language: "English", message: "Good Evening", tone: "Formal" },
      { timeofDay: "Morning", language: "French", message: "Bonjour", tone: "Formal" },
      { timeofDay: "Afternoon", language: "French", message: "Bon après-midi", tone: "Formal" },
      { timeofDay: "Evening", language: "French", message: "Bonsoir", tone: "Formal" },
      { timeofDay: "Morning", language: "Spanish", message: "Buenos días", tone: "Formal" },
      { timeofDay: "Afternoon", language: "Spanish", message: "Buenas tardes", tone: "Formal" },
      { timeofDay: "Evening", language: "Spanish", message: "Buenas noches", tone: "Formal" },
      { timeofDay: "Morning", language: "English", message: "Hey, good morning!", tone: "Casual" },
      { timeofDay: "Afternoon", language: "English", message: "Hey, good afternoon!", tone: "Casual" },
      { timeofDay: "Evening", language: "English", message: "Hey, good evening!", tone: "Casual" },
      { timeofDay: "Morning", language: "French", message: "Salut, bonjour!", tone: "Casual" },
      { timeofDay: "Afternoon", language: "French", message: "Salut, bon après-midi!", tone: "Casual" },
      { timeofDay: "Evening", language: "French", message: "Salut, bonsoir!", tone: "Casual" },
      { timeofDay: "Morning", language: "Spanish", message: "Hola, buenos días!", tone: "Casual" },
      { timeofDay: "Afternoon", language: "Spanish", message: "Hola, buenas tardes!", tone: "Casual" },
      { timeofDay: "Evening", language: "Spanish", message: "Hola, buenas noches!", tone: "Casual" }
    ];
    
    for (const greeting of greetings) {
      const { timeofDay, language, message, tone } = greeting;
      await db.run(
        `INSERT INTO greeting (timeofDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)`,
        [timeofDay, language, message, tone]
      );
    }
  }
}

// Root endpoint
app.get('/', async (req, res) => {
  try {
    if (!db) await initializeDatabase();
    const greetings = await db.all(`SELECT * FROM greeting`);
    res.json({
      message: "success",
      data: greetings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Greet endpoint
app.post('/Greet', async (req, res) => {
  const { timeOfDay, language, tone } = req.body;

  if (!timeOfDay || !language || !tone) {
    return res.status(400).json({ error: "All fields (timeOfDay, language, tone) are required." });
  }

  try {
    if (!db) await initializeDatabase();
    const row = await db.get(
      `SELECT greetingMessage FROM greeting WHERE timeofDay = ? AND language = ? AND tone = ?`,
      [timeOfDay, language, tone]
    );

    if (!row) {
      return res.status(404).json({ error: "The specified timeOfDay, language, or tone is not supported." });
    }

    const greetingResponse = { greetingMessage: row.greetingMessage };
    res.json(greetingResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Times of Day
app.get('/Greet/GetAllTimesOfDay', async (req, res) => {
  try {
    if (!db) await initializeDatabase();
    const timesOfDay = await db.all(`SELECT DISTINCT timeOfDay FROM greeting`);
    res.json(timesOfDay.map(row => row.timeOfDay));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Supported Languages
app.get('/Greet/GetSupportedLanguages', async (req, res) => {
  try {
    if (!db) await initializeDatabase();
    const languages = await db.all(`SELECT DISTINCT language FROM greeting`);
    res.json(languages.map(row => row.language));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database on first request
initializeDatabase();

// For Vercel serverless deployment
module.exports = app;