// src/main.ts
import { EventBus } from './core/EventBus';
import { Sidebar } from './ui/components/Sidebar';
import { ChatView } from './ui/components/ChatView';
import { User, Message } from './core/types';

document.addEventListener('DOMContentLoaded', () => {
    console.log('App DOM Loaded. Initializing UI Components...');

    // Instantiate our UI classes
    const sidebar = new Sidebar();
    const chatView = new ChatView();

    // ==========================================
    // DEMO DATA: Let's test if our logic works
    // ==========================================
    
    const mockFriend: User = { publicKey: 'user_123', displayName: 'DarkZynthar' };
    sidebar.addFriend(mockFriend);

    // Simulate opening the chat with DarkZynthar
    chatView.setActiveChat(mockFriend.publicKey, mockFriend.displayName);

    // Simulate receiving a message 3 seconds after the app opens
    setTimeout(() => {
        const mockMessage: Message = {
            id: 'msg_1',
            senderId: 'user_123',
            receiverId: 'my_id',
            content: 'Hello! This was fired through the EventBus.',
            timestamp: Date.now(),
            status: 'delivered'
        };
        
        // Broadcast to the whole app! Sidebar and ChatView will both react.
        EventBus.emit('chat:new-message', mockMessage);
    }, 3000);
});