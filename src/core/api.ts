// src/core/api.ts
import { invoke } from '@tauri-apps/api/core';
import { User, Message } from './types';

/**
 * A centralized, strongly-typed wrapper for all Tauri IPC commands.
 * This ensures our UI components never have to guess the backend function names.
 */
export const API = {
    /**
     * Fetches the local friend list from the SQLite database.
     */
    async getFriends(): Promise<User[]> {
        try {
            return await invoke<User[]>('get_friends');
        } catch (error) {
            console.error('Failed to fetch friends from local DB:', error);
            return [];
        }
    },

    /**
     * Fetches the local chat history for a specific friend.
     */
    async getChatHistory(friendId: string): Promise<Message[]> {
        try {
            // The object keys here must match the exact parameter names in the Rust function signature
            return await invoke<Message[]>('get_chat_history', { friendId });
        } catch (error) {
            console.error(`Failed to fetch history for ${friendId}:`, error);
            return [];
        }
    }
};