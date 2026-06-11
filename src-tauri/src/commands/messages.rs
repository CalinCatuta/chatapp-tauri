// src-tauri/src/commands/messages.rs
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

// Matches our TypeScript `Message` interface
#[derive(Debug, Serialize, Deserialize)]
pub struct MessagePayload {
    pub id: String,
    #[serde(rename = "senderId")]
    pub sender_id: String,
    #[serde(rename = "receiverId")]
    pub receiver_id: String,
    pub content: String,
    pub timestamp: i64,
    pub status: String,
    #[serde(rename = "attachmentPath")]
    pub attachment_path: Option<String>,
}

#[tauri::command]
pub fn get_chat_history(
    state: State<'_, AppState>, 
    friend_id: String
) -> Result<Vec<MessagePayload>, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    let conn = db_guard.as_ref().ok_or("Database not initialized")?;

    // Fetch messages where the friend is either the sender or receiver, ordered by oldest to newest
    let mut stmt = conn.prepare(
        "SELECT id, sender_id, receiver_id, content, timestamp, status, attachment_path 
         FROM messages 
         WHERE sender_id = ?1 OR receiver_id = ?1 
         ORDER BY timestamp ASC"
    ).map_err(|e| e.to_string())?;

    let msg_iter = stmt.query_map([friend_id], |row| {
        Ok(MessagePayload {
            id: row.get(0)?,
            sender_id: row.get(1)?,
            receiver_id: row.get(2)?,
            content: row.get(3)?,
            timestamp: row.get(4)?,
            status: row.get(5)?,
            attachment_path: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut messages = Vec::new();
    for msg in msg_iter {
        if let Ok(m) = msg {
            messages.push(m);
        }
    }

    Ok(messages)
}