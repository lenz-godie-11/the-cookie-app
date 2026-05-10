const sqlites3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, '../database', 'kitchen.db');

const db = new sqlites3.Database(dbPath, (err) => {
    if(err) return console.error("Database connection:", err.message);
    console.log('Connected to kitchen Database at:', dbPath);
});


db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY, count INTEGER)');
    db.run('INSERT OR IGNORE INTO inventory (id, count) VALUES(1, 10)');
});


module.exports = db;
