// src/ui/components/ChatView.ts
import { EventBus } from '../../core/EventBus';
import { Message } from '../../core/types';
import { createElement } from '../../utils/dom';
import { API } from '../../core/api'; // Import our new API wrapper

export class ChatView {
    private messageContainer: HTMLElement;
    private inputField: HTMLTextAreaElement;
    private currentActiveUserId: string | null = null;

    constructor() {
        this.messageContainer = document.getElementById('message-container') as HTMLElement;
        this.inputField = document.getElementById('message-input') as HTMLTextAreaElement;
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        // Listen for new incoming messages
        EventBus.on('chat:new-message', (message: Message) => {
            if (this.currentActiveUserId === message.senderId || this.currentActiveUserId === message.receiverId) {
                this.appendMessage(message);
            }
        });

        // Listen for user clicking a friend in the sidebar
        EventBus.on('ui:chat-selected', async (payload) => {
            await this.loadChatHistory(payload.friendId, payload.displayName);
        });
    }

    private async loadChatHistory(userId: string, userName: string) {
        this.currentActiveUserId = userId;
        
        // 1. Update Header and clear current messages
        const headerName = document.getElementById('current-chat-name');
        if (headerName) headerName.textContent = userName;
        this.messageContainer.innerHTML = ''; 
        this.inputField.disabled = false;

        // 2. Fetch real history from local SQLite via Rust
        const messages = await API.getChatHistory(userId);

        // 3. Render messages
        messages.forEach(msg => this.appendMessage(msg));

        // 4. Scroll to the very bottom to see the newest messages
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    private appendMessage(message: Message) {
        const isAtBottom = this.messageContainer.scrollHeight - this.messageContainer.scrollTop <= this.messageContainer.clientHeight + 50;

        const msgNode = createElement('div', { classes: ['message-bubble'] });
        const textNode = createElement('p', { text: message.content });
        msgNode.appendChild(textNode);

        this.messageContainer.appendChild(msgNode);

        if (isAtBottom) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
}