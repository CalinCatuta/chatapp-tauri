import { AppEventMap } from './types';

// EventEmitter - ObserverPattern and is the same with Signal in Godot with gdscript or Event in C# Unity.
// Same pattern as Node.js's EventEmitter 
// (the Tauri frontend window), you do not have access to Node's built-in EventEmitter module (import { EventEmitter } from 'events'). That only exists on the backend.
// Since we want total control and maximum performance, building your own lightweight Emitter class is the best path.

// Generic type for our callback functions
type EventCallback<T> = (payload: T) => void;

class EventEmitter {
    // The core registry mapping event names to arrays of callbacks
    private listeners: Map<keyof AppEventMap, EventCallback<any>[]> = new Map();

    /**
     * Subscribe to an event.
     * Example: EventBus.on('chat:new-message', (msg) => console.log(msg.content));
     */
    public on<K extends keyof AppEventMap>(event: K, callback: EventCallback<AppEventMap[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    /**
     * Unsubscribe from an event. Critical for preventing memory leaks when closing views.
     */
    public off<K extends keyof AppEventMap>(event: K, callback: EventCallback<AppEventMap[K]>): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            this.listeners.set(
                event,
                eventListeners.filter((cb) => cb !== callback)
            );
        }
    }

    /**
     * Publish an event to all subscribers.
     * TypeScript forces the payload to strictly match the event name.
     */
    public emit<K extends keyof AppEventMap>(event: K, payload: AppEventMap[K]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            // Execute all callbacks subscribed to this event
            eventListeners.forEach((cb) => cb(payload));
        }
    }
}

// Export as a Singleton so the entire application shares the exact same instance
export const EventBus = new EventEmitter();