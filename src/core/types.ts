export interface User {
    publicKey: string; // Used as the unique ID (Ed25519)
    displayName: string;
    avatarPath?: string; // Path to local .webp file
}

export interface Message {
    id: string; // UUID or Hash
    senderId: string;
    receiverId: string; // The public key of the friend
    content: string;
    timestamp: number;
    status: 'pending' | 'sending' | 'delivered' | 'failed';
    attachmentPath?: string; // Path to local .webp file
}

// The Central Event Map: Maps the exact string name to the exact payload shape
export interface AppEventMap {
    'chat:new-message': Message;
    'sidebar:unread-update': { userId: string; unreadCount: number };
    'user:relationship-changed': { userId: string; status: 'none' | 'friend' };
    'system:connection-status': { status: 'online' | 'offline' | 'connecting' };
    'settings:font-size-changed': { newSize: number };
    // NEW: Triggered when a user clicks a friend in the sidebar
    'ui:chat-selected': { friendId: string; displayName: string };
}