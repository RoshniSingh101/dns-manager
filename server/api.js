const express = require('express');
const cors = require('cors'); // added
const db = require('./database');
const app = express();
app.use(cors()); // added
app.use(express.json());

// Get route
app.get('/api/records', async (req, res) => {
  try {
    const rows = await db.getAllRecords(); // This calls the function we just added
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to add/update a DNS record
app.post('/api/records', async (req, res) => {
  const { domain, ip } = req.body;
  try {
    await db.addRecord(domain, ip);
    res.json({ message: `Record for ${domain} updated to ${ip}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete records
app.delete('/api/records/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.deleteRecord(id); // This calls the function in database.js
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

// Get recent logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await db.getLogs(); // This calls the function in database.js
    res.json(logs || []);
  } catch (err) {
    console.error("API Log Error:", err);
    res.status(500).json([]);
  }
});

app.listen(3000, () => console.log('Management API on port 3000'));