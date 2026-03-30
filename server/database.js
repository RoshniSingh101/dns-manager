const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./records.db');

// Initialize the table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT UNIQUE,
    ip TEXT,
    ttl INTEGER DEFAULT 300
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT,
    client_ip TEXT,
    source TEXT DEFAULT 'LOCAL', 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // force add the column if the table already existed without it
  db.run(`ALTER TABLE logs ADD COLUMN source TEXT DEFAULT 'LOCAL'`, (err) => {
    if (err) {
      console.log("Database column 'source' already exists. Skipping...");
    }
  });
});


module.exports = {
  getRecord: (domain) => {
    // Remove trailing dot and lowercase it
    const cleanDomain = domain.replace(/\.$/, '').toLowerCase();
    return new Promise((resolve) => {
      db.get("SELECT ip, ttl FROM records WHERE domain = ?", [cleanDomain], (err, row) => {
        console.log(`DB Lookup for ${cleanDomain}:`, row ? row.ip : 'NOT FOUND');
        resolve(row || null);
      });
    });
  },
  addRecord: (domain, ip) => {
    // Ensure we save it clean so the lookup matches later
    const cleanDomain = domain.replace(/\.$/, '').toLowerCase();
    return new Promise((resolve, reject) => {
      db.run("INSERT OR REPLACE INTO records (domain, ip) VALUES (?, ?)", [cleanDomain, ip], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  getAllRecords: () => { // added function
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM records", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []); // Ensures we always return an array
      });
    });
  },
  deleteRecord: (id) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM records WHERE id = ?", [id], (err) => {
        if (err) reject(err); else resolve();
      });
    });
  },

logQuery: (domain, clientIp, source = 'LOCAL') => {
  db.run("INSERT INTO logs (domain, client_ip, source) VALUES (?, ?, ?)", [domain, clientIp, source]);
},

  getLogs: () => {
    return new Promise((resolve) => {
      db.all("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50", [], (err, rows) => {
        resolve(rows || []);
      });
    });
  }

};