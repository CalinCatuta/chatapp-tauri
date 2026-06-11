// src-tauri/src/main.rs

// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use tauri::Manager;

mod db; // Import our db module
mod commands; // We need to tell Tauri that these commands exist so the frontend is allowed to call them.

// This is our Global Backend State.
// We wrap the SQLite connection in a Mutex because multiple Tauri commands
// (like sending an image and receiving a text) might try to use it simultaneously.
pub struct AppState {
    pub db: std::sync::Mutex<Option<rusqlite::Connection>>,
}

fn main() {
    tauri::Builder::default()
        // 1. Register our empty state container
        .manage(AppState {
            db: std::sync::Mutex::new(None),
        })
        // Tell Tauri to listen for these specific commands from TypeScript
        .invoke_handler(tauri::generate_handler![
            commands::friends::get_friends,
            commands::messages::get_chat_history
        ])
        .setup(|app| {
            // 2. Get the OS-specific local app data folder using Tauri v2 APIs
            // e.g., C:\Users\Name\AppData\Local\com.discord-local-clone
            let app_dir = app.path().app_local_data_dir().expect("Failed to get local data dir");
            
            // 3. Ensure our architecture folders exist for later image compression logic
            fs::create_dir_all(app_dir.join("attachments")).expect("Failed to create attachments folder");
            fs::create_dir_all(app_dir.join("avatars")).expect("Failed to create avatars folder");

            // 4. Initialize SQLite inside that hidden folder
            let db_path = app_dir.join("local_chat.db");
            println!("Initializing DB at: {:?}", db_path);
            
            let conn = db::sqlite::init_db(db_path).expect("Database initialization failed");

            // 5. Lock the Mutex and inject the live database connection into Tauri's State
            let state = app.state::<AppState>();
            *state.db.lock().unwrap() = Some(conn);

            println!("Backend initialized successfully!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}