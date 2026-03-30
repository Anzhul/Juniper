/**
 * Type-safe event emitter for IIIFViewer.
 * Provides a simple pub/sub API for viewer lifecycle and interaction events.
 */

/** Map of event names to their payload types */
export interface ViewerEventMap {
    /** Fired after a manifest or image service URL has been loaded */
    load: { url: string; type: 'manifest' | 'image-service' };
    /** Fired when a canvas is loaded (index, label) */
    canvasChange: { index: number; label?: string };
    /** Fired when the viewport changes (pan, zoom, or animation) */
    viewportChange: { centerX: number; centerY: number; zoom: number; scale: number };
    /** Fired when zoom level changes specifically */
    zoom: { zoom: number; scale: number };
    /** Fired when the renderer is initialized */
    rendererReady: { type: 'webgpu' | 'webgl' | 'canvas2d' };
    /** Fired on any recoverable error */
    error: { message: string; source: string; originalError?: unknown };
    /** Fired when tile loading starts */
    tileLoadStart: { totalPending: number };
    /** Fired when all pending tiles have finished loading */
    tileLoadEnd: void;
    /** Fired when the viewer is destroyed */
    destroy: void;
}

type Listener<T> = T extends void ? () => void : (payload: T) => void;

export class ViewerEventEmitter {
    private listeners = new Map<string, Set<Function>>();

    /**
     * Subscribe to an event.
     * Returns an unsubscribe function for easy cleanup.
     *
     * @example
     * const off = viewer.on('zoom', ({ zoom }) => console.log(zoom));
     * // later:
     * off();
     */
    on<K extends keyof ViewerEventMap>(event: K, listener: Listener<ViewerEventMap[K]>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);

        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(listener);
        };
    }

    /**
     * Subscribe to an event, but only fire once.
     */
    once<K extends keyof ViewerEventMap>(event: K, listener: Listener<ViewerEventMap[K]>): () => void {
        const off = this.on(event, ((...args: any[]) => {
            off();
            (listener as Function)(...args);
        }) as Listener<ViewerEventMap[K]>);
        return off;
    }

    /**
     * Remove all listeners for a specific event, or all events if no event specified.
     */
    off<K extends keyof ViewerEventMap>(event?: K): void {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Emit an event to all registered listeners.
     */
    emit<K extends keyof ViewerEventMap>(
        event: K,
        ...args: ViewerEventMap[K] extends void ? [] : [ViewerEventMap[K]]
    ): void {
        const set = this.listeners.get(event);
        if (!set) return;
        for (const listener of set) {
            try {
                listener(...args);
            } catch (err) {
                console.error(`Error in '${event}' event listener:`, err);
            }
        }
    }
}
