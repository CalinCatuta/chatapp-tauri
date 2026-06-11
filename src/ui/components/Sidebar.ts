// src/ui/components/Sidebar.ts
import { EventBus } from '../../core/EventBus';
import { User, Message } from '../../core/types';
import { createElement } from '../../utils/dom';

export class Sidebar {
    private container: HTMLElement;

    constructor() {
        // Grab the container we defined in index.html
        this.container = document.getElementById('friends-list') as HTMLElement;
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        // Listen for new messages to trigger the "unread" logic and bump to top
        EventBus.on('chat:new-message', (message: Message) => {
            this.handleIncomingMessage(message);
        });

        // Listen for connection status changes (Online/Offline)
        EventBus.on('system:connection-status', (payload) => {
            // Logic to update the green/grey dot will go here
        });
    }

    /**
     * Renders a friend into the sidebar.
     */
    public addFriend(user: User) {
        const friendEl = createElement('div', {
            classes: ['friend-item'],
            dataset: { userId: user.publicKey }
        });

        const nameEl = createElement('span', { text: user.displayName });
        
        // CSS unread dot indicator (hidden by default)
        const unreadDot = createElement('div', { classes: ['unread-dot', 'hidden'] });

        friendEl.appendChild(nameEl);
        friendEl.appendChild(unreadDot);

        // Click event to switch chats
        friendEl.addEventListener('click', () => {
            // Remove unread status when clicked
            unreadDot.classList.add('hidden');
            friendEl.classList.remove('has-unread');

            // Broadcast that the user wants to switch chats!
            EventBus.emit('ui:chat-selected', { 
                friendId: user.publicKey, 
                displayName: user.displayName 
            });
            
            // TODO: Emit an event that the active chat changed
            
        });

        this.container.appendChild(friendEl);
    }

    /**
     * Reorders the sidebar and adds unread markers when a message arrives.
     */
    private handleIncomingMessage(message: Message) {
        const friendNode = this.container.querySelector(`[data-user-id="${message.senderId}"]`);
        
        if (friendNode) {
            // 1. "Bump" the friend to the top of the list (Discord logic)
            this.container.prepend(friendNode);

            // 2. Add unread visual state (Assuming this isn't the currently open chat)
            friendNode.classList.add('has-unread');
            const dot = friendNode.querySelector('.unread-dot');
            if (dot) dot.classList.remove('hidden');
        }
    }
}