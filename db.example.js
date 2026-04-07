const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

function getDb() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const dbPath = path.join(dataDir, "app.db");
  const db = new Database(dbPath);

  // basic tables. keep it simple.
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      osu_id INTEGER NOT NULL UNIQUE,
      username TEXT NOT NULL,
      avatar_url TEXT,
      country_code TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      user_id INTEGER PRIMARY KEY,
      age INTEGER NOT NULL,
      bio TEXT NOT NULL,
      gender TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT,
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id)
    );
  `);

  // add gender for old dbs that already had profiles table
  try {
    db.exec(`ALTER TABLE profiles ADD COLUMN gender TEXT`);
  } catch (e) {
    // already there
  }

  return db;
}

module.exports = { getDb };
