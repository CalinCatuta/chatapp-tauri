// src/main.ts
import { Sidebar } from './ui/components/Sidebar';
import { ChatView } from './ui/components/ChatView';
import { API } from './core/api';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('App DOM Loaded. Initializing UI Components...');

    // Instantiate our UI classes
    const sidebar = new Sidebar();
    const chatView = new ChatView(); // Instantiating is enough, it sets up its own EventBus listeners!

    // Fetch friends from local SQLite DB
    const friends = await API.getFriends();
    
    // Populate the sidebar
    friends.forEach(friend => {
        sidebar.addFriend(friend);
    });

    console.log(`Successfully loaded ${friends.length} friends from database.`);
});