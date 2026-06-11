// src/main.ts
import { EventBus } from './core/EventBus';

document.addEventListener('DOMContentLoaded', () => {
    console.log('App DOM Loaded. Initializing architecture...');

    // 1. Test our EventBus typing (Autocomplete will work here!)
    EventBus.on('system:connection-status', (payload) => {
        console.log(`[EventBus] Connection status changed: ${payload.status}`);
    });

    // 2. Trigger the event to test it
    EventBus.emit('system:connection-status', { status: 'online' });
});