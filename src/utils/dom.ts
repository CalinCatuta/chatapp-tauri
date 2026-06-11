// src/utils/dom.ts

type ElementAttributes = {
    id?: string;
    classes?: string[];
    text?: string;
    dataset?: Record<string, string>;
    src?: string; // For images
};

/**
 * Creates an HTML Element with specified attributes in a clean, reusable way.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes: ElementAttributes = {}
): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);

    if (attributes.id) el.id = attributes.id;
    if (attributes.classes) el.classList.add(...attributes.classes);
    if (attributes.text) el.textContent = attributes.text;
    
    // Safely apply dataset attributes (e.g., data-user-id="123")
    if (attributes.dataset) {
        for (const [key, value] of Object.entries(attributes.dataset)) {
            el.dataset[key] = value;
        }
    }

    if (attributes.src && el instanceof HTMLImageElement) {
        el.src = attributes.src;
    }

    return el;
}