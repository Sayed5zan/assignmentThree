const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

//Creating Databaase
let db;

(async () => {
  console.log("opening database");
  const dbPath = path.join(__dirname, "data", "database.db");

  console.log("Database path:", dbPath); // Log to confirm the correct path
  db = await sqlite.open({
  filename: dbPath,
  driver: sqlite3.Database,
});


  console.log("Dropping table and recreating database table");

 await db.exec(`DROP TABLE IF EXISTS greeting`);
  await db.exec(`
        CREATE TABLE IF NOT EXISTS greeting (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timeofDay TEXT NOT NULL,
            language TEXT NOT NULL,
            greetingMessage TEXT NOT NULL,
            tone TEXT NOT NULL
        )
    `);

  console.log("inserting data into datbase");
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
  
  // Insert the values into the database
  for (const greeting of greetings) {
    const { timeofDay, language, message, tone } = greeting;
    await db.run(
      `INSERT INTO greeting (timeofDay, language, greetingMessage, tone) VALUES (?, ?, ?, ?)`,
      [timeofDay, language, message, tone]
    );
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
        'SELECT * FROM greetings WHERE timeOfDay = ? AND language = ? AND tone = ?',
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
      const timesOfDay = await db.all('SELECT DISTINCT timeOfDay FROM greetings');
      res.json({ message: 'success', data: timesOfDay.map(row => row.timeOfDay) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

//Get all Supported languages
app.get('/api/languages', async (req, res) => {
    try {
      const languages = await db.all('SELECT DISTINCT language FROM greetings');
      res.json({ message: 'success', data: languages.map(row => row.language) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


//Define API MODELS
class GreetingRequest{
    constructor(timeOfDay, language, tone) {
        this.timeOfDay = timeOfDay;
        this.language = language;
        this.tone = tone;
      }
      isValid() {
        return this.timeOfDay && this.language && this.tone;
      }
}
module.exports = GreetingRequest;

class GreetingResponse{
    constructor(greetingMessage) {
    this.greetingMessage = greetingMessage;
  }
}
module.exports= GreetingResponse;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});