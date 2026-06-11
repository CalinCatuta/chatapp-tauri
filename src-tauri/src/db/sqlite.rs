// src-tauri/src/db/sqlite.rs
use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub fn init_db(db_path: PathBuf) -> Result<Connection> {
    // Open or create the database file
    let conn = Connection::open(db_path)?;

    // PRAGMAs for massive performance gains on local disk
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;       -- Better concurrency
         PRAGMA synchronous = NORMAL;     -- Faster writes without losing safety
         PRAGMA foreign_keys = ON;",      // Enforce relationship rules
    )?;

    // Initialize our decentralized schema
    conn.execute_batch(
        "
        -- Stores our cryptographic friends
        CREATE TABLE IF NOT EXISTS friends (
            public_key TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            avatar_path TEXT
        );

        -- Stores the actual chat history locally
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            receiver_id TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            status TEXT NOT NULL,
            attachment_path TEXT
        );

        -- Stores our retention and UI preferences
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- Default setting for Auto-Delete (30 days)
        INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_delete_days', '30');
        "
    )?;

    Ok(conn)
}