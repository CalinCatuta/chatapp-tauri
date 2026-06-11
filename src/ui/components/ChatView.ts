// src/ui/components/ChatView.ts
import { EventBus } from '../../core/EventBus';
import { Message } from '../../core/types';
import { createElement } from '../../utils/dom';

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
        EventBus.on('chat:new-message', (message: Message) => {
            // Only append the message if we are actively looking at this chat
            if (this.currentActiveUserId === message.senderId || this.currentActiveUserId === message.receiverId) {
                this.appendMessage(message);
            }
        });
    }

    public setActiveChat(userId: string, userName: string) {
        this.currentActiveUserId = userId;
        this.messageContainer.innerHTML = ''; // Clear current chat history
        this.inputField.disabled = false; // Enable typing
        
        const headerName = document.getElementById('current-chat-name');
        if (headerName) headerName.textContent = userName;
    }

    private appendMessage(message: Message) {
        // Smart Scroll Logic: Check if user is already at the bottom BEFORE adding new message
        const isAtBottom = this.messageContainer.scrollHeight - this.messageContainer.scrollTop <= this.messageContainer.clientHeight + 50;

        const msgNode = createElement('div', { classes: ['message-bubble'] });
        
        // For now, just add text. Later we will add image attachment logic here.
        const textNode = createElement('p', { text: message.content });
        msgNode.appendChild(textNode);

        this.messageContainer.appendChild(msgNode);

        // Auto-scroll to bottom only if they were already at the bottom
        if (isAtBottom) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
}