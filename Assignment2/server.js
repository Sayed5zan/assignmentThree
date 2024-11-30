const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require("fs");

const app = express();
app.use(express.json());

//Creating Database
let db;
let isDbReady = false; 

(async () => {
  try {
    const sourceDbPath = path.join(__dirname, "data", "database.db");
    const writableDbPath = path.join("/tmp", "database.db");

    if (!fs.existsSync(writableDbPath)) {
      console.log("Copying database to /tmp...");
      fs.copyFileSync(sourceDbPath, writableDbPath);
    }

    db = await sqlite.open({
      filename: writableDbPath,
      driver: sqlite3.Database,
    });


    await db.exec(`
      CREATE TABLE IF NOT EXISTS greeting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timeofDay TEXT NOT NULL,
        language TEXT NOT NULL,
        greetingMessage TEXT NOT NULL,
        tone TEXT NOT NULL
      )
    `);

    console.log("Checking if data needs to be inserted...");
    const rowCount = await db.get("SELECT COUNT(*) AS count FROM greeting");
    if (rowCount.count === 0) {
      console.log("Inserting initial data...");
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
    } else {
      console.log("Data already exists in 'greeting' table.");
    }

    isDbReady = true; 
    console.log("Database initialization complete.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
})();


//Implement API endpoints

//Greet
app.post('/api/greet', async (req, res) => {
    const { timeOfDay, language, tone } = req.body;

    
    console.log('Received request:', { timeOfDay, language, tone });
    if (!timeOfDay || !language || !tone) {
      return res.status(400).json({ error: 'timeOfDay, language, and tone are required' });
    }

    try {
      
      const greeting = await db.get(
        'SELECT * FROM greeting WHERE timeOfDay = ? AND language = ? AND tone = ?',
        [timeOfDay, language, tone]
      );

      console.log('Database result:', greeting);

      if (!greeting) {
        return res.status(404).json({ error: 'Greeting not found' });
      }

      res.json({ greetingMessage: greeting.greetingMessage });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

  

//Get all Time of Day
app.get('/api/timesOfDay', async (req, res) => {
    try {
      const timesOfDay = await db.all('SELECT DISTINCT timeOfDay FROM greeting');
      res.json({ message: 'success', data: timesOfDay.map(row => row.timeOfDay) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

//Get all Supported languages
app.get('/api/languages', async (req, res) => {
    try {
      const languages = await db.all('SELECT DISTINCT language FROM greeting');
      res.json({ message: 'success', data: languages.map(row => row.language) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Define API MODELS
class GreetingRequest {
    constructor(timeOfDay, language, tone) {
        this.timeOfDay = timeOfDay;
        this.language = language;
        this.tone = tone;
    }
}

class GreetingResponse {
    constructor(greetingMessage) {
        this.greetingMessage = greetingMessage;
    }
}

// Correct way to export multiple classes and the app
module.exports = {
    GreetingRequest,
    GreetingResponse,
    app
};