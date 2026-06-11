// src-tauri/src/commands/friends.rs
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

// This struct perfectly matches our TypeScript `User` interface
#[derive(Debug, Serialize, Deserialize)]
pub struct FriendPayload {
    #[serde(rename = "publicKey")] // Maps Rust snake_case to TS camelCase
    pub public_key: String,
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "avatarPath")]
    pub avatar_path: Option<String>,
}

#[tauri::command]
pub fn get_friends(state: State<'_, AppState>) -> Result<Vec<FriendPayload>, String> {
    // 1. Lock the Mutex to safely access the database
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let conn = db_guard.as_ref().ok_or("Database not initialized")?;

    // 2. Prepare the SQL query
    let mut stmt = conn.prepare("SELECT public_key, display_name, avatar_path FROM friends")
        .map_err(|e| e.to_string())?;

    // 3. Map the SQL rows to our Rust struct
    let friend_iter = stmt.query_map([], |row| {
        Ok(FriendPayload {
            public_key: row.get(0)?,
            display_name: row.get(1)?,
            avatar_path: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;

    // 4. Collect the results into a Vector and return them to the frontend
    let mut friends = Vec::new();
    for friend in friend_iter {
        if let Ok(f) = friend {
            friends.push(f);
        }
    }

    Ok(friends)
}