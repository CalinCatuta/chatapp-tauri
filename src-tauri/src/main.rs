// src-tauri/src/main.rs

// Prevents additional console window on Windows in release mode
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


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
            commands::messages::get_chat_history,
            commands::messages::send_message
        ])
        .setup(|app| {
            let app_dir = app.path().app_local_data_dir().expect("Failed to get local data dir");
            std::fs::create_dir_all(app_dir.join("attachments")).unwrap();
            std::fs::create_dir_all(app_dir.join("avatars")).unwrap();

            let db_path = app_dir.join("local_chat.db");
            let conn = db::sqlite::init_db(db_path).expect("Database initialization failed");

            // --- NEW: SEED TEST DATA ---
            // Count how many friends exist. If 0, insert test data.
            let count: i32 = conn.query_row("SELECT COUNT(*) FROM friends", [], |row| row.get(0)).unwrap_or(0);
            
            if count == 0 {
                println!("Database empty. Seeding test data...");
                conn.execute(
                    "INSERT INTO friends (public_key, display_name) VALUES (?1, ?2)",
                    ["test_user_999", "Rustacean Bot"],
                ).unwrap();

                // Add a welcome message
                let now = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis() as i64;
                conn.execute(
                    "INSERT INTO messages (id, sender_id, receiver_id, content, timestamp, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                    rusqlite::params!["msg_001", "test_user_999", "my_key", "Hello from SQLite and Rust!", now, "delivered"],
                ).unwrap();
            }
            // ---------------------------

            let state = app.state::<AppState>();
            *state.db.lock().unwrap() = Some(conn);

            println!("Backend initialized successfully!");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}