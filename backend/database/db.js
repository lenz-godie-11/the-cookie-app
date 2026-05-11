const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kitchen.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to kitchen Database at:', dbPath);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        image_url TEXT
    )`);

    const items = ['cookies', 'teabags', 'coffee', 'mint ratomilk', 'salt'];
    items.forEach(item => {
        db.run("INSERT OR IGNORE INTO products (name, count) VALUES (?, 10)", [item]);
    });
});

module.exports = db;
